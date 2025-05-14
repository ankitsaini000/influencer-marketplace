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
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
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
router.get('/', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all messages where the current user is either sender or receiver
        const messages = yield Message_1.default.find({
            $or: [
                { senderId: req.user._id },
                { receiverId: req.user._id }
            ]
        }).sort({ createdAt: -1 }); // Sort from newest to oldest
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching all messages:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}));
// @route   POST /api/messages/test-send
// @desc    Test sending a message without authentication
// @access  Public (for testing only)
router.post('/test-send', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!mongoose_1.default.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid receiverId format'
            });
        }
        // Check if receiver exists
        const receiver = yield User_1.default.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Recipient user not found'
            });
        }
        // For testing, either use the provided senderEmail to find a user or create a mock ID
        let senderId = new mongoose_1.default.Types.ObjectId();
        if (senderEmail) {
            const sender = yield User_1.default.findOne({ email: senderEmail });
            if (sender) {
                senderId = sender._id;
            }
        }
        // Create a test message
        const message = yield Message_1.default.create({
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
    }
    catch (error) {
        console.error('Error in test-send:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error sending test message'
        });
    }
}));
// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth_1.protect, messageController_1.sendMessage);
// @route   GET /api/messages/conversations
// @desc    Get user conversations (list of users with latest message)
// @access  Private
router.get('/conversations', auth_1.protect, messageController_1.getConversations);
// @route   GET /api/messages/conversation/:conversationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get('/conversation/:conversationId', auth_1.protect, messageController_1.getConversationMessages);
// @route   GET /api/messages/:userId
// @desc    Get conversation with a specific user
// @access  Private
router.get('/:userId', auth_1.protect, messageController_1.getConversation);
// @route   PUT /api/messages/read
// @desc    Mark messages as read
// @access  Private
router.put('/read', auth_1.protect, messageController_1.markMessagesAsRead);
exports.default = router;
