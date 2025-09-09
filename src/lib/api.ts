const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get Cognito tokens from localStorage
    const storedTokens = localStorage.getItem('cognitoTokens');
    let idToken = null;
    
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        idToken = tokens.idToken;
      } catch (error) {
        console.error('Failed to parse stored tokens:', error);
      }
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && idToken) {
        try {
          await this.refreshTokens();
          // Retry the request with new token
          const newStoredTokens = localStorage.getItem('cognitoTokens');
          if (newStoredTokens) {
            const newTokens = JSON.parse(newStoredTokens);
            const retryConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newTokens.idToken}`,
              },
            };
            
            const retryResponse = await fetch(url, retryConfig);
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new Error(errorData.error || `HTTP error! status: ${retryResponse.status}`);
            }
            return await retryResponse.json();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear tokens and redirect to login
          localStorage.removeItem('cognitoTokens');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: 'buyer' | 'seller' | 'admin';
  }) {
    return this.request<{ data: { user: Record<string, unknown>; tokens: Record<string, unknown> } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ data: { user: Record<string, unknown>; tokens: Record<string, unknown> } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(data: { refreshToken: string }) {
    return this.request<{ data: { tokens: Record<string, unknown> } }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshTokens() {
    const storedTokens = localStorage.getItem('cognitoTokens');
    if (!storedTokens) {
      throw new Error('No tokens available for refresh');
    }

    const tokens = JSON.parse(storedTokens);
    const response = await this.request<{ data: { tokens: Record<string, unknown> } }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    // Update stored tokens
    localStorage.setItem('cognitoTokens', JSON.stringify(response.data.tokens));
    return response;
  }

  // User endpoints - Commented out since users route was removed for BGMI-only marketplace
  // async getProfile() {
  //   return this.request('/users/profile');
  // }

  // async updateProfile(data: any) {
  //   return this.request('/users/profile', {
  //     method: 'PUT',
  //     body: JSON.stringify(data),
  //   });
  // }

  // async changePassword(data: {
  //   currentPassword: string;
  //   newPassword: string;
  //   confirmPassword: string;
  // }) {
  //   return this.request('/users/change-password', {
  //     method: 'PUT',
  //     body: JSON.stringify(data),
  //   });
  // }

  // BGMI Listing endpoints
  async getBGMIListings(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request(`/bgmi-listings${queryString ? `?${queryString}` : ''}`);
  }

  async getBGMIListingById(id: string) {
    return this.request(`/bgmi-listings/${id}`);
  }

  async searchBGMIListings(params: {
    q?: string;
    rank?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/bgmi-listings/search?${searchParams.toString()}`);
  }

  async getFeaturedBGMIListings() {
    return this.request('/bgmi-listings/featured');
  }

  async createBGMIListing(data: Record<string, unknown>) {
    return this.request('/bgmi-listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBGMIListing(id: string, data: Record<string, unknown>) {
    return this.request(`/bgmi-listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBGMIListing(id: string) {
    return this.request(`/bgmi-listings/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserBGMIListings() {
    return this.request('/bgmi-listings/user/my-listings');
  }

  // Payment endpoints
  async createPaymentIntent(data: {
    accountId: string;
    amount: number;
    currency?: string;
  }) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmPayment(data: {
    paymentIntentId: string;
    accountId: string;
  }) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentHistory() {
    return this.request('/payments/history');
  }

  async getPaymentById(id: string) {
    return this.request(`/payments/${id}`);
  }

  // Message endpoints
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(conversationId: string, page?: number, limit?: number) {
    const params = new URLSearchParams({ conversationId });
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/messages/messages?${params.toString()}`);
  }

  async sendMessage(data: {
    receiverId: string;
    content: string;
    conversationId?: string;
  }) {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(messageIds: string[]) {
    return this.request('/messages/mark-read', {
      method: 'PUT',
      body: JSON.stringify({ messageIds }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
