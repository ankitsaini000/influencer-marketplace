"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = exports.markMessageAsRead = exports.getConversation = exports.sendMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, content, attachments } = req.body;
    // Check if receiver exists
    const receiverExists = yield User_1.default.findById(receiverId);
    if (!receiverExists) {
        res.status(404);
        throw new Error('Recipient user not found');
    }
    // Create and save the message
    const message = yield Message_1.default.create({
        senderId: req.user._id,
        receiverId,
        content,
        attachments: attachments || [],
        isRead: false,
    });
    if (message) {
        res.status(201).json(message);
    }
    else {
        res.status(400);
        throw new Error('Failed to send message');
    }
}));
// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getConversation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;
    // Validate the other user exists
    const otherUser = yield User_1.default.findById(otherUserId);
    if (!otherUser) {
        res.status(404);
        throw new Error('User not found');
    }
    // Find messages between the two users
    const messages = yield Message_1.default.find({
        $or: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId },
        ],
    }).sort({ createdAt: 1 }); // Sort from oldest to newest
    res.json(messages);
}));
// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
exports.markMessageAsRead = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield Message_1.default.findById(req.params.messageId);
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
    const updatedMessage = yield message.save();
    res.json(updatedMessage);
}));
// @desc    Get user conversations (list of users with latest message)
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUserId = req.user._id;
    // Find all users the current user has exchanged messages with
    const conversations = yield Message_1.default.aggregate([
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
}));
