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
exports.getConversation = exports.getConversations = exports.markMessagesAsRead = exports.getConversationMessages = exports.sendMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { conversationId, receiverId, content, attachments, type } = req.body;
        const userId = req.user._id.toString();
        // Validate required fields
        if (!receiverId) {
            res.status(400);
            throw new Error('Recipient ID is required');
        }
        // Check if receiver exists
        const receiver = yield User_1.default.findById(receiverId);
        if (!receiver) {
            res.status(404);
            throw new Error('Recipient user not found');
        }
        // Find or create conversation
        let conversation;
        if (conversationId && mongoose_1.default.Types.ObjectId.isValid(conversationId)) {
            // Use existing conversation
            conversation = yield Conversation_1.default.findById(conversationId);
            if (!conversation) {
                res.status(404);
                throw new Error('Conversation not found');
            }
            // Verify user is a participant
            if (!conversation.participants.some(p => p.toString() === userId)) {
                res.status(403);
                throw new Error('Not authorized to send messages in this conversation');
            }
        }
        else {
            // Check if conversation already exists between these users
            conversation = yield Conversation_1.default.findOne({
                participants: { $all: [userId, receiverId] }
            });
            if (!conversation) {
                // Create new conversation
                conversation = yield Conversation_1.default.create({
                    participants: [userId, receiverId],
                    lastMessageAt: new Date()
                });
            }
            // If conversation was soft-deleted for either user, remove them from deletedFor
            if ((_a = conversation.deletedFor) === null || _a === void 0 ? void 0 : _a.length) {
                conversation.deletedFor = conversation.deletedFor.filter(id => id.toString() !== userId && id.toString() !== receiverId);
                yield conversation.save();
            }
        }
        // Create the message
        const message = yield Message_1.default.create({
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
        if ((_b = conversation.archivedBy) === null || _b === void 0 ? void 0 : _b.includes(receiverId)) {
            conversation.archivedBy = conversation.archivedBy.filter(id => id.toString() !== receiverId);
        }
        yield conversation.save();
        res.status(201).json({
            success: true,
            message,
            conversationId: conversation._id
        });
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
}));
// @desc    Get messages for a conversation
// @route   GET /api/messages/conversation/:conversationId
// @access  Private
exports.getConversationMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.conversationId;
    const userId = req.user._id.toString();
    // Verify conversation exists and user is a participant
    const conversation = yield Conversation_1.default.findOne({
        _id: conversationId,
        participants: userId
    });
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found or you do not have access');
    }
    // Get messages
    const messages = yield Message_1.default.find({
        conversation: conversationId
    })
        .sort({ sentAt: 1 })
        .populate('sender', 'fullName avatar');
    res.json(messages);
}));
// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
exports.markMessagesAsRead = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, messageIds } = req.body;
    const userId = req.user._id.toString();
    if (!conversationId) {
        res.status(400);
        throw new Error('Conversation ID is required');
    }
    // Verify conversation exists and user is a participant
    const conversation = yield Conversation_1.default.findOne({
        _id: conversationId,
        participants: userId
    });
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found or you do not have access');
    }
    // Update query based on whether specific message IDs were provided
    const filter = (messageIds === null || messageIds === void 0 ? void 0 : messageIds.length)
        ? { _id: { $in: messageIds }, conversation: conversationId, receiver: userId, isRead: false }
        : { conversation: conversationId, receiver: userId, isRead: false };
    // Mark messages as read
    const result = yield Message_1.default.updateMany(filter, { isRead: true });
    // Reset unread counter for user
    if (conversation.unreadCounts.has(userId)) {
        conversation.unreadCounts.set(userId, 0);
        yield conversation.save();
    }
    res.json({
        success: true,
        count: result.modifiedCount
    });
}));
// @desc    Get conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id.toString();
    // Find all conversations for current user
    const conversations = yield Conversation_1.default.find({
        participants: userId,
        deletedFor: { $ne: userId }
    })
        .populate('participants', 'fullName email avatar')
        .sort({ lastMessageAt: -1 });
    // Format response
    const formattedConversations = conversations.map(convo => {
        // Get the other participant
        const otherParticipant = convo.participants.find(p => p._id.toString() !== userId);
        return {
            _id: convo._id,
            otherUser: otherParticipant,
            lastMessage: convo.lastMessage,
            lastMessageAt: convo.lastMessageAt,
            unreadCount: convo.unreadCounts.get(userId) || 0
        };
    });
    res.json(formattedConversations);
}));
// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getConversation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    // Validate the other user exists
    const otherUser = yield User_1.default.findById(otherUserId);
    if (!otherUser) {
        res.status(404);
        throw new Error('User not found');
    }
    // Find or create conversation between these users
    let conversation = yield Conversation_1.default.findOne({
        participants: { $all: [currentUserId, otherUserId] },
        deletedFor: { $ne: currentUserId }
    });
    if (!conversation) {
        // Create new conversation
        conversation = yield Conversation_1.default.create({
            participants: [currentUserId, otherUserId],
            lastMessageAt: new Date(),
            unreadCounts: new Map()
        });
    }
    // Get messages
    const messages = yield Message_1.default.find({
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
}));
