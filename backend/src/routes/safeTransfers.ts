import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createSafeTransfer,
  getTransferById,
  getTransfersForUser,
  getTransferChecks,
  getTransferAlerts,
  acknowledgeAlert,
  getAllActiveTransfers,
  getTransferStatistics,
  completeTransferEarly,
  failTransfer,
} from '../controllers/safeTransferController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Validation rules
const createSafeTransferValidation = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required'),
  body('buyerId')
    .notEmpty()
    .withMessage('Buyer ID is required'),
  body('sellerId')
    .notEmpty()
    .withMessage('Seller ID is required'),
  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required'),
  body('encryptedCredentials')
    .notEmpty()
    .withMessage('Encrypted credentials are required'),
  body('dataKey')
    .notEmpty()
    .withMessage('Data key is required'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 168 }) // 1 hour to 1 week
    .withMessage('Duration must be between 1 and 168 hours'),
];

const failTransferValidation = [
  body('reason')
    .notEmpty()
    .isLength({ min: 10, max: 500 })
    .withMessage('Failure reason must be between 10 and 500 characters'),
];

const getTransfersValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'active', 'completed', 'failed', 'disputed'])
    .withMessage('Invalid status filter'),
];

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', createSafeTransferValidation, validate, createSafeTransfer);
router.get('/my-transfers', getTransfersValidation, validate, getTransfersForUser);
router.get('/:transferId', getTransferById);
router.get('/:transferId/checks', getTransferChecks);
router.get('/:transferId/alerts', getTransferAlerts);
router.post('/:transferId/alerts/:alertId/acknowledge', acknowledgeAlert);

// Admin routes
router.get('/admin/active', getAllActiveTransfers);
router.get('/admin/statistics', getTransferStatistics);
router.post('/admin/:transferId/complete', completeTransferEarly);
router.post('/admin/:transferId/fail', failTransferValidation, validate, failTransfer);

export default router;
