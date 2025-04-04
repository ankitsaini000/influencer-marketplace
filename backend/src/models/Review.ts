import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  creatorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CreatorProfile'
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
reviewSchema.index({ creatorId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ creatorId: 1, userId: 1 }, { unique: true }); // One review per user per creator

// Middleware to update creator rating when a review is created/updated/deleted
reviewSchema.post('save', async function() {
  await updateCreatorRating(this.creatorId);
});

reviewSchema.post(['findOneAndUpdate'], async function(doc) {
  if (doc) {
    await updateCreatorRating(doc.creatorId);
  }
});

reviewSchema.post('deleteOne', async function() {
  // @ts-ignore - this has document properties in the context
  if (this.creatorId) {
    // @ts-ignore
    await updateCreatorRating(this.creatorId);
  }
});

// Helper function to update creator's average rating
async function updateCreatorRating(creatorId: mongoose.Types.ObjectId) {
  // Get all reviews for this creator
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ creatorId });
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review: any) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  // Update creator profile
  const CreatorProfile = mongoose.model('CreatorProfile');
  await CreatorProfile.findByIdAndUpdate(creatorId, {
    rating: parseFloat(averageRating.toFixed(1)),
    reviews: reviews.length
  });
}

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review; 