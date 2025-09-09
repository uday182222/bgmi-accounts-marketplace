import { Router } from 'express';
import { authenticateCognito, authorizeCognito } from '../middleware/cognitoAuth';
import {
  createBGMIListing,
  getBGMIListings,
  getBGMIListingById,
  getUserBGMIListings,
  updateBGMIListing,
  deleteBGMIListing,
  getAllBGMIListingsForAdmin,
  updateBGMIListingStatus
} from '../controllers/bgmiListingController';

const router = Router();

// Public routes (no authentication required)
router.get('/', getBGMIListings); // Get all active listings
router.get('/:id', getBGMIListingById); // Get specific listing

// Protected routes (authentication required)
router.use(authenticateCognito);

// Seller routes
router.post('/', createBGMIListing); // Create new listing
router.get('/user/my-listings', getUserBGMIListings); // Get user's listings
router.put('/:id', updateBGMIListing); // Update user's listing
router.delete('/:id', deleteBGMIListing); // Delete user's listing

// Admin routes
router.get('/admin/all', authorizeCognito('admin'), getAllBGMIListingsForAdmin);
router.put('/admin/:id/status', authorizeCognito('admin'), updateBGMIListingStatus);

export default router;
