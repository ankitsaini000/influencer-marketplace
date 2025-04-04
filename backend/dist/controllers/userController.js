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
exports.checkUsernameAvailability = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const tokenUtils_1 = require("../utils/tokenUtils");
// @desc    Register a new user
// @route   POST /api/users
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Register request received with body:', req.body);
    const { email, password, fullName, username } = req.body;
    if (!email || !password || !fullName) {
        console.log('Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName });
        res.status(400);
        throw new Error('Please provide all required fields: email, password, fullName');
    }
    // Check if user already exists
    const userExists = yield User_1.default.findOne({ email });
    if (userExists) {
        console.log('User already exists with email:', email);
        res.status(400);
        throw new Error('User already exists');
    }
    // Check if username is taken if provided
    if (username) {
        const usernameExists = yield User_1.default.findOne({ username });
        if (usernameExists) {
            console.log('Username already taken:', username);
            res.status(400);
            throw new Error('Username already taken');
        }
    }
    try {
        // Create new user
        console.log('Creating new user with data:', { email, fullName, username });
        const user = yield User_1.default.create({
            email,
            password,
            fullName,
            username,
        });
        if (user) {
            const token = (0, tokenUtils_1.generateToken)(user._id);
            console.log('User created successfully:', { userId: user._id, email: user.email });
            res.status(201).json({
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                avatar: user.avatar,
                token,
            });
        }
        else {
            console.log('Failed to create user - unknown error');
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
    catch (err) {
        console.error('Error creating user:', err);
        res.status(500);
        throw new Error('Server error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
}));
// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Login request received with body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        console.log('Missing required fields:', { email: !!email, password: !!password });
        res.status(400);
        throw new Error('Please provide email and password');
    }
    // Find user by email
    const user = yield User_1.default.findOne({ email });
    console.log('User found:', user ? { userId: user._id, email: user.email } : 'No user found');
    // Check if user exists and password matches
    if (user && (yield user.isValidPassword(password))) {
        const token = (0, tokenUtils_1.generateToken)(user._id);
        console.log('Login successful for user:', { userId: user._id, email: user.email });
        res.json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar,
            token,
        });
    }
    else {
        console.log('Invalid email or password for:', email);
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // User is already attached to request by auth middleware
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
}));
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        user.fullName = req.body.fullName || user.fullName;
        user.email = req.body.email || user.email;
        user.avatar = req.body.avatar || user.avatar;
        // Update username if provided
        if (req.body.username !== undefined) {
            user.username = req.body.username || user.username;
        }
        // Only update password if provided
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            username: updatedUser.username,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token: (0, tokenUtils_1.generateToken)(updatedUser._id),
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
}));
// @desc    Check if username is available
// @route   GET /api/users/check-username/:username
// @access  Public
exports.checkUsernameAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    if (!username) {
        res.status(400);
        throw new Error('Username parameter is required');
    }
    // Check if username follows allowed pattern
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        res.status(200).json({
            available: false,
            message: 'Username can only contain letters, numbers, and underscores'
        });
        return;
    }
    // Check if username exists in database
    const existingUser = yield User_1.default.findOne({ username });
    res.status(200).json({
        available: !existingUser,
        message: existingUser ? 'Username is already taken' : 'Username is available'
    });
}));
