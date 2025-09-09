import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { s3Service } from '../services/s3Service';
import { kmsService } from '../services/kmsService';
import multer from 'multer';

// Mock account data - in real app, this would come from database
const accounts: any[] = [];

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const accountData = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate required fields
    const requiredFields = ['game', 'username', 'level', 'price', 'credentials'];
    for (const field of requiredFields) {
      if (!accountData[field]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    // Encrypt credentials
    const { encryptedCredentials, dataKey } = await kmsService().encryptCredentials(accountData.credentials);

    // Create new account
    const newAccount = {
      id: Date.now().toString(),
      game: accountData.game,
      username: accountData.username,
      level: parseInt(accountData.level),
      rank: accountData.rank || '',
      items: accountData.items || [],
      price: parseFloat(accountData.price),
      description: accountData.description || '',
      images: [], // Will be populated after image upload
      encryptedCredentials,
      dataKey,
      sellerId: userId,
      status: 'pending_verification', // New listings need verification
      verificationStatus: 'pending',
      verificationNotes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    accounts.push(newAccount);

    res.status(201).json({
      success: true,
      message: 'Account listing created successfully. Pending admin verification.',
      data: { 
        account: {
          id: newAccount.id,
          game: newAccount.game,
          username: newAccount.username,
          level: newAccount.level,
          rank: newAccount.rank,
          price: newAccount.price,
          status: newAccount.status,
          verificationStatus: newAccount.verificationStatus,
          createdAt: newAccount.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Sort accounts
    const sortedAccounts = [...accounts].sort((a, b) => {
      const aValue = a[sortBy as string];
      const bValue = b[sortBy as string];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const paginatedAccounts = sortedAccounts.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        accounts: paginatedAccounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: accounts.length,
          pages: Math.ceil(accounts.length / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const account = accounts.find(a => a.id === id);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    res.json({
      success: true,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const accountIndex = accounts.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      throw new AppError('Account not found', 404);
    }

    // Check if user owns the account
    if (accounts[accountIndex].sellerId !== userId) {
      throw new AppError('Not authorized to update this account', 403);
    }

    // Update account
    accounts[accountIndex] = {
      ...accounts[accountIndex],
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: { account: accounts[accountIndex] }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const accountIndex = accounts.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      throw new AppError('Account not found', 404);
    }

    // Check if user owns the account
    if (accounts[accountIndex].sellerId !== userId) {
      throw new AppError('Not authorized to delete this account', 403);
    }

    // Delete account
    accounts.splice(accountIndex, 1);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const searchAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, game, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;

    let filteredAccounts = [...accounts];

    // Apply filters
    if (q) {
      const searchTerm = (q as string).toLowerCase();
      filteredAccounts = filteredAccounts.filter(account =>
        account.title.toLowerCase().includes(searchTerm) ||
        account.description.toLowerCase().includes(searchTerm) ||
        account.game.toLowerCase().includes(searchTerm)
      );
    }

    if (game) {
      filteredAccounts = filteredAccounts.filter(account =>
        account.game.toLowerCase() === (game as string).toLowerCase()
      );
    }

    if (minPrice) {
      filteredAccounts = filteredAccounts.filter(account =>
        account.price >= parseFloat(minPrice as string)
      );
    }

    if (maxPrice) {
      filteredAccounts = filteredAccounts.filter(account =>
        account.price <= parseFloat(maxPrice as string)
      );
    }

    // Sort
    filteredAccounts.sort((a, b) => {
      const aValue = a[sortBy as string];
      const bValue = b[sortBy as string];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    const paginatedAccounts = filteredAccounts.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        accounts: paginatedAccounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredAccounts.length,
          pages: Math.ceil(filteredAccounts.length / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get featured accounts (mock data)
    const featuredAccounts = accounts.slice(0, 6);

    res.json({
      success: true,
      data: { accounts: featuredAccounts }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const userAccounts = accounts.filter(account => account.sellerId === userId);

    res.json({
      success: true,
      data: { accounts: userAccounts }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAccountImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { accountId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!accountId) {
      throw new AppError('Missing required parameter: accountId', 400);
    }

    // Find the account
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Check if user owns the account
    if (account.sellerId !== userId) {
      throw new AppError('Not authorized to upload images for this account', 403);
    }

    // Handle file uploads
    upload.array('images', 10)(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return next(new AppError('No images provided', 400));
      }

      try {
        // Upload images to S3
        const imageUrls = await s3Service().uploadMultipleImages(
          files.map(file => ({
            file: file.buffer,
            key: s3Service().generateKey('accounts/images', file.originalname, userId),
            contentType: file.mimetype
          }))
        );

        // Update account with image URLs
        account.images = [...(account.images || []), ...imageUrls];
        account.updatedAt = new Date();

        res.json({
          success: true,
          message: 'Images uploaded successfully',
          data: { 
            images: imageUrls,
            totalImages: account.images.length
          }
        });
      } catch (uploadError) {
        next(uploadError);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAccountCredentials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { accountId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Find the account
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Check if user owns the account or is admin
    if (account.sellerId !== userId && req.user?.role !== 'admin') {
      throw new AppError('Not authorized to access credentials', 403);
    }

    // Decrypt credentials
    const credentials = await kmsService().decryptCredentials(
      account.encryptedCredentials,
      account.dataKey
    );

    res.json({
      success: true,
      data: { credentials }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accountId } = req.params;
    const { status, notes } = req.body;

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    // Find the account
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Update verification status
    account.verificationStatus = status;
    account.verificationNotes = notes || '';
    account.verifiedAt = new Date();
    account.verifiedBy = req.user.id;

    if (status === 'approved') {
      account.status = 'active';
    } else if (status === 'rejected') {
      account.status = 'rejected';
    }

    account.updatedAt = new Date();

    res.json({
      success: true,
      message: `Account ${status} successfully`,
      data: { 
        account: {
          id: account.id,
          verificationStatus: account.verificationStatus,
          status: account.status,
          verificationNotes: account.verificationNotes,
          verifiedAt: account.verifiedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
