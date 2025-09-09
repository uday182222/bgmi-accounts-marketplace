import express from 'express';
import { body, query } from 'express-validator';
import { 
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getConversationById
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const sendMessageValidation = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID')
];

const getMessagesValidation = [
  query('conversationId')
    .isUUID()
    .withMessage('Conversation ID must be a valid UUID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const markAsReadValidation = [
  body('messageIds')
    .isArray({ min: 1 })
    .withMessage('Message IDs must be an array with at least one ID'),
  body('messageIds.*')
    .isUUID()
    .withMessage('Each message ID must be a valid UUID')
];

// Routes
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.get('/messages', getMessagesValidation, validate, getMessages);
router.post('/send', sendMessageValidation, validate, sendMessage);
router.put('/mark-read', markAsReadValidation, validate, markAsRead);
router.delete('/:id', deleteMessage);

export default router;
