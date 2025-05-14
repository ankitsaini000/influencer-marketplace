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
exports.socketAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User"));
const socketAuth = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get token from handshake query or auth header
        const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        if (!decoded || !decoded.id) {
            return next(new Error('Authentication error: Invalid token'));
        }
        // Find user
        const user = yield User_1.default.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }
        // Create simplified user object for socket
        const socketUser = {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar || undefined,
            role: user.role
        };
        // Attach user to socket
        socket.user = socketUser;
        next();
    }
    catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
});
exports.socketAuth = socketAuth;
