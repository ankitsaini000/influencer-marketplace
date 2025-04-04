import express from 'express';
import {
  sendMessage,
  getConversation,
  markMessageAsRead,
  getConversations
} from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get user conversations (list of users with latest message)
// @access  Private
router.get('/conversations', protect, getConversations);

// @route   GET /api/messages/:userId
// @desc    Get conversation between two users
// @access  Private
router.get('/:userId', protect, getConversation);

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', protect, markMessageAsRead);

export default router; 