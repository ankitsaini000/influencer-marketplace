import { Request, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import BrandVerification from '../models/BrandVerification';
import User from '../models/User';

// @desc    Submit a brand verification request
// @route   POST /api/brand-verification
// @access  Private (Brand only)
export const submitVerificationRequest = asyncHandler(async (req: Request, res: Response) => {
  const {
    businessName,
    businessWebsite,
    businessEmail,
    businessPhone,
    businessAddress,
    businessType,
    registrationNumber,
    taxId,
    documents,
    socialMediaProfiles,
  } = req.body;

  // Check if user already has a verification request
  const existingRequest = await BrandVerification.findOne({ userId: req.user._id });

  if (existingRequest) {
    // If it's already approved, don't allow new submission
    if (existingRequest.verificationStatus === 'approved') {
      res.status(400);
      throw new Error('Your business is already verified');
    }
    
    // If it's rejected, allow updating
    if (existingRequest.verificationStatus === 'rejected') {
      // Reset status to pending for re-evaluation
      existingRequest.verificationStatus = 'pending';
      existingRequest.rejectionReason = undefined;
      existingRequest.reviewedBy = undefined;
      existingRequest.reviewedAt = undefined;
      
      // Update fields
      existingRequest.businessName = businessName;
      existingRequest.businessWebsite = businessWebsite;
      existingRequest.businessEmail = businessEmail;
      existingRequest.businessPhone = businessPhone;
      existingRequest.businessAddress = businessAddress;
      existingRequest.businessType = businessType;
      existingRequest.registrationNumber = registrationNumber;
      existingRequest.taxId = taxId;
      existingRequest.documents = documents;
      existingRequest.socialMediaProfiles = socialMediaProfiles;
      
      await existingRequest.save();
      
      res.status(200).json({
        success: true,
        message: 'Verification request updated and resubmitted successfully',
        verificationRequest: existingRequest,
      });
      return;
    }
    
    // If it's pending, allow updating
    existingRequest.businessName = businessName;
    existingRequest.businessWebsite = businessWebsite;
    existingRequest.businessEmail = businessEmail;
    existingRequest.businessPhone = businessPhone;
    existingRequest.businessAddress = businessAddress;
    existingRequest.businessType = businessType;
    existingRequest.registrationNumber = registrationNumber;
    existingRequest.taxId = taxId;
    existingRequest.documents = documents;
    existingRequest.socialMediaProfiles = socialMediaProfiles;
    
    await existingRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Verification request updated successfully',
      verificationRequest: existingRequest,
    });
    return;
  }

  // Create new verification request
  const verificationRequest = await BrandVerification.create({
    userId: req.user._id,
    businessName,
    businessWebsite,
    businessEmail,
    businessPhone,
    businessAddress,
    businessType,
    registrationNumber,
    taxId,
    documents,
    socialMediaProfiles,
    verificationStatus: 'pending',
  });

  if (verificationRequest) {
    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationRequest,
    });
  } else {
    res.status(400);
    throw new Error('Invalid verification request data');
  }
});

// @desc    Get verification request details for logged in user
// @route   GET /api/brand-verification
// @access  Private (Brand only)
export const getVerificationRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const verificationRequest = await BrandVerification.findOne({ userId: req.user._id });

  if (!verificationRequest) {
    res.status(404).json({
      success: false,
      message: 'No verification request found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    verificationRequest,
  });
});

// @desc    Get all verification requests (for admin)
// @route   GET /api/brand-verification/all
// @access  Private (Admin only)
export const getAllVerificationRequests = asyncHandler(async (req: Request, res: Response) => {
  // Get status filter from query params
  const status = req.query.status as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = { verificationStatus: status };
  }

  const totalCount = await BrandVerification.countDocuments(query);
  
  const verificationRequests = await BrandVerification.find(query)
    .populate('userId', 'email fullName username avatar')
    .populate('reviewedBy', 'email fullName username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: verificationRequests.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    verificationRequests,
  });
});

// @desc    Get verification request by ID (for admin)
// @route   GET /api/brand-verification/:id
// @access  Private (Admin only)
export const getVerificationRequestById = asyncHandler(async (req: Request, res: Response) => {
  const verificationRequest = await BrandVerification.findById(req.params.id)
    .populate('userId', 'email fullName username avatar')
    .populate('reviewedBy', 'email fullName username');

  if (!verificationRequest) {
    res.status(404);
    throw new Error('Verification request not found');
  }

  res.status(200).json({
    success: true,
    verificationRequest,
  });
});

// @desc    Approve a verification request
// @route   PUT /api/brand-verification/:id/approve
// @access  Private (Admin only)
export const approveVerificationRequest = asyncHandler(async (req: Request, res: Response) => {
  const { notes } = req.body;
  
  const verificationRequest = await BrandVerification.findById(req.params.id);

  if (!verificationRequest) {
    res.status(404);
    throw new Error('Verification request not found');
  }

  // Update verification status
  verificationRequest.verificationStatus = 'approved';
  verificationRequest.notes = notes;
  verificationRequest.reviewedBy = req.user._id;
  verificationRequest.reviewedAt = new Date();

  await verificationRequest.save();

  // Update user isVerified status
  await User.findByIdAndUpdate(
    verificationRequest.userId,
    { isVerified: true },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Verification request approved successfully',
    verificationRequest,
  });
});

// @desc    Reject a verification request
// @route   PUT /api/brand-verification/:id/reject
// @access  Private (Admin only)
export const rejectVerificationRequest = asyncHandler(async (req: Request, res: Response) => {
  const { rejectionReason, notes } = req.body;

  if (!rejectionReason) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }

  const verificationRequest = await BrandVerification.findById(req.params.id);

  if (!verificationRequest) {
    res.status(404);
    throw new Error('Verification request not found');
  }

  // Update verification status
  verificationRequest.verificationStatus = 'rejected';
  verificationRequest.rejectionReason = rejectionReason;
  verificationRequest.notes = notes;
  verificationRequest.reviewedBy = req.user._id;
  verificationRequest.reviewedAt = new Date();

  await verificationRequest.save();

  res.status(200).json({
    success: true,
    message: 'Verification request rejected successfully',
    verificationRequest,
  });
});

// @desc    Check verification status
// @route   GET /api/brand-verification/status
// @access  Private
export const checkVerificationStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const verificationRequest = await BrandVerification.findOne({ userId: req.user._id });

  // User hasn't submitted a verification request yet
  if (!verificationRequest) {
    res.status(200).json({
      success: true,
      isVerified: false,
      status: 'not_submitted',
      message: 'No verification request has been submitted',
    });
    return;
  }

  // Return current status
  res.status(200).json({
    success: true,
    isVerified: verificationRequest.verificationStatus === 'approved',
    status: verificationRequest.verificationStatus,
    message: verificationRequest.verificationStatus === 'approved' 
      ? 'Your business is verified' 
      : verificationRequest.verificationStatus === 'rejected'
      ? `Verification rejected: ${verificationRequest.rejectionReason}`
      : 'Verification is pending review',
    verificationRequest,
  });
}); 