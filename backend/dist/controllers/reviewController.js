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
exports.deleteReview = exports.updateReview = exports.getCreatorReviews = exports.createReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Review_1 = __importDefault(require("../models/Review"));
const CreatorProfile_1 = require("../models/CreatorProfile");
// Helper function to update creator rating after deletion
const updateCreatorRatingAfterDelete = (creatorId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all reviews for this creator
    const reviews = yield Review_1.default.find({ creatorId });
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    // Update creator profile
    yield CreatorProfile_1.CreatorProfile.findByIdAndUpdate(creatorId, {
        rating: parseFloat(averageRating.toFixed(1)),
        reviews: reviews.length
    });
});
// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { creatorId, rating, comment } = req.body;
    // Verify the creator exists
    const creatorExists = yield CreatorProfile_1.CreatorProfile.findById(creatorId);
    if (!creatorExists) {
        res.status(404);
        throw new Error('Creator profile not found');
    }
    // Check if user already left a review for this creator
    const existingReview = yield Review_1.default.findOne({
        creatorId,
        userId: req.user._id,
    });
    if (existingReview) {
        res.status(400);
        throw new Error('You have already reviewed this creator');
    }
    // Create the review
    const review = yield Review_1.default.create({
        creatorId,
        userId: req.user._id,
        rating,
        comment,
    });
    if (review) {
        res.status(201).json(review);
    }
    else {
        res.status(400);
        throw new Error('Failed to create review');
    }
}));
// @desc    Get reviews for a creator
// @route   GET /api/reviews/:creatorId
// @access  Public
exports.getCreatorReviews = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatorId = req.params.creatorId;
    // Verify the creator exists
    const creatorExists = yield CreatorProfile_1.CreatorProfile.findById(creatorId);
    if (!creatorExists) {
        res.status(404);
        throw new Error('Creator profile not found');
    }
    const reviews = yield Review_1.default.find({ creatorId })
        .populate('userId', 'fullName avatar')
        .sort({ createdAt: -1 });
    res.json(reviews);
}));
// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    // Check if the user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this review');
    }
    // Update fields
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    const updatedReview = yield review.save();
    res.json(updatedReview);
}));
// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    // Check if the user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }
    // Capture creatorId to update ratings after deletion
    const creatorId = review.creatorId;
    // Delete the review
    yield Review_1.default.deleteOne({ _id: req.params.id });
    // Manually call the update rating function
    yield updateCreatorRatingAfterDelete(creatorId);
    res.json({ message: 'Review removed' });
}));
