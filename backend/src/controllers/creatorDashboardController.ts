import { Request, Response, NextFunction } from 'express';
// Use require for asyncHandler to avoid TypeScript import issues
const asyncHandler = require('express-async-handler');
import mongoose from 'mongoose';
import CreatorMetrics from '../models/CreatorMetrics';
import { CreatorProfile } from '../models/CreatorProfile';
import Order from '../models/Order';
import PromotionRevenue from '../models/PromotionRevenue';
import Payment from '../models/Payment';
import Message from '../models/Message';

// Extend Request interface to include user property
interface RequestWithUser extends Request {
  user: {
    _id: mongoose.Types.ObjectId;
    role: string;
    [key: string]: any;
  };
}

/**
 * @desc    Get creator dashboard data
 * @route   GET /api/creators/dashboard
 * @access  Private
 */
export const getCreatorDashboard = asyncHandler(async (req: RequestWithUser, res: Response) => {
  // Get creator ID from authenticated user
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can access dashboard data');
  }
  
  try {
    // Step 1: Get creator profile for metrics and social media data
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }
    
    // Step 2: Extract profile metrics
    const profileViews = creatorProfile.metrics?.profileViews || 0;
    const profileCompleteness = creatorProfile.metrics?.profileCompleteness || 0;
    const averageResponseTime = creatorProfile.metrics?.averageResponseTime || 0;
    const ratingsData = creatorProfile.metrics?.ratings || { average: 0, count: 0 };
    const projectsCompleted = creatorProfile.metrics?.projectsCompleted || 0;
    
    // Step 3: Extract social media data
    const socialMedia = creatorProfile.socialMedia || {};
    const totalSocialFollowers = socialMedia.totalReach || 0;
    
    // Step 4: Get payments data to calculate total earnings
    const payments = await Payment.find({ recipient: creatorId });
    const totalEarnings = payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    
    // Step 5: Get all orders
    const orders = await Order.find({ creator: creatorId }).sort({ createdAt: -1 }).limit(10);
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    // Step 6: Calculate response rate based on messages
    const messages = await Message.find({ 
      recipient: creatorId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
    });
    
    const respondedMessages = await Message.find({
      sender: creatorId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
    });
    
    // Calculate response rate (responded messages / total messages received)
    let responseRate = messages.length > 0 
      ? Math.min(100, Math.round((respondedMessages.length / messages.length) * 100)) 
      : 100;
    
    // Step 7: Get revenue breakdown by promotion type
    const revenueByPromotionType = await PromotionRevenue.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(creatorId) } },
      { $group: { _id: '$promotionType', amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);
    
    // Format revenue data with colors
    const colors = ['purple', 'indigo', 'blue', 'pink', 'orange'];
    const formattedRevenueData = revenueByPromotionType.map((item, index) => ({
      type: item._id || 'Other',
      amount: item.amount,
      color: colors[index % colors.length]
    }));
    
    // Step 8: Calculate performance data for charts
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Get profile view data for the last 14 days
    const dailyViews = [];
    const dailyLikes = [];
    const dailyMessages = [];
    const dailyEarnings = [];
    const dateLabels = [];
    
    // Generate date labels and initialize arrays
    for (let i = 0; i < 14; i++) {
      const date = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateLabels.push(dateString);
      
      // Start with 0 values, will be updated if actual data exists
      dailyViews.push(0);
      dailyLikes.push(0);
      dailyMessages.push(0);
      dailyEarnings.push(0);
    }
    
    // Update with actual data if available (this is a placeholder - implement actual data fetching logic)
    // In a real implementation, you would query your database for actual daily metrics
    
    // Step 9: Determine influencer tier based on social followers
    let influencerTier = 'Bronze';
    let tierProgress = 0;
    
    if (totalSocialFollowers >= 1000000) {
      influencerTier = 'Diamond';
      tierProgress = 100;
    } else if (totalSocialFollowers >= 500000) {
      influencerTier = 'Platinum';
      tierProgress = 80 + ((totalSocialFollowers - 500000) / 500000) * 20;
    } else if (totalSocialFollowers >= 100000) {
      influencerTier = 'Gold';
      tierProgress = 60 + ((totalSocialFollowers - 100000) / 400000) * 20;
    } else if (totalSocialFollowers >= 50000) {
      influencerTier = 'Silver';
      tierProgress = 40 + ((totalSocialFollowers - 50000) / 50000) * 20;
    } else {
      influencerTier = 'Bronze';
      tierProgress = Math.min(40, (totalSocialFollowers / 50000) * 100);
    }
    
    // Step 10: Determine service tier based on completed projects and response rate
    let serviceTier = 'Standard';
    
    if (completedOrders >= 100 && responseRate >= 95) {
      serviceTier = 'VIP';
    } else if (completedOrders >= 50 && responseRate >= 90) {
      serviceTier = 'Elite';
    } else if (completedOrders >= 20 && responseRate >= 85) {
      serviceTier = 'Professional';
    } else {
      serviceTier = 'Standard';
    }
    
    // Step 11: Update or create CreatorMetrics document
    let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });
    if (!creatorMetrics) {
      creatorMetrics = new CreatorMetrics({
        creator: creatorId,
        followers: totalSocialFollowers,
        totalEarnings: totalEarnings,
        completedProjects: completedOrders,
        responseRate: responseRate,
        tierProgress: tierProgress,
        influencerTier: influencerTier,
        serviceTier: serviceTier,
        performanceData: {
          views: dailyViews,
          likes: dailyLikes,
          messages: dailyMessages,
          earnings: dailyEarnings,
          dates: dateLabels
        },
        lastUpdated: new Date()
      });
    } else {
      // Update existing metrics
      creatorMetrics.followers = totalSocialFollowers;
      creatorMetrics.totalEarnings = totalEarnings;
      creatorMetrics.completedProjects = completedOrders;
      creatorMetrics.responseRate = responseRate;
      creatorMetrics.tierProgress = tierProgress;
      creatorMetrics.influencerTier = influencerTier;
      creatorMetrics.serviceTier = serviceTier;
      creatorMetrics.performanceData = {
        views: dailyViews,
        likes: dailyLikes,
        messages: dailyMessages,
        earnings: dailyEarnings,
        dates: dateLabels
      };
      creatorMetrics.lastUpdated = new Date();
    }
    
    // Save metrics to database
    await creatorMetrics.save();
    console.log('✅ Creator metrics updated successfully');
    
    // Step 12: Prepare and send API response
    const dashboardData = {
      metrics: {
        profileViews,
        totalSocialFollowers,
        totalEarnings,
        completedProjects: completedOrders,
        responseRate,
        tierProgress,
        influencerTier,
        serviceTier,
        profileCompleteness,
        averageResponseTime,
        ratings: ratingsData
      },
      orders,
      revenueByPromotionType: formattedRevenueData,
      socialMedia,
      performanceData: {
        views: dailyViews,
        likes: dailyLikes,
        messages: dailyMessages,
        earnings: dailyEarnings,
        dates: dateLabels
      }
    };
    
    // Log success
    console.log('✅ Dashboard data fetched successfully with all metrics');
    
    // Send success response with data
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching creator dashboard data:', error);
    res.status(500);
    throw new Error('Server error fetching dashboard data');
  }
});

/**
 * @desc    Get creator profile with social media data
 * @route   GET /api/creators/me
 * @access  Private
 */
export const getCreatorProfileData = asyncHandler(async (req: RequestWithUser, res: Response) => {
  // Get creator ID from authenticated user
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can access their profile data');
  }
  
  try {
    // Get creator profile
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    
    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }
    
    // Send success response with profile data
    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error fetching creator profile data:', error);
    res.status(500);
    throw new Error('Server error fetching creator profile data');
  }
});

/**
 * @desc    Update creator metrics
 * @route   PUT /api/creators/metrics
 * @access  Private (Creator only)
 */
export const updateCreatorMetrics = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can update their metrics');
  }
  
  const { followers, responseRate } = req.body;
  
  // Validate the input data
  if (followers !== undefined && (isNaN(followers) || followers < 0)) {
    res.status(400);
    throw new Error('Followers must be a positive number');
  }
  
  if (responseRate !== undefined && (isNaN(responseRate) || responseRate < 0 || responseRate > 100)) {
    res.status(400);
    throw new Error('Response rate must be a number between 0 and 100');
  }
  
  // Get creator metrics
  let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });
  
  if (!creatorMetrics) {
    // Initialize with default metrics if not found
    creatorMetrics = new CreatorMetrics({
      creator: creatorId,
      followers: followers || 0,
      totalEarnings: 0,
      completedProjects: 0,
      responseRate: responseRate !== undefined ? responseRate : 100,
      tierProgress: 0,
      performanceData: {
        views: generateRandomDataArray(14, 100, 400),
        likes: generateRandomDataArray(14, 20, 100),
        messages: generateRandomDataArray(14, 5, 30),
        earnings: generateRandomDataArray(14, 100, 600),
        dates: generateDateArray(14)
      },
      lastUpdated: new Date()
    });
  } else {
    // Update metrics
    if (followers !== undefined) {
      creatorMetrics.followers = followers;
    }
    
    if (responseRate !== undefined) {
      creatorMetrics.responseRate = responseRate;
    }
  }
  
  // Save the updated metrics
  await creatorMetrics.save();
  
  // Send success response
  res.status(200).json({
    success: true,
    data: creatorMetrics
  });
});

/**
 * @desc    Update social media follower counts
 * @route   PUT /api/creators/social-media-followers
 * @access  Private (Creator only)
 */
export const updateSocialMediaFollowers = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can update their social media follower counts');
  }
  
  const { 
    instagramFollowers, 
    twitterFollowers, 
    facebookFollowers, 
    linkedinConnections, 
    youtubeSubscribers 
  } = req.body;
  
  try {
    // Get creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    
    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }
    
    // Initialize socialMedia structure if it doesn't exist
    if (!creatorProfile.socialMedia) {
      creatorProfile.socialMedia = {
        socialProfiles: {}
      };
    }
    
    if (!creatorProfile.socialMedia.socialProfiles) {
      creatorProfile.socialMedia.socialProfiles = {};
    }
    
    // Update Instagram followers
    if (instagramFollowers !== undefined && !isNaN(instagramFollowers)) {
      if (!creatorProfile.socialMedia.socialProfiles.instagram) {
        creatorProfile.socialMedia.socialProfiles.instagram = {};
      }
      creatorProfile.socialMedia.socialProfiles.instagram.followers = parseInt(instagramFollowers);
    }
    
    // Update Twitter followers
    if (twitterFollowers !== undefined && !isNaN(twitterFollowers)) {
      if (!creatorProfile.socialMedia.socialProfiles.twitter) {
        creatorProfile.socialMedia.socialProfiles.twitter = {};
      }
      creatorProfile.socialMedia.socialProfiles.twitter.followers = parseInt(twitterFollowers);
    }
    
    // Update Facebook followers
    if (facebookFollowers !== undefined && !isNaN(facebookFollowers)) {
      if (!creatorProfile.socialMedia.socialProfiles.facebook) {
        creatorProfile.socialMedia.socialProfiles.facebook = {};
      }
      creatorProfile.socialMedia.socialProfiles.facebook.followers = parseInt(facebookFollowers);
    }
    
    // Update LinkedIn connections
    if (linkedinConnections !== undefined && !isNaN(linkedinConnections)) {
      if (!creatorProfile.socialMedia.socialProfiles.linkedin) {
        creatorProfile.socialMedia.socialProfiles.linkedin = {};
      }
      creatorProfile.socialMedia.socialProfiles.linkedin.connections = parseInt(linkedinConnections);
    }
    
    // Update YouTube subscribers
    if (youtubeSubscribers !== undefined && !isNaN(youtubeSubscribers)) {
      if (!creatorProfile.socialMedia.socialProfiles.youtube) {
        creatorProfile.socialMedia.socialProfiles.youtube = {};
      }
      creatorProfile.socialMedia.socialProfiles.youtube.subscribers = parseInt(youtubeSubscribers);
    }
    
    // Calculate total reach
    let totalReach = 0;
    if (creatorProfile.socialMedia.socialProfiles.instagram?.followers) {
      totalReach += creatorProfile.socialMedia.socialProfiles.instagram.followers;
    }
    if (creatorProfile.socialMedia.socialProfiles.twitter?.followers) {
      totalReach += creatorProfile.socialMedia.socialProfiles.twitter.followers;
    }
    if (creatorProfile.socialMedia.socialProfiles.facebook?.followers) {
      totalReach += creatorProfile.socialMedia.socialProfiles.facebook.followers;
    }
    if (creatorProfile.socialMedia.socialProfiles.linkedin?.connections) {
      totalReach += creatorProfile.socialMedia.socialProfiles.linkedin.connections;
    }
    if (creatorProfile.socialMedia.socialProfiles.youtube?.subscribers) {
      totalReach += creatorProfile.socialMedia.socialProfiles.youtube.subscribers;
    }
    
    // Update total reach
    creatorProfile.socialMedia.totalReach = totalReach;
    
    // Save changes to MongoDB
    await creatorProfile.save();
    
    console.log('✅ Social media follower counts updated successfully');
    
    // Send success response
    res.status(200).json({
      success: true,
      data: creatorProfile.socialMedia
    });
  } catch (error) {
    console.error('Error updating social media follower counts:', error);
    res.status(500);
    throw new Error('Server error updating social media follower counts');
  }
});

/**
 * Helper function to generate random data array for performance charts
 */
function generateRandomDataArray(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Helper function to generate date array for performance charts
 */
function generateDateArray(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
} 