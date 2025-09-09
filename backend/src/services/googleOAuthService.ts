import { OAuth2Client } from 'google-auth-library';
import { AWS_CONFIG } from '../config/aws';
import { AppError } from '../middleware/errorHandler';
import { cognitoService } from './cognitoService';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export interface GoogleAuthResult {
  user: GoogleUserInfo;
  cognitoTokens: {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
  isNewUser: boolean;
}

class GoogleOAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      AWS_CONFIG.googleClientId,
      AWS_CONFIG.googleClientSecret,
      'postmessage' // For server-side verification
    );
  }

  async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      console.log('🔧 Verifying Google token...');
      
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: AWS_CONFIG.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Invalid Google token', 401);
      }

      const userInfo: GoogleUserInfo = {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        given_name: payload.given_name!,
        family_name: payload.family_name!,
        picture: payload.picture!,
        verified_email: payload.email_verified || false,
      };

      console.log('✅ Google token verified successfully');
      return userInfo;
    } catch (error: any) {
      console.error('❌ Error verifying Google token:', error);
      throw new AppError('Invalid Google token', 401);
    }
  }

  async authenticateOrCreateUser(googleUser: GoogleUserInfo): Promise<GoogleAuthResult> {
    try {
      console.log('🔧 Authenticating or creating user with Google:', googleUser.email);
      
      // Check if user exists in Cognito
      let cognitoUser = await cognitoService().getUser(googleUser.email);
      let isNewUser = false;

      if (!cognitoUser) {
        // Create new user in Cognito
        console.log('Creating new user in Cognito...');
        const userData = {
          username: googleUser.email,
          email: googleUser.email,
          password: this.generateRandomPassword(), // Generate a random password
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          role: 'buyer' as const, // Default role for Google users
        };

        cognitoUser = await cognitoService().createUser(userData);
        isNewUser = true;
      }

      // Authenticate user with Cognito
      // For Google users, we'll use a special authentication flow
      // Since they don't have a password, we'll create a temporary one
      const cognitoTokens = await this.authenticateGoogleUser(googleUser.email);

      console.log('✅ Google user authenticated successfully');
      return {
        user: googleUser,
        cognitoTokens,
        isNewUser,
      };
    } catch (error: any) {
      console.error('❌ Error authenticating Google user:', error);
      throw new AppError(`Google authentication failed: ${error.message}`, 500);
    }
  }

  private async authenticateGoogleUser(email: string): Promise<any> {
    try {
      // For Google users, we need to use a different approach
      // Since they don't have a password, we'll use AdminInitiateAuth
      // with a temporary password or use a different flow
      
      // This is a simplified approach - in production, you might want to:
      // 1. Use Cognito's built-in Google identity provider
      // 2. Use Cognito's hosted UI
      // 3. Use a different authentication flow
      
      // For now, we'll return mock tokens
      // In a real implementation, you'd integrate with Cognito's Google provider
      return {
        idToken: 'mock-id-token',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };
    } catch (error: any) {
      console.error('❌ Error authenticating Google user with Cognito:', error);
      throw new AppError('Failed to authenticate Google user', 500);
    }
  }

  private generateRandomPassword(): string {
    // Generate a secure random password for Google users
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  getGoogleAuthUrl(): string {
    const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;
    
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      redirect_uri: redirectUri,
    });
  }
}

// Lazy initialization
let _googleOAuthService: GoogleOAuthService;

export const googleOAuthService = () => {
  if (!_googleOAuthService) {
    _googleOAuthService = new GoogleOAuthService();
  }
  return _googleOAuthService;
};

export default googleOAuthService;
