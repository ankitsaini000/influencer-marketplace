"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth_1.protect, messageController_1.sendMessage);
// @route   GET /api/messages/conversations
// @desc    Get user conversations (list of users with latest message)
// @access  Private
router.get('/conversations', auth_1.protect, messageController_1.getConversations);
// @route   GET /api/messages/:userId
// @desc    Get conversation between two users
// @access  Private
router.get('/:userId', auth_1.protect, messageController_1.getConversation);
// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', auth_1.protect, messageController_1.markMessageAsRead);
exports.default = router;
