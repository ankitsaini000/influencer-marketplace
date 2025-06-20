import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import PromotionApplication from '../models/PromotionApplication';
import Promotion from '../models/Promotion';
import { CreatorProfile } from '../models/CreatorProfile';
import User from '../models/User';

/**
 * @desc    Apply to a promotion
 * @route   POST /api/promotion-applications
 * @access  Private (creators only)
 */
export const applyToPromotion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Application request received with body:', req.body);

    // Validate creator role
    if (req.user.role !== 'creator') {
      res.status(403);
      throw new Error('Only creators can apply to promotions');
    }

    // Extract data from request body
    const {
      promotionId,
      message,
      proposedRate,
      availability,
      deliverables,
      portfolio
    } = req.body;

    // Validate required fields
    if (!promotionId || !message || !proposedRate || !availability) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(promotionId)) {
      res.status(400);
      throw new Error('Invalid promotion ID format');
    }

    // Check if promotion exists and is active
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      res.status(404);
      throw new Error('Promotion not found');
    }

    if (promotion.status !== 'active') {
      res.status(400);
      throw new Error('This promotion is not currently accepting applications');
    }

    // Check if creator has already applied to this promotion
    const existingApplication = await PromotionApplication.findOne({
      promotionId,
      creatorId: req.user._id
    });

    if (existingApplication) {
      res.status(400);
      throw new Error('You have already applied to this promotion');
    }

    // Create new application
    const application = await PromotionApplication.create({
      promotionId,
      creatorId: req.user._id,
      message,
      proposedRate,
      availability,
      deliverables: deliverables || '',
      portfolio: portfolio || [],
      status: 'pending'
    });

    if (application) {
      console.log('Application created successfully:', { applicationId: application._id });
      
      // Add application to promotion's applications array
      await Promotion.findByIdAndUpdate(
        promotionId,
        { $push: { applications: application._id } }
      );

      res.status(201).json({
        success: true,
        data: application
      });
    } else {
      console.log('Failed to create application - unknown error');
      res.status(400);
      throw new Error('Invalid application data');
    }
  } catch (error) {
    console.error('Error creating application:', error);
    
    // Handle duplicate key error (already applied)
    if ((error as any).code === 11000) {
      res.status(400);
      throw new Error('You have already applied to this promotion');
    }
    
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Get applications for a promotion
 * @route   GET /api/promotion-applications/promotion/:promotionId
 * @access  Private (brand owner only)
 */
export const getPromotionApplications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { promotionId } = req.params;
    
    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(promotionId)) {
      res.status(400);
      throw new Error('Invalid promotion ID format');
    }

    // Check if promotion exists and belongs to the requesting brand
    const promotion = await Promotion.findById(promotionId);
    
    if (!promotion) {
      res.status(404);
      throw new Error('Promotion not found');
    }

    if (promotion.brandId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view applications for this promotion');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional status filter
    const filter: any = { promotionId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Count total documents for pagination
    const total = await PromotionApplication.countDocuments(filter);
    
    // Get applications with populated creator profile data
    const applications = await PromotionApplication.find(filter)
      .populate({
        path: 'creatorId',
        select: 'fullName username avatar _id',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get creator profiles for these users
    const creatorIds = applications.map(app => app.creatorId._id);
    const creatorProfiles = await CreatorProfile.find({ 
      userId: { $in: creatorIds } 
    }).lean();
    
    // Create a lookup map for faster access
    const profileMap: Record<string, any> = {};
    creatorProfiles.forEach(profile => {
      if (profile.userId) {
        profileMap[profile.userId.toString()] = profile;
      }
    });
    
    // Merge creator profile data with applications
    const enhancedApplications = applications.map(app => {
      // Convert to plain object for manipulation
      const appObj = app.toObject ? app.toObject() : app;
      
      // Handle type casting for TypeScript
      const creatorId = appObj.creatorId as any;
      const userId = creatorId._id.toString();
      
      if (profileMap[userId]) {
        // Add profile data to the creatorId object
        creatorId.personalInfo = profileMap[userId].personalInfo;
      }
      
      return appObj;
    });

    res.status(200).json({
      success: true,
      data: enhancedApplications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting promotion applications:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Update application status (accept/reject)
 * @route   PUT /api/promotion-applications/:id/status
 * @access  Private (brand owner only)
 */
export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid application ID format');
    }

    // Get application
    const application = await PromotionApplication.findById(id);
    
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Check if user owns the promotion
    const promotion = await Promotion.findById(application.promotionId);
    
    if (!promotion) {
      res.status(404);
      throw new Error('Associated promotion not found');
    }

    if (promotion.brandId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this application');
    }

    // Update application status
    const updatedApplication = await PromotionApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Get creator's applications
 * @route   GET /api/promotion-applications/creator
 * @access  Private (creator only)
 */
export const getCreatorApplications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate creator role
    if (req.user.role !== 'creator') {
      res.status(403);
      throw new Error('Only creators can access their applications');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional status filter
    const filter: any = { creatorId: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Count total documents for pagination
    const total = await PromotionApplication.countDocuments(filter);
    
    // Get applications
    const applications = await PromotionApplication.find(filter)
      .populate({
        path: 'promotionId',
        select: 'title budget platform deadline status',
        populate: {
          path: 'brandId',
          select: 'fullName username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting creator applications:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Get a single application by ID
 * @route   GET /api/promotion-applications/:id
 * @access  Private (brand owner or application creator)
 */
export const getApplicationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid application ID format');
    }

    // Get application with populated fields
    const application = await PromotionApplication.findById(id)
      .populate('creatorId', 'fullName username avatar')
      .populate({
        path: 'promotionId',
        populate: {
          path: 'brandId',
          select: 'fullName username avatar'
        }
      });
    
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Check if user is authorized (brand owner or the creator)
    const promotion = await Promotion.findById(application.promotionId);
    
    if (!promotion) {
      res.status(404);
      throw new Error('Associated promotion not found');
    }

    const isCreator = application.creatorId._id.toString() === req.user._id.toString();
    const isBrandOwner = promotion.brandId.toString() === req.user._id.toString();

    if (!isCreator && !isBrandOwner) {
      res.status(403);
      throw new Error('Not authorized to view this application');
    }

    // Get creator profile information
    const creatorProfile = await CreatorProfile.findOne({ 
      userId: application.creatorId._id 
    }).lean();
    
    // Convert to a manipulable object
    const responseData = application.toObject();
    
    // Add creator profile data if available
    if (creatorProfile) {
      (responseData.creatorId as any).personalInfo = creatorProfile.personalInfo;
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}); 