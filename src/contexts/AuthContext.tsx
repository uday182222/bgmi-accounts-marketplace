'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  tokens: CognitoTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: 'buyer' | 'seller' | 'admin';
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<CognitoTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens?.idToken;

  useEffect(() => {
    // Check for existing tokens on mount
    const storedTokens = localStorage.getItem('cognitoTokens');
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        // Optionally verify token and fetch user profile
        fetchUserProfile();
      } catch (error) {
        console.error('Failed to parse stored tokens:', error);
        localStorage.removeItem('cognitoTokens');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // TODO: Implement user profile fetching when user endpoints are added back
      // const response = await apiClient.getProfile();
      // setUser(response.data.user);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Tokens might be invalid, clear them
      localStorage.removeItem('cognitoTokens');
      setTokens(null);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password }) as unknown as { data: { user: User; tokens: CognitoTokens } };
      
      const { user: userData, tokens: cognitoTokens } = response.data;
      
      setUser(userData);
      setTokens(cognitoTokens);
      localStorage.setItem('cognitoTokens', JSON.stringify(cognitoTokens));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: 'buyer' | 'seller' | 'admin';
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(data) as unknown as { data: { user: User; tokens: CognitoTokens } };
      
      const { user: userData, tokens: cognitoTokens } = response.data;
      
      setUser(userData);
      setTokens(cognitoTokens);
      localStorage.setItem('cognitoTokens', JSON.stringify(cognitoTokens));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('cognitoTokens');
    
    // Call logout endpoint
    apiClient.logout().catch(console.error);
  };

  const refreshTokens = async () => {
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.refreshToken({ refreshToken: tokens.refreshToken }) as unknown as { data: { tokens: CognitoTokens } };
      const newTokens = response.data.tokens;
      
      setTokens(newTokens);
      localStorage.setItem('cognitoTokens', JSON.stringify(newTokens));
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // TODO: Implement profile update when user endpoints are added back
      // const response = await apiClient.updateProfile(data);
      // setUser(response.data.user);
      console.log('Profile update not implemented yet:', data);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
