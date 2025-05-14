import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Promotion from '../models/Promotion';
import User from '../models/User';
import { CreatorProfile } from '../models/CreatorProfile';

/**
 * @desc    Create a new promotion
 * @route   POST /api/promotions
 * @access  Private (brands only)
 */
export const createPromotion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Create promotion request received with body:', req.body);

    // Validate brand role
    if (req.user.role !== 'brand') {
      res.status(403);
      throw new Error('Only brands can create promotions');
    }

    // Extract data from request body
    const {
      title,
      description,
      budget,
      category,
      platform,
      deadline,
      promotionType,
      deliverables,
      tags,
      requirements,
      status = 'draft',
    } = req.body;

    // Validate required fields
    if (!title || !description || !budget || !category || !platform || !deadline || !promotionType) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Create new promotion
    const promotion = await Promotion.create({
      brandId: req.user._id,
      title,
      description,
      budget,
      category,
      platform,
      deadline: new Date(deadline),
      promotionType,
      deliverables: deliverables || [],
      tags: tags || [],
      requirements: requirements || '',
      status
    });

    if (promotion) {
      console.log('Promotion created successfully:', { promotionId: promotion._id });
      res.status(201).json({
        success: true,
        data: promotion
      });
    } else {
      console.log('Failed to create promotion - unknown error');
      res.status(400);
      throw new Error('Invalid promotion data');
    }
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Get all promotions
 * @route   GET /api/promotions
 * @access  Public
 */
export const getPromotions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { status: 'active' };

    // Apply category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Apply platform filter if provided
    if (req.query.platform) {
      filter.platform = req.query.platform;
    }

    // Apply tag filter if provided
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // Count total documents for pagination
    const total = await Promotion.countDocuments(filter);
    
    // Get promotions
    const promotions = await Promotion.find(filter)
      .populate('brandId', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Returning ${promotions.length} promotions for page ${page}`);
    
    res.status(200).json({
      success: true,
      data: promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting promotions:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Get a single promotion by ID
 * @route   GET /api/promotions/:id
 * @access  Public
 */
export const getPromotionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const promotionId = req.params.id;

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(promotionId)) {
      res.status(400);
      throw new Error('Invalid promotion ID format');
    }

    // Find promotion
    const promotion = await Promotion.findById(promotionId)
      .populate('brandId', 'fullName username avatar');

    if (!promotion) {
      res.status(404);
      throw new Error('Promotion not found');
    }

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Error getting promotion:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Update a promotion
 * @route   PUT /api/promotions/:id
 * @access  Private (brand owner only)
 */
export const updatePromotion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const promotionId = req.params.id;

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(promotionId)) {
      res.status(400);
      throw new Error('Invalid promotion ID format');
    }

    // Find promotion
    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
      res.status(404);
      throw new Error('Promotion not found');
    }

    // Check if user owns the promotion
    if (promotion.brandId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this promotion');
    }

    // Update promotion
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPromotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Delete a promotion
 * @route   DELETE /api/promotions/:id
 * @access  Private (brand owner only)
 */
export const deletePromotion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const promotionId = req.params.id;

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(promotionId)) {
      res.status(400);
      throw new Error('Invalid promotion ID format');
    }

    // Find promotion
    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
      res.status(404);
      throw new Error('Promotion not found');
    }

    // Check if user owns the promotion
    if (promotion.brandId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this promotion');
    }

    // Delete promotion
    await Promotion.findByIdAndDelete(promotionId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Get promotions by brand ID
 * @route   GET /api/promotions/brand
 * @access  Private (brand only)
 */
export const getBrandPromotions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional status filter
    const filter: any = { brandId: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Count total documents for pagination
    const total = await Promotion.countDocuments(filter);
    
    // Get promotions
    const promotions = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting brand promotions:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Publish a promotion (change status to active)
 * @route   PUT /api/promotions/:id/publish
 * @access  Private (brand owner only)
 */
export const publishPromotion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const promotionId = req.params.id;

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(promotionId)) {
      res.status(400);
      throw new Error('Invalid promotion ID format');
    }

    // Find promotion
    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
      res.status(404);
      throw new Error('Promotion not found');
    }

    // Check if user owns the promotion
    if (promotion.brandId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to publish this promotion');
    }

    // Update promotion status to active
    const publishedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      { status: 'active' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: publishedPromotion
    });
  } catch (error) {
    console.error('Error publishing promotion:', error);
    res.status(500);
    throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Check and update promotion statuses based on deadlines
 * @route   Not directly exposed as API - for internal use
 * @access  Private (system only)
 */
export const checkAndUpdatePromotionStatuses = async () => {
  try {
    console.log('Running scheduled task to check promotion deadlines');
    
    // Get current date
    const now = new Date();
    
    // Find all active promotions with deadlines in the past
    const expiredPromotions = await Promotion.find({
      status: 'active',
      deadline: { $lt: now }
    });
    
    console.log(`Found ${expiredPromotions.length} expired promotions to close`);
    
    // Update each expired promotion to 'closed' status
    const updatePromises = expiredPromotions.map(promotion => 
      Promotion.findByIdAndUpdate(
        promotion._id,
        { status: 'closed' },
        { new: true }
      )
    );
    
    // Wait for all updates to complete
    const updatedPromotions = await Promise.all(updatePromises);
    
    console.log('Successfully closed expired promotions:', 
      updatedPromotions
        .filter(p => p !== null)
        .map(p => ({ id: p._id, title: p.title }))
    );
    
    return {
      success: true,
      closedCount: updatedPromotions.length,
      promotions: updatedPromotions
    };
  } catch (error) {
    console.error('Error checking and updating promotion statuses:', error);
    throw error;
  }
}; 