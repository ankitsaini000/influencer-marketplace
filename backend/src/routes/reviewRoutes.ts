import express from 'express';
import {
  createReview,
  getCreatorReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, createReview);

// @route   GET /api/reviews/:creatorId
// @desc    Get reviews for a creator
// @access  Public
router.get('/:creatorId', getCreatorReviews);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', protect, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, deleteReview);

export default router; 