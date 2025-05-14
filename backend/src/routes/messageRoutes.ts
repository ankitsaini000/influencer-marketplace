import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  getConversationMessages,
  markMessagesAsRead
} from '../controllers/messageController';
import { protect } from '../middleware/auth';
import Message from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Simple test route that doesn't need a controller
router.get('/simple-test', (req, res) => {
  res.json({ success: true, message: 'Message routes are accessible' });
});

// @route   GET /api/messages/test
// @desc    Test route to verify message endpoints are working
// @access  Public
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Message routes are working correctly' });
});

// @route   GET /api/messages
// @desc    Get all messages for the current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Find all messages where the current user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    }).sort({ createdAt: -1 }); // Sort from newest to oldest
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/messages/test-send
// @desc    Test sending a message without authentication
// @access  Public (for testing only)
router.post('/test-send', async (req, res) => {
  try {
    const { receiverId, content, senderEmail } = req.body;
    
    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide receiverId and content' 
      });
    }
    
    // Validate receiverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid receiverId format' 
      });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient user not found' 
      });
    }
    
    // For testing, either use the provided senderEmail to find a user or create a mock ID
    let senderId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    
    if (senderEmail) {
      const sender = await User.findOne({ email: senderEmail });
      if (sender) {
        senderId = sender._id as unknown as mongoose.Types.ObjectId;
      }
    }
    
    // Create a test message
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      isRead: false
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Test message sent successfully',
      data: message
    });
  } catch (error: any) {
    console.error('Error in test-send:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error sending test message'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get user conversations (list of users with latest message)
// @access  Private
router.get('/conversations', protect, getConversations);

// @route   GET /api/messages/conversation/:conversationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get('/conversation/:conversationId', protect, getConversationMessages);

// @route   GET /api/messages/:userId
// @desc    Get conversation with a specific user
// @access  Private
router.get('/:userId', protect, getConversation);

// @route   PUT /api/messages/read
// @desc    Mark messages as read
// @access  Private
router.put('/read', protect, markMessagesAsRead);

export default router; 