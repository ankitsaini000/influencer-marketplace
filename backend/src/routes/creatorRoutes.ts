import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getCreators, 
  getPublicCreatorProfile,
  getProfileData,
  savePersonalInfo,
  saveBasicInfo,
  savePricing,
  saveDescription,
  saveRequirements,
  saveGallery,
  saveSocialInfo,
  getCompletionStatus,
  publishProfile,
  testCreator,
  checkUsername,
  forceCompleteProfile,
  emergencyFixProfile,
  debugProfileData,
  upgradeToCreator,
  getMyCreatorProfile,
  updateCreatorProfile,
  createCreatorProfile
} from '../controllers/creatorController';
import { CreatorProfile } from '../models/CreatorProfile';

const router = express.Router();

// Public routes
router.get('/creators', getCreators);
router.post('/test', testCreator);
router.get('/check-username/:username', checkUsername);
router.get('/profile/:username', getPublicCreatorProfile);

// Protected routes (authentication required)
router.use(protect);

// Routes that only need authentication
router.get('/profile-data', getProfileData);
router.get('/profile', getMyCreatorProfile);
router.get('/completion-status', getCompletionStatus);
router.post('/personal-info', savePersonalInfo);
router.post('/overview', saveBasicInfo);
router.post('/upgrade-role', upgradeToCreator);
router.get('/debug-profile-data', debugProfileData);
router.get('/force-complete', forceCompleteProfile);

// Admin-only routes
router.post('/emergency-fix/:userId', authorize('admin'), emergencyFixProfile);

// Basic creator routes (require creator role)
router.post('/pricing', authorize('creator'), savePricing);
router.post('/description', authorize('creator'), saveDescription);
router.post('/requirements', authorize('creator'), saveRequirements);
router.post('/gallery', authorize('creator'), saveGallery);
router.post('/social-info', authorize('creator'), saveSocialInfo);
router.post('/publish', authorize('creator'), publishProfile);

// Creator profile routes
router.post('/', createCreatorProfile);

// If you specifically need the /profile-data endpoint, add it:
router.post('/profile-data', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Received profile data:', req.body);
    
    // Create a new creator profile or update existing one
    let creatorProfile;
    
    // Extract userId from request body or from authenticated user
    const userId = req.user?._id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required'
      });
    }
    
    // Check if profile exists
    const existingProfile = await CreatorProfile.findOne({ userId });
    
    if (existingProfile) {
      // Update existing profile
      creatorProfile = await CreatorProfile.findOneAndUpdate(
        { userId },
        { ...req.body, userId },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      creatorProfile = await CreatorProfile.create({
        ...req.body,
        userId
      });
    }
    
    if (!creatorProfile) {
      return res.status(404).json({ success: false, message: 'Could not create or update profile' });
    }
    
    res.status(201).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error in /profile-data endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error processing profile data', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
router.route('/me')
  .get(getMyCreatorProfile)
  .put(updateCreatorProfile);

export default router;