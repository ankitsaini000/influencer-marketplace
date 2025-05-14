import mongoose from 'mongoose';

const brandVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessWebsite: {
      type: String,
      required: true,
    },
    businessEmail: {
      type: String,
      required: true,
    },
    businessPhone: {
      type: String,
      required: true,
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    businessType: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
    },
    taxId: {
      type: String,
    },
    documents: {
      businessRegistration: String,
      taxDocument: String,
      identityProof: String,
      additionalDocuments: [String],
    },
    socialMediaProfiles: {
      instagram: String,
      facebook: String,
      twitter: String,
      linkedin: String,
      tiktok: String,
      youtube: String,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    notes: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
brandVerificationSchema.index({ userId: 1 });
brandVerificationSchema.index({ verificationStatus: 1 });
brandVerificationSchema.index({ businessName: 1 });

const BrandVerification = mongoose.model('BrandVerification', brandVerificationSchema);

export default BrandVerification; 