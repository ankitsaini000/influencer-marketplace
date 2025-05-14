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
exports.default = setupMessageHandlers;
const Message_1 = __importDefault(require("../../models/Message"));
const Conversation_1 = __importDefault(require("../../models/Conversation"));
const mongoose_1 = __importDefault(require("mongoose"));
function setupMessageHandlers(io, socket) {
    if (!socket.user) {
        console.error('Unauthenticated socket attempted to set up message handlers');
        socket.disconnect();
        return;
    }
    // Now we know socket.user is defined
    const currentUser = socket.user;
    const userId = currentUser._id;
    // Join a conversation room
    const joinConversation = (_a) => __awaiter(this, [_a], void 0, function* ({ conversationId }) {
        try {
            // Verify the conversation exists and user is a participant
            const conversation = yield Conversation_1.default.findById(conversationId);
            if (!conversation) {
                socket.emit('error', { message: 'Conversation not found' });
                return;
            }
            // Check if user is a participant
            if (!conversation.participants.some(p => p.toString() === userId)) {
                socket.emit('error', { message: 'Not authorized to join this conversation' });
                return;
            }
            // Join the room
            socket.join(conversationId);
            console.log(`User ${userId} joined conversation: ${conversationId}`);
            socket.emit('join-success', { conversationId });
        }
        catch (error) {
            console.error('Join conversation error:', error);
            socket.emit('error', { message: 'Failed to join conversation' });
        }
    });
    // Send a message
    const sendMessage = (payload) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { conversationId, receiverId, content, attachments, type } = payload;
            if (!conversationId || !receiverId) {
                socket.emit('error', { message: 'Missing required fields' });
                return;
            }
            // Get or create conversation
            let conversation;
            if (mongoose_1.default.Types.ObjectId.isValid(conversationId)) {
                // Existing conversation
                conversation = yield Conversation_1.default.findById(conversationId);
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }
                // Verify user is part of the conversation
                if (!conversation.participants.some(p => p.toString() === userId)) {
                    socket.emit('error', { message: 'Not authorized to send message in this conversation' });
                    return;
                }
            }
            else {
                // Create new conversation
                conversation = yield Conversation_1.default.create({
                    participants: [userId, receiverId],
                    lastMessageAt: new Date(),
                    unreadCounts: new Map([[receiverId, 1]])
                });
            }
            // Create message
            const message = yield Message_1.default.create({
                conversation: conversation._id,
                sender: userId,
                receiver: receiverId,
                content,
                attachments,
                type: type || 'text',
                isRead: false,
                sentAt: new Date()
            });
            // Update conversation with last message
            conversation.lastMessage = content || `${type} message`;
            conversation.lastMessageAt = new Date();
            // Increment unread count for receiver
            const currentUnread = conversation.unreadCounts.get(receiverId) || 0;
            conversation.unreadCounts.set(receiverId, currentUnread + 1);
            yield conversation.save();
            const conversationId_string = conversation._id.toString();
            // Emit to room (includes sender for confirmation)
            io.to(conversationId_string).emit('receive-message', {
                message: Object.assign(Object.assign({}, message.toObject()), { senderName: currentUser.fullName, senderAvatar: currentUser.avatar })
            });
            // Also emit to receiver specifically (in case they're not in the room)
            socket.to(receiverId).emit('new-message-notification', {
                conversationId: conversationId_string,
                message: Object.assign(Object.assign({}, message.toObject()), { senderName: currentUser.fullName, senderAvatar: currentUser.avatar })
            });
            socket.emit('message-sent', { success: true, messageId: message._id });
        }
        catch (error) {
            console.error('Send message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
    // Mark messages as read
    const markRead = (_a) => __awaiter(this, [_a], void 0, function* ({ conversationId, messageIds }) {
        try {
            if (!conversationId) {
                socket.emit('error', { message: 'Conversation ID required' });
                return;
            }
            // Verify conversation exists and user is participant
            const conversation = yield Conversation_1.default.findById(conversationId);
            if (!conversation) {
                socket.emit('error', { message: 'Conversation not found' });
                return;
            }
            if (!conversation.participants.some(p => p.toString() === userId)) {
                socket.emit('error', { message: 'Not authorized for this conversation' });
                return;
            }
            // Update messages as read
            const filter = (messageIds === null || messageIds === void 0 ? void 0 : messageIds.length)
                ? { _id: { $in: messageIds }, conversation: conversationId, receiver: userId }
                : { conversation: conversationId, receiver: userId, isRead: false };
            const result = yield Message_1.default.updateMany(filter, { isRead: true });
            // Reset unread counter for user
            if (conversation.unreadCounts.has(userId)) {
                conversation.unreadCounts.set(userId, 0);
                yield conversation.save();
            }
            // Notify other participants that messages were read
            socket.to(conversationId).emit('messages-read', {
                conversationId,
                readBy: userId,
                count: result.modifiedCount
            });
            socket.emit('mark-read-success', {
                conversationId,
                count: result.modifiedCount
            });
        }
        catch (error) {
            console.error('Mark read error:', error);
            socket.emit('error', { message: 'Failed to mark messages as read' });
        }
    });
    // Register event handlers for this socket
    socket.on('join-conversation', joinConversation);
    socket.on('send-message', sendMessage);
    socket.on('mark-read', markRead);
    // Handle user status (optional enhancement)
    socket.join(userId); // Join personal room for direct notifications
    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
    });
}
