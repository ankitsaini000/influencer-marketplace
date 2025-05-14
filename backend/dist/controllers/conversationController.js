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
exports.deleteConversation = exports.archiveConversation = exports.createOrGetConversation = exports.getConversationById = exports.getConversations = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
exports.getConversations = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id.toString();
    // Find all conversations where the current user is a participant
    // And that haven't been deleted for this user
    const conversations = yield Conversation_1.default.find({
        participants: userId,
        deletedFor: { $ne: userId }
    })
        .populate('participants', 'fullName email avatar')
        .sort({ lastMessageAt: -1 });
    // Format the response to be more user-friendly
    const formattedConversations = conversations.map(convo => {
        var _a;
        // Get the other participant (not the current user)
        const otherParticipant = convo.participants.find(p => p._id.toString() !== userId);
        return {
            _id: convo._id,
            otherUser: otherParticipant,
            lastMessage: convo.lastMessage,
            lastMessageAt: convo.lastMessageAt,
            unreadCount: convo.unreadCounts.get(userId) || 0,
            isArchived: ((_a = convo.archivedBy) === null || _a === void 0 ? void 0 : _a.includes(userId)) || false
        };
    });
    res.json(formattedConversations);
}));
// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
exports.getConversationById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.user._id.toString();
    const conversationId = req.params.id;
    // Find conversation and verify user is a participant
    const conversation = yield Conversation_1.default.findOne({
        _id: conversationId,
        participants: userId,
        deletedFor: { $ne: userId }
    }).populate('participants', 'fullName email avatar');
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }
    // Get the other participant
    const otherParticipant = conversation.participants.find(p => p._id.toString() !== userId);
    // Get messages for this conversation
    const messages = yield Message_1.default.find({
        conversation: conversationId,
    }).sort({ sentAt: 1 });
    // Format the response
    const formattedConversation = {
        _id: conversation._id,
        otherUser: otherParticipant,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: conversation.unreadCounts.get(userId) || 0,
        isArchived: ((_a = conversation.archivedBy) === null || _a === void 0 ? void 0 : _a.includes(userId)) || false,
        messages
    };
    res.json(formattedConversation);
}));
// @desc    Create or get conversation with another user
// @route   POST /api/conversations
// @access  Private
exports.createOrGetConversation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { otherUserId } = req.body;
    const userId = req.user._id.toString();
    if (!otherUserId) {
        res.status(400);
        throw new Error('Other user ID is required');
    }
    // Verify the other user exists
    const otherUser = yield User_1.default.findById(otherUserId);
    if (!otherUser) {
        res.status(404);
        throw new Error('User not found');
    }
    // Check if conversation already exists between these users
    const existingConversation = yield Conversation_1.default.findOne({
        participants: { $all: [userId, otherUserId] },
        deletedFor: { $ne: userId }
    }).populate('participants', 'fullName email avatar');
    if (existingConversation) {
        // If conversation was deleted for other user, remove them from deletedFor
        if ((_a = existingConversation.deletedFor) === null || _a === void 0 ? void 0 : _a.includes(otherUserId)) {
            yield Conversation_1.default.updateOne({ _id: existingConversation._id }, { $pull: { deletedFor: otherUserId } });
        }
        // Get the other participant
        const otherParticipant = existingConversation.participants.find(p => p._id.toString() !== userId);
        // Format response
        const response = {
            _id: existingConversation._id,
            otherUser: otherParticipant,
            lastMessage: existingConversation.lastMessage,
            lastMessageAt: existingConversation.lastMessageAt,
            unreadCount: existingConversation.unreadCounts.get(userId) || 0,
            isArchived: ((_b = existingConversation.archivedBy) === null || _b === void 0 ? void 0 : _b.includes(userId)) || false,
            isExisting: true
        };
        res.status(200).json(response);
        return;
    }
    // Create new conversation
    const newConversation = yield Conversation_1.default.create({
        participants: [userId, otherUserId],
        lastMessageAt: new Date(),
        unreadCounts: new Map()
    });
    // Populate the participants
    yield newConversation.populate('participants', 'fullName email avatar');
    // Get the other participant
    const otherParticipant = newConversation.participants.find(p => p._id.toString() !== userId);
    // Format response
    const response = {
        _id: newConversation._id,
        otherUser: otherParticipant,
        lastMessageAt: newConversation.lastMessageAt,
        unreadCount: 0,
        isArchived: false,
        isExisting: false
    };
    res.status(201).json(response);
}));
// @desc    Archive/unarchive a conversation
// @route   PUT /api/conversations/:id/archive
// @access  Private
exports.archiveConversation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.user._id.toString();
    const { archive } = req.body; // true to archive, false to unarchive
    const conversationId = req.params.id;
    // Find the conversation
    const conversation = yield Conversation_1.default.findOne({
        _id: conversationId,
        participants: userId,
        deletedFor: { $ne: userId }
    });
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }
    // Update archive status
    if (archive) {
        // Add to archivedBy if not already there
        if (!((_a = conversation.archivedBy) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
            yield Conversation_1.default.updateOne({ _id: conversationId }, { $addToSet: { archivedBy: userId } });
        }
    }
    else {
        // Remove from archivedBy
        yield Conversation_1.default.updateOne({ _id: conversationId }, { $pull: { archivedBy: userId } });
    }
    res.json({
        success: true,
        archived: archive
    });
}));
// @desc    Delete a conversation (soft delete)
// @route   DELETE /api/conversations/:id
// @access  Private
exports.deleteConversation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id.toString();
    const conversationId = req.params.id;
    // Find the conversation
    const conversation = yield Conversation_1.default.findOne({
        _id: conversationId,
        participants: userId,
        deletedFor: { $ne: userId }
    });
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }
    // Add user to deletedFor array
    yield Conversation_1.default.updateOne({ _id: conversationId }, { $addToSet: { deletedFor: userId } });
    res.json({ success: true });
}));
