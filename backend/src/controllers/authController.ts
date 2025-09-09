import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import { cognitoService } from '../services/cognitoService';
import { googleOAuthService } from '../services/googleOAuthService';
import { users, addUser, findUserByEmail, updateUser, MockUser } from '../data/mockUsers';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName, phone, role } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // Validate role
    const validRoles = ['buyer', 'seller', 'admin'];
    const userRole = role || 'buyer';
    if (!validRoles.includes(userRole)) {
      throw new AppError('Invalid role. Must be buyer, seller, or admin', 400);
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    try {
      // Try to create user in Cognito first
      const userData = {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        role: userRole,
      };

      const user = await cognitoService().createUser(userData);

      // Get real Cognito tokens after user creation
      const cognitoTokens = await cognitoService().authenticateUserAfterCreation(email, password);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.username,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
          },
          tokens: {
            idToken: cognitoTokens.idToken,
            accessToken: cognitoTokens.accessToken,
            refreshToken: cognitoTokens.refreshToken,
            tokenType: cognitoTokens.tokenType,
            expiresIn: cognitoTokens.expiresIn,
          },
        },
      });
    } catch (cognitoError: any) {
      // No fallback to mock authentication - use real Cognito only
      console.error('Cognito registration failed:', cognitoError.message);
      throw cognitoError;
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Use real Cognito authentication
    const cognitoTokens = await cognitoService().authenticateUser({ email, password });

    // Get user info from Cognito
    const user = await cognitoService().getUser(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user,
        tokens: {
          idToken: cognitoTokens.idToken,
          accessToken: cognitoTokens.accessToken,
          refreshToken: cognitoTokens.refreshToken,
          tokenType: cognitoTokens.tokenType,
          expiresIn: cognitoTokens.expiresIn,
        },
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // In a real app, you would invalidate the token here
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // Find user
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new access token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
      return;
    }

    // In a real app, you would send an email with reset link here
    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    // In a real app, you would verify the reset token here
    // For now, we'll just update the password for the first user
    if (users.length > 0 && users[0]) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateUser(users[0].id, { 
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authUrl = googleOAuthService().getGoogleAuthUrl();
    
    res.json({
      success: true,
      message: 'Google auth URL generated',
      data: {
        authUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw new AppError('Google ID token is required', 400);
    }

    // Verify Google token
    const googleUser = await googleOAuthService().verifyGoogleToken(idToken);
    
    // Authenticate or create user
    const authResult = await googleOAuthService().authenticateOrCreateUser(googleUser);

    res.json({
      success: true,
      message: authResult.isNewUser ? 'User created and authenticated successfully' : 'User authenticated successfully',
      data: {
        user: {
          id: authResult.user.id,
          username: authResult.user.email,
          email: authResult.user.email,
          firstName: authResult.user.given_name,
          lastName: authResult.user.family_name,
          picture: authResult.user.picture,
          role: 'buyer', // Default role for Google users
          isVerified: authResult.user.verified_email,
          createdAt: new Date().toISOString(),
        },
        tokens: authResult.cognitoTokens,
        isNewUser: authResult.isNewUser,
      }
    });
  } catch (error) {
    next(error);
  }
};
