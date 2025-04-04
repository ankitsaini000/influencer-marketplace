"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth_1.protect, reviewController_1.createReview);
// @route   GET /api/reviews/:creatorId
// @desc    Get reviews for a creator
// @access  Public
router.get('/:creatorId', reviewController_1.getCreatorReviews);
// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth_1.protect, reviewController_1.updateReview);
// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth_1.protect, reviewController_1.deleteReview);
exports.default = router;
