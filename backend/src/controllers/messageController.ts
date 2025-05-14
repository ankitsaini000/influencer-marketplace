import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';
import mongoose from 'mongoose';

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { conversationId, receiverId, content, attachments, type } = req.body;
    const userId = req.user._id.toString();

    // Validate required fields
    if (!receiverId) {
      res.status(400);
      throw new Error('Recipient ID is required');
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404);
      throw new Error('Recipient user not found');
    }

    // Find or create conversation
    let conversation;

    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      // Use existing conversation
      conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
      }
      
      // Verify user is a participant
      if (!conversation.participants.some(p => p.toString() === userId)) {
        res.status(403);
        throw new Error('Not authorized to send messages in this conversation');
      }
    } else {
      // Check if conversation already exists between these users
      conversation = await Conversation.findOne({
        participants: { $all: [userId, receiverId] }
      });

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create({
          participants: [userId, receiverId],
          lastMessageAt: new Date()
        });
      }

      // If conversation was soft-deleted for either user, remove them from deletedFor
      if (conversation.deletedFor?.length) {
        conversation.deletedFor = conversation.deletedFor.filter(
          id => id.toString() !== userId && id.toString() !== receiverId
        );
        await conversation.save();
      }
    }

    // Create the message
    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      receiver: receiverId,
      content,
      attachments: attachments || [],
      type: type || 'text',
      isRead: false,
      sentAt: new Date()
    });

    // Update conversation with latest message
    conversation.lastMessage = content || `${type || 'text'} message`;
    conversation.lastMessageAt = new Date();
    
    // Update unread counter for receiver
    const currentUnread = conversation.unreadCounts.get(receiverId) || 0;
    conversation.unreadCounts.set(receiverId, currentUnread + 1);
    
    // If conversation was archived by receiver, unarchive it
    if (conversation.archivedBy?.includes(receiverId)) {
      conversation.archivedBy = conversation.archivedBy.filter(
        id => id.toString() !== receiverId
      );
    }
    
    await conversation.save();

    res.status(201).json({
      success: true,
      message,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversation/:conversationId
// @access  Private
export const getConversationMessages = asyncHandler(async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId;
  const userId = req.user._id.toString();

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found or you do not have access');
  }

  // Get messages
  const messages = await Message.find({
    conversation: conversationId
  })
    .sort({ sentAt: 1 })
    .populate('sender', 'fullName avatar');

  res.json(messages);
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
export const markMessagesAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId, messageIds } = req.body;
  const userId = req.user._id.toString();

  if (!conversationId) {
    res.status(400);
    throw new Error('Conversation ID is required');
  }

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found or you do not have access');
  }

  // Update query based on whether specific message IDs were provided
  const filter = messageIds?.length 
    ? { _id: { $in: messageIds }, conversation: conversationId, receiver: userId, isRead: false } 
    : { conversation: conversationId, receiver: userId, isRead: false };

  // Mark messages as read
  const result = await Message.updateMany(filter, { isRead: true });

  // Reset unread counter for user
  if (conversation.unreadCounts.has(userId)) {
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();
  }

  res.json({
    success: true,
    count: result.modifiedCount
  });
});

// @desc    Get conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id.toString();

  // Find all conversations for current user
  const conversations = await Conversation.find({
    participants: userId,
    deletedFor: { $ne: userId }
  })
    .populate('participants', 'fullName email avatar')
    .sort({ lastMessageAt: -1 });

  // Format response
  const formattedConversations = conversations.map(convo => {
    // Get the other participant
    const otherParticipant = convo.participants.find(
      p => p._id.toString() !== userId
    );

    return {
      _id: convo._id,
      otherUser: otherParticipant,
      lastMessage: convo.lastMessage,
      lastMessageAt: convo.lastMessageAt,
      unreadCount: convo.unreadCounts.get(userId) || 0
    };
  });

  res.json(formattedConversations);
});

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id.toString();

  // Validate the other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find or create conversation between these users
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, otherUserId] },
    deletedFor: { $ne: currentUserId }
  });

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [currentUserId, otherUserId],
      lastMessageAt: new Date(),
      unreadCounts: new Map()
    });
  }

  // Get messages
  const messages = await Message.find({
    conversation: conversation._id
  }).sort({ sentAt: 1 });

  // Format response
  const response = {
    conversationId: conversation._id,
    otherUser: {
      _id: otherUser._id,
      fullName: otherUser.fullName,
      email: otherUser.email,
      avatar: otherUser.avatar
    },
    messages,
    unreadCount: conversation.unreadCounts.get(currentUserId) || 0
  };

  res.json(response);
}); 