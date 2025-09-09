import express from 'express';
import { body } from 'express-validator';
import { 
  createPaymentIntent,
  confirmPayment,
  getTransactionHistory,
  createRefund,
  getTransactionById,
  createCustomer,
  getPaymentMethods,
  createSetupIntent,
  handleWebhook
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Webhook endpoint (no authentication required)
router.post('/webhook', handleWebhook);

// All other routes require authentication
router.use(authenticate);

// Validation rules
const createPaymentIntentValidation = [
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isIn(['usd', 'inr', 'eur'])
    .withMessage('Currency must be one of: usd, inr, eur')
];

const confirmPaymentValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment Intent ID is required')
];

const refundValidation = [
  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Refund reason must be less than 500 characters')
];

const createCustomerValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
];

// Routes
router.post('/create-intent', createPaymentIntentValidation, validate, createPaymentIntent);
router.post('/confirm', confirmPaymentValidation, validate, confirmPayment);
router.post('/refund', refundValidation, validate, createRefund);
router.get('/history', getTransactionHistory);
router.get('/transaction/:transactionId', getTransactionById);
router.post('/customer', createCustomerValidation, validate, createCustomer);
router.get('/customer/:customerId/payment-methods', getPaymentMethods);
router.post('/setup-intent', createSetupIntent);

export default router;
