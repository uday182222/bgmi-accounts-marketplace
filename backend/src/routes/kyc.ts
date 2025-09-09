import express from 'express';
import { body, param, query } from 'express-validator';
import {
  uploadKYCDocument,
  submitKYCApplication,
  getKYCStatus,
  getKYCDocument,
  deleteKYCDocument,
  getKYCApplicationsForReview,
  reviewKYCApplication,
  generateDocumentDownloadUrl,
  upload,
} from '../controllers/kycController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// Validation rules
const uploadDocumentValidation = [
  body('type')
    .isIn(['id_front', 'id_back', 'selfie', 'proof_of_address'])
    .withMessage('Invalid document type'),
];

const submitKYCValidation = [
  body('personalInfo.firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('personalInfo.lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('personalInfo.dateOfBirth')
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('personalInfo.address')
    .notEmpty()
    .withMessage('Address is required'),
  body('personalInfo.city')
    .notEmpty()
    .withMessage('City is required'),
  body('personalInfo.state')
    .notEmpty()
    .withMessage('State is required'),
  body('personalInfo.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('personalInfo.country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-letter code'),
  body('documents')
    .isArray({ min: 1 })
    .withMessage('At least one document is required'),
  body('documents.*.type')
    .isIn(['id_front', 'id_back', 'selfie', 'proof_of_address'])
    .withMessage('Invalid document type in documents array'),
  body('documents.*.fileId')
    .notEmpty()
    .withMessage('File ID is required for each document'),
];

const reviewKYCValidation = [
  body('decision')
    .isIn(['approved', 'rejected'])
    .withMessage('Decision must be "approved" or "rejected"'),
  body('rejectionReason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
];

const generateDownloadUrlValidation = [
  body('expiresIn')
    .optional()
    .isInt({ min: 300, max: 86400 })
    .withMessage('Expires in must be between 300 and 86400 seconds'),
];

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/upload', upload.single('file'), uploadDocumentValidation, validate, uploadKYCDocument);
router.post('/submit', submitKYCValidation, validate, submitKYCApplication);
router.get('/status', getKYCStatus);
router.get('/document/:userId/:documentId', getKYCDocument);
router.delete('/document/:userId/:documentId', deleteKYCDocument);

// Admin routes
router.get('/admin/applications', getKYCApplicationsForReview);
router.post('/admin/review/:applicationId', reviewKYCValidation, validate, reviewKYCApplication);
router.post('/admin/document/:targetUserId/:documentId/download-url', generateDownloadUrlValidation, validate, generateDocumentDownloadUrl);

export default router;
