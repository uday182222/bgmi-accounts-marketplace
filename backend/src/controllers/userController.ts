import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler';
import { users, findUserById, updateUser, deleteUser } from '../data/mockUsers';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cognitoId = req.user?.cognitoId;
    
    if (!cognitoId) {
      throw new AppError('User not authenticated', 401);
    }

    // TODO: Lookup user in database by cognitoId
    // For now, we'll use a mock response since we don't have a real database yet
    // In production, this would be:
    // const user = await db.query('SELECT * FROM users WHERE cognito_id = $1', [cognitoId]);
    
    // Mock user data for now
    const user = {
      cognitoId: cognitoId,
      email: req.user?.email || '',
      username: req.user?.id || '',
      role: req.user?.role || 'buyer',
      firstName: '',
      lastName: '',
      phone: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!user) {
      throw new AppError('User profile not found in database.', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Update user
    const updatedUser = updateUser(userId, updates);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Find user
    const user = findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    updateUser(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Delete user
    const deleted = deleteUser(userId);
    if (!deleted) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Mock stats - in real app, this would come from database
    const stats = {
      totalAccounts: 0,
      totalSales: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalReviews: 0
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    // Find user
    const user = findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Remove sensitive information
    const { password, email, ...publicProfile } = user;

    res.json({
      success: true,
      data: { user: publicProfile }
    });
  } catch (error) {
    next(error);
  }
};
