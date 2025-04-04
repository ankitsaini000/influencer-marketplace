import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Message from '../models/Message';
import User from '../models/User';

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { receiverId, content, attachments } = req.body;

  // Check if receiver exists
  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) {
    res.status(404);
    throw new Error('Recipient user not found');
  }

  // Create and save the message
  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    content,
    attachments: attachments || [],
    isRead: false,
  });

  if (message) {
    res.status(201).json(message);
  } else {
    res.status(400);
    throw new Error('Failed to send message');
  }
});

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id;

  // Validate the other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Find messages between the two users
  const messages = await Message.find({
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  }).sort({ createdAt: 1 }); // Sort from oldest to newest

  res.json(messages);
});

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
export const markMessageAsRead = asyncHandler(async (req: Request, res: Response) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if the user is the recipient of the message
  if (message.receiverId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to mark this message as read');
  }

  // Mark as read and save
  message.isRead = true;
  const updatedMessage = await message.save();

  res.json(updatedMessage);
});

// @desc    Get user conversations (list of users with latest message)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user._id;

  // Find all users the current user has exchanged messages with
  const conversations = await Message.aggregate([
    {
      // Match messages where the current user is sender or receiver
      $match: {
        $or: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
    },
    {
      // Group by the other user
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', currentUserId] },
            '$receiverId',
            '$senderId',
          ],
        },
        lastMessage: { $last: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiverId', currentUserId] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      // Sort by the latest message time
      $sort: { 'lastMessage.createdAt': -1 },
    },
    {
      // Lookup user details
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      // Reshape the output
      $project: {
        _id: 1,
        user: { $arrayElemAt: ['$user', 0] },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      // Project only needed user fields
      $project: {
        _id: 1,
        user: {
          _id: 1,
          fullName: 1,
          avatar: 1,
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
  ]);

  res.json(conversations);
}); 