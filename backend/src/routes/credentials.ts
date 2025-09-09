import { Router } from 'express';
import { credentialController } from '../controllers/credentialController';
import { authenticateCognito } from '../middleware/cognitoAuth';

const router = Router();

// All credential routes require authentication
router.use(authenticateCognito);

/**
 * @route POST /api/credentials/submit
 * @desc Submit credentials for a listing (seller only)
 * @access Private (Seller)
 */
router.post('/submit', credentialController.submitCredentials);

/**
 * @route GET /api/credentials/:listingId
 * @desc Retrieve credentials for admin testing (admin only)
 * @access Private (Admin)
 */
router.get('/:listingId', credentialController.retrieveCredentials);

/**
 * @route POST /api/credentials/:listingId/test
 * @desc Test credentials (admin only)
 * @access Private (Admin)
 */
router.post('/:listingId/test', credentialController.testCredentials);

/**
 * @route DELETE /api/credentials/:listingId
 * @desc Deactivate credentials after safe period (admin only)
 * @access Private (Admin)
 */
router.delete('/:listingId', credentialController.deactivateCredentials);

/**
 * @route GET /api/credentials/:listingId/logs
 * @desc Get credential access logs (admin only)
 * @access Private (Admin)
 */
router.get('/:listingId/logs', credentialController.getAccessLogs);

export default router;
