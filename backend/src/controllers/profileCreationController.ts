import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CreatorProfile, ICreatorProfile } from '../models/CreatorProfile';
import User from '../models/User';
import mongoose from 'mongoose';

// Helper function to get or create a profile
const getOrCreateProfileForUser = async (userId: mongoose.Types.ObjectId) => {
  let profile = await CreatorProfile.findOne({ userId });
  
  if (!profile) {
    // Create a new profile if one doesn't exist
    profile = await CreatorProfile.create({
      userId,
      status: 'draft'
    });
  }
  
  return profile;
};

// Helper function to update completion status
const updateCompletionStatus = (profile: ICreatorProfile) => {
  // Check if basic info is complete
  profile.completionStatus.basicInfo = !!(
    profile.basicInfo.title && 
    profile.basicInfo.category && 
    profile.basicInfo.subcategory &&
    profile.basicInfo.expertise && 
    profile.basicInfo.expertise.length > 0
  );
  
  // Check if pricing is complete
  profile.completionStatus.pricing = !!(
    profile.pricing.packages.basic.price > 0 &&
    profile.pricing.packages.basic.description
  );
  
  // Check if description is complete
  profile.completionStatus.description = !!(
    profile.description.brief && 
    profile.description.detailed
  );
  
  // Check if requirements are complete
  profile.completionStatus.requirements = !!(
    profile.requirements.briefInstructions
  );
  
  // Check if gallery is complete
  profile.completionStatus.gallery = !!(
    (profile.gallery.images && profile.gallery.images.length > 0) ||
    (profile.gallery.videos && profile.gallery.videos.length > 0) ||
    (profile.gallery.portfolioLinks && profile.gallery.portfolioLinks.length > 0)
  );
  
  // Check if social info is complete
  profile.completionStatus.socialInfo = !!(
    profile.socialInfo.website || 
    profile.socialInfo.instagram || 
    profile.socialInfo.twitter || 
    profile.socialInfo.facebook || 
    profile.socialInfo.linkedin || 
    profile.socialInfo.youtube
  );
  
  // Check if personal info is complete
  profile.completionStatus.personalInfo = !!(
    profile.personalInfo.fullName && 
    profile.personalInfo.username && 
    profile.personalInfo.bio && 
    profile.personalInfo.profileImage
  );
  
  return profile;
};

// @desc    Save basic profile info
// @route   POST /api/creators/basic-info
// @access  Private (users with creator role)
export const saveBasicInfo = asyncHandler(async (req: Request, res: Response) => {
  const { title, category, subcategory, expertise, level, yearsOfExperience, tags } = req.body;
  
  // Get or create a profile
  const profile = await getOrCreateProfileForUser(req.user._id);
  
  // Update basic info
  profile.basicInfo = {
    title: title || profile.basicInfo.title,
    category: category || profile.basicInfo.category,
    subcategory: subcategory || profile.basicInfo.subcategory,
    expertise: expertise || profile.basicInfo.expertise,
    level: level || profile.basicInfo.level,
    yearsOfExperience: yearsOfExperience || profile.basicInfo.yearsOfExperience,
    tags: tags || profile.basicInfo.tags
  };
  
  // Update completion status
  updateCompletionStatus(profile);
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Save pricing info
// @route   POST /api/creators/pricing
// @access  Private (users with creator role)
export const savePricing = asyncHandler(async (req: Request, res: Response) => {
  const { packages, customOffers } = req.body;
  
  // Get or create a profile
  const profile = await getOrCreateProfileForUser(req.user._id);
  
  // Update pricing info
  profile.pricing = {
    packages: packages || profile.pricing.packages,
    customOffers: customOffers !== undefined ? customOffers : profile.pricing.customOffers
  };
  
  // Update completion status
  updateCompletionStatus(profile);
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Save description info
// @route   POST /api/creators/description
// @access  Private (users with creator role)
export const saveDescription = asyncHandler(async (req: Request, res: Response) => {
  const { brief, detailed, faq } = req.body;
  
  // Get or create a profile
  const profile = await getOrCreateProfileForUser(req.user._id);
  
  // Update description info
  profile.description = {
    brief: brief || profile.description.brief,
    detailed: detailed || profile.description.detailed,
    faq: faq || profile.description.faq
  };
  
  // Update completion status
  updateCompletionStatus(profile);
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Save requirements info
// @route   POST /api/creators/requirements
// @access  Private (users with creator role)
export const saveRequirements = asyncHandler(async (req: Request, res: Response) => {
  const { briefInstructions, questions, additionalInfo } = req.body;
  
  // Get or create a profile
  const profile = await getOrCreateProfileForUser(req.user._id);
  
  // Update requirements info
  profile.requirements = {
    briefInstructions: briefInstructions || profile.requirements.briefInstructions,
    questions: questions || profile.requirements.questions,
    additionalInfo: additionalInfo || profile.requirements.additionalInfo
  };
  
  // Update completion status
  updateCompletionStatus(profile);
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Save gallery info
// @route   POST /api/creators/gallery
// @access  Private (users with creator role)
export const saveGallery = asyncHandler(async (req: Request, res: Response) => {
  const { images, videos, portfolioLinks } = req.body;
  
  // Get or create a profile
  const profile = await getOrCreateProfileForUser(req.user._id);
  
  // Update gallery info
  profile.gallery = {
    images: images || profile.gallery.images,
    videos: videos || profile.gallery.videos,
    portfolioLinks: portfolioLinks || profile.gallery.portfolioLinks
  };
  
  // Update completion status
  updateCompletionStatus(profile);
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Save social info
// @route   POST /api/creators/social-info
// @access  Private (users with creator role)
export const saveSocialInfo = asyncHandler(async (req: Request, res: Response) => {
  const { website, instagram, twitter, facebook, linkedin, youtube, other, followersCount } = req.body;
  
  // Get or create a profile
  const profile = await getOrCreateProfileForUser(req.user._id);
  
  // Update social info
  profile.socialInfo = {
    website: website || profile.socialInfo.website,
    instagram: instagram || profile.socialInfo.instagram,
    twitter: twitter || profile.socialInfo.twitter,
    facebook: facebook || profile.socialInfo.facebook,
    linkedin: linkedin || profile.socialInfo.linkedin,
    youtube: youtube || profile.socialInfo.youtube,
    other: other || profile.socialInfo.other,
    followersCount: followersCount || profile.socialInfo.followersCount
  };
  
  // Update completion status
  updateCompletionStatus(profile);
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Save personal info
// @route   POST /api/creators/personal-info
// @access  Private (users with creator role)
export const savePersonalInfo = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, username, bio, profileImage, location, languages, skills } = req.body;

  // If username is provided, check availability
  if (username) {
    const existingProfile = await CreatorProfile.findOne({ 
      'personalInfo.username': username,
      userId: { $ne: req.user._id } // Exclude current user's profile
    });

    if (existingProfile) {
      res.status(400);
      throw new Error('Username is already in use');
    }
  }

  // Update the user record for some fields
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (fullName) user.fullName = fullName;
  if (profileImage) user.avatar = profileImage;
  await user.save();

  // Get or create a profile
  let profile = await CreatorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    // Create a new profile with minimal data if one doesn't exist
    profile = await CreatorProfile.create({
      userId: req.user._id,
      status: 'draft',
      basicInfo: {
        title: '',
        category: '',
        subcategory: '',
        expertise: [],
        level: 'intermediate',
        yearsOfExperience: 0,
        tags: []
      },
      pricing: {
        packages: {
          basic: { 
            name: 'Basic', 
            price: 0, 
            description: '', 
            deliveryTime: 0,
            revisions: 1,
            features: []
          },
          standard: { 
            name: 'Standard', 
            price: 0, 
            description: '', 
            deliveryTime: 0,
            revisions: 2,
            features: []
          },
          premium: { 
            name: 'Premium', 
            price: 0, 
            description: '', 
            deliveryTime: 0,
            revisions: 3,
            features: []
          }
        },
        customOffers: false
      },
      description: {
        brief: '',
        detailed: '',
        faq: []
      },
      requirements: {
        briefInstructions: '',
        questions: [],
        additionalInfo: ''
      },
      gallery: {
        images: [],
        videos: [],
        portfolioLinks: []
      },
      socialInfo: {
        website: '',
        instagram: '',
        twitter: '',
        facebook: '',
        linkedin: '',
        youtube: '',
        other: [],
        followersCount: new Map<string, number>()
      },
      personalInfo: {
        fullName: user.fullName || '',
        username: username || `creator_${Date.now().toString().slice(-8)}`,
        bio: bio || '',
        profileImage: user.avatar || '',
        location: location || '',
        languages: languages || [{ language: 'English', proficiency: 'Native' }],
        skills: skills || []
      },
      completionStatus: {
        basicInfo: false,
        pricing: false,
        description: false,
        requirements: false,
        gallery: false,
        socialInfo: false,
        personalInfo: false
      }
    });
  } else {
    // Ensure all necessary structures exist
    if (!profile.personalInfo) {
      profile.personalInfo = {
        fullName: '',
        username: '',
        bio: '',
        profileImage: '',
        location: '',
        languages: [],
        skills: []
      };
    }
    
    // Update personal info
    profile.personalInfo = {
      fullName: fullName || profile.personalInfo.fullName || user.fullName || '',
      username: username ? username : (profile.personalInfo.username || `creator_${Date.now().toString().slice(-8)}`),
      bio: bio !== undefined ? bio : profile.personalInfo.bio || '',
      profileImage: profileImage || profile.personalInfo.profileImage || user.avatar || '',
      location: location !== undefined ? location : profile.personalInfo.location || '',
      languages: languages || profile.personalInfo.languages || [],
      skills: skills || profile.personalInfo.skills || []
    };
    
    // Update completion status
    updateCompletionStatus(profile);
    
    await profile.save();
  }
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Get profile completion status
// @route   GET /api/creators/completion-status
// @access  Private (users with creator role)
export const getCompletionStatus = asyncHandler(async (req: Request, res: Response) => {
  // Get profile
  const profile = await CreatorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }
  
  // Get updated completion status
  updateCompletionStatus(profile);
  
  // Check if all required sections are complete
  const isReadyToPublish = Object.values(profile.completionStatus).every(value => value === true);
  
  res.status(200).json({
    success: true,
    data: {
      completionStatus: profile.completionStatus,
      isReadyToPublish
    }
  });
});

// @desc    Get profile data
// @route   GET /api/creators/profile-data
// @access  Private (users with creator role)
export const getProfileData = asyncHandler(async (req: Request, res: Response) => {
  // Get profile
  const profile = await CreatorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Publish profile
// @route   PUT /api/creators/publish
// @access  Private (users with creator role)
export const publishProfile = asyncHandler(async (req: Request, res: Response) => {
  // Get profile
  const profile = await CreatorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }
  
  // Directly update status to published without any checks
  profile.status = 'published';
  
  // Save profile
  await profile.save();
  
  // Update user role to creator if not already
  const user = await User.findById(req.user._id);
  if (user && user.role !== 'creator') {
    user.role = 'creator';
    await user.save();
  }
  
  res.status(200).json({
    success: true,
    data: {
      profile,
      profileUrl: profile.profileUrl
    }
  });
});

// @desc    Get public creator profile by username or ID
// @route   GET /api/creators/:identifier
// @access  Public
export const getPublicCreatorProfile = asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.params;
  let profile;
  
  // Check if identifier is a valid ObjectId (for ID lookup)
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    profile = await CreatorProfile.findOne({ 
      _id: identifier,
      status: 'published'
    }).populate('userId', 'fullName email avatar');
  } else {
    // Assume identifier is a username
    profile = await CreatorProfile.findOne({ 
      'personalInfo.username': identifier,
      status: 'published'
    }).populate('userId', 'fullName email avatar');
  }
  
  if (!profile) {
    res.status(404);
    throw new Error('Creator profile not found');
  }
  
  res.status(200).json({
    success: true,
    data: profile
  });
}); 