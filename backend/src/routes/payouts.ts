import express from 'express';
import { body, param, query } from 'express-validator';
import {
  addPayoutMethod,
  getPayoutMethods,
  setDefaultPayoutMethod,
  removePayoutMethod,
  createPayout,
  getPayoutHistory,
  getPayoutSummary,
  getPayoutById,
  cancelPayout,
  getPayoutSettings,
  handleStripeWebhook,
} from '../controllers/payoutController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Validation rules
const addPayoutMethodValidation = [
  body('type')
    .isIn(['bank_account', 'paypal', 'stripe_connect'])
    .withMessage('Invalid payout method type'),
  body('details')
    .isObject()
    .withMessage('Details must be an object'),
  body('details.bankName')
    .if(body('type').equals('bank_account'))
    .notEmpty()
    .withMessage('Bank name is required for bank account'),
  body('details.accountNumber')
    .if(body('type').equals('bank_account'))
    .notEmpty()
    .withMessage('Account number is required for bank account'),
  body('details.routingNumber')
    .if(body('type').equals('bank_account'))
    .notEmpty()
    .withMessage('Routing number is required for bank account'),
  body('details.accountHolderName')
    .if(body('type').equals('bank_account'))
    .notEmpty()
    .withMessage('Account holder name is required for bank account'),
  body('details.paypalEmail')
    .if(body('type').equals('paypal'))
    .isEmail()
    .withMessage('Valid PayPal email is required for PayPal'),
];

const createPayoutValidation = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required'),
  body('accountValue')
    .isFloat({ min: 0.01 })
    .withMessage('Account value must be a positive number'),
  body('accountTitle')
    .notEmpty()
    .withMessage('Account title is required'),
];

const getPayoutHistoryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

// Webhook endpoint (no authentication required)
router.post('/webhook', handleStripeWebhook);

// Public settings endpoint
router.get('/settings', getPayoutSettings);

// All other routes require authentication
router.use(authenticate);

// Payout method routes
router.post('/methods', addPayoutMethodValidation, validate, addPayoutMethod);
router.get('/methods', getPayoutMethods);
router.put('/methods/:payoutMethodId/default', setDefaultPayoutMethod);
router.delete('/methods/:payoutMethodId', removePayoutMethod);

// Payout routes
router.post('/', createPayoutValidation, validate, createPayout);
router.get('/history', getPayoutHistoryValidation, validate, getPayoutHistory);
router.get('/summary', getPayoutSummary);
router.get('/:payoutId', getPayoutById);
router.delete('/:payoutId', cancelPayout);

export default router;
