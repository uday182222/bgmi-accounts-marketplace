import express from 'express';
import { body, query } from 'express-validator';
import { 
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  searchAccounts,
  getFeaturedAccounts,
  getUserAccounts,
  uploadAccountImages,
  getAccountCredentials,
  verifyAccount
} from '../controllers/accountController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Validation rules
const createAccountValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('game')
    .notEmpty()
    .withMessage('Game is required'),
  body('rank')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Rank must be less than 50 characters'),
  body('level')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be less than 30 characters')
];

const updateAccountValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('game')
    .optional()
    .notEmpty()
    .withMessage('Game cannot be empty'),
  body('rank')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Rank must be less than 50 characters'),
  body('level')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be less than 30 characters')
];

const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('game')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Game filter must be less than 50 characters'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('sortBy')
    .optional()
    .isIn(['price', 'createdAt', 'title', 'rating'])
    .withMessage('Sort by must be one of: price, createdAt, title, rating'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Public routes
router.get('/', searchValidation, validate, getAccounts);
router.get('/featured', getFeaturedAccounts);
router.get('/search', searchValidation, validate, searchAccounts);
router.get('/:id', getAccountById);

// Protected routes
router.use(authenticate);

router.post('/', createAccountValidation, validate, createAccount);
router.put('/:id', updateAccountValidation, validate, updateAccount);
router.delete('/:id', deleteAccount);
router.get('/user/my-accounts', getUserAccounts);

// Image upload endpoint
router.post('/:accountId/images', uploadAccountImages);

// Credentials access (owner or admin only)
router.get('/:id/credentials', getAccountCredentials);

// Admin verification endpoint
router.post('/:accountId/verify', verifyAccount);

export default router;
