import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Review from '../models/Review';
import { CreatorProfile, ICreatorProfile } from '../models/CreatorProfile';
import mongoose from 'mongoose';

// Helper function to update creator rating after deletion
const updateCreatorRatingAfterDelete = async (creatorId: mongoose.Types.ObjectId) => {
  // Get all reviews for this creator
  const reviews = await Review.find({ creatorId });
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  // Update creator profile
  await CreatorProfile.findByIdAndUpdate(creatorId, {
    rating: parseFloat(averageRating.toFixed(1)),
    reviews: reviews.length
  });
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { creatorId, rating, comment } = req.body;

  // Verify the creator exists
  const creatorExists = await CreatorProfile.findById(creatorId);
  if (!creatorExists) {
    res.status(404);
    throw new Error('Creator profile not found');
  }

  // Check if user already left a review for this creator
  const existingReview = await Review.findOne({
    creatorId,
    userId: req.user._id,
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this creator');
  }

  // Create the review
  const review = await Review.create({
    creatorId,
    userId: req.user._id,
    rating,
    comment,
  });

  if (review) {
    res.status(201).json(review);
  } else {
    res.status(400);
    throw new Error('Failed to create review');
  }
});

// @desc    Get reviews for a creator
// @route   GET /api/reviews/:creatorId
// @access  Public
export const getCreatorReviews = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.params.creatorId;
  
  // Verify the creator exists
  const creatorExists = await CreatorProfile.findById(creatorId);
  if (!creatorExists) {
    res.status(404);
    throw new Error('Creator profile not found');
  }

  const reviews = await Review.find({ creatorId })
    .populate('userId', 'fullName avatar')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);

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

  const updatedReview = await review.save();
  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);

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
  await Review.deleteOne({ _id: req.params.id });
  
  // Manually call the update rating function
  await updateCreatorRatingAfterDelete(creatorId);

  res.json({ message: 'Review removed' });
}); 