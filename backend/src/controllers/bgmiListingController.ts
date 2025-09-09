import { Request, Response, NextFunction } from 'express';
import { bgmiListingService } from '../services/bgmiListingService';
import { 
  createBGMIListingSchema, 
  updateBGMIListingSchema, 
  bgmiListingQuerySchema 
} from '../models/bgmiListing';
import { AppError } from '../middleware/errorHandler';

export const createBGMIListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = createBGMIListingSchema.parse(req.body);
    
    // Get seller info from authenticated user
    const sellerId = req.user?.cognitoId;
    const sellerEmail = req.user?.email;
    const sellerUsername = req.user?.username;

    if (!sellerId || !sellerEmail || !sellerUsername) {
      throw new AppError('User information not found', 401);
    }

    // Create the listing
    const listing = await bgmiListingService.createListing(
      validatedData,
      sellerId,
      sellerEmail,
      sellerUsername
    );

    res.status(201).json({
      success: true,
      message: 'BGMI listing created successfully',
      data: { listing }
    });
  } catch (error: any) {
    console.error('❌ Error in createBGMIListing:', error);
    next(error);
  }
};

export const getBGMIListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate query parameters
    const query = bgmiListingQuerySchema.parse(req.query);
    
    // Get listings
    const result = await bgmiListingService.getListings(query);

    res.json({
      success: true,
      message: 'BGMI listings fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('❌ Error in getBGMIListings:', error);
    next(error);
  }
};

export const getBGMIListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Listing ID is required', 400);
    }

    const listing = await bgmiListingService.getListingById(id);

    if (!listing) {
      throw new AppError('BGMI listing not found', 404);
    }

    res.json({
      success: true,
      message: 'BGMI listing fetched successfully',
      data: { listing }
    });
  } catch (error: any) {
    console.error('❌ Error in getBGMIListingById:', error);
    next(error);
  }
};

export const getUserBGMIListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sellerId = req.user?.cognitoId;

    if (!sellerId) {
      throw new AppError('User information not found', 401);
    }

    const listings = await bgmiListingService.getUserListings(sellerId);

    res.json({
      success: true,
      message: 'User BGMI listings fetched successfully',
      data: { listings }
    });
  } catch (error: any) {
    console.error('❌ Error in getUserBGMIListings:', error);
    next(error);
  }
};

export const updateBGMIListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.cognitoId;

    if (!id) {
      throw new AppError('Listing ID is required', 400);
    }

    if (!sellerId) {
      throw new AppError('User information not found', 401);
    }

    // Validate request body
    const validatedData = updateBGMIListingSchema.parse(req.body);

    const updatedListing = await bgmiListingService.updateListing(
      id,
      validatedData,
      sellerId
    );

    if (!updatedListing) {
      throw new AppError('BGMI listing not found or unauthorized', 404);
    }

    res.json({
      success: true,
      message: 'BGMI listing updated successfully',
      data: { listing: updatedListing }
    });
  } catch (error: any) {
    console.error('❌ Error in updateBGMIListing:', error);
    next(error);
  }
};

export const deleteBGMIListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.cognitoId;

    if (!id) {
      throw new AppError('Listing ID is required', 400);
    }

    if (!sellerId) {
      throw new AppError('User information not found', 401);
    }

    const deleted = await bgmiListingService.deleteListing(id, sellerId);

    if (!deleted) {
      throw new AppError('BGMI listing not found or unauthorized', 404);
    }

    res.json({
      success: true,
      message: 'BGMI listing deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error in deleteBGMIListing:', error);
    next(error);
  }
};

// Admin methods
export const getAllBGMIListingsForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    const listings = await bgmiListingService.getAllListingsForAdmin();

    res.json({
      success: true,
      message: 'All BGMI listings fetched successfully',
      data: { listings }
    });
  } catch (error: any) {
    console.error('❌ Error in getAllBGMIListingsForAdmin:', error);
    next(error);
  }
};

export const updateBGMIListingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isVerified } = req.body;

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    if (!id) {
      throw new AppError('Listing ID is required', 400);
    }

    if (!status || !['active', 'sold', 'pending', 'rejected'].includes(status)) {
      throw new AppError('Valid status is required', 400);
    }

    const updatedListing = await bgmiListingService.updateListingStatus(
      id,
      status,
      isVerified || false
    );

    if (!updatedListing) {
      throw new AppError('BGMI listing not found', 404);
    }

    res.json({
      success: true,
      message: 'BGMI listing status updated successfully',
      data: { listing: updatedListing }
    });
  } catch (error: any) {
    console.error('❌ Error in updateBGMIListingStatus:', error);
    next(error);
  }
};
