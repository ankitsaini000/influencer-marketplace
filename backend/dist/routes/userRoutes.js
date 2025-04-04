"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   POST /api/users
// @desc    Register a new user
// @access  Public
router.post('/', userController_1.registerUser);
// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post('/login', userController_1.loginUser);
// @route   GET /api/users/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', userController_1.checkUsernameAvailability);
// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth_1.protect, userController_1.getUserProfile);
// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.protect, userController_1.updateUserProfile);
exports.default = router;
