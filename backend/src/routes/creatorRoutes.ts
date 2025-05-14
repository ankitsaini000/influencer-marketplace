import express from 'express';
import { protect, authorize } from '../middleware/auth';
import * as creatorController from '../controllers/creatorController';
import {
  getCreatorDashboard,
  getCreatorProfileData,
  updateCreatorMetrics,
  updateSocialMediaFollowers
} from '../controllers/creatorDashboardController';

const router = express.Router();

// Public routes
router.get('/', creatorController.getPublishedCreators);
router.get('/creators', creatorController.getCreators);
router.get('/published', creatorController.getPublishedCreators);
router.get('/creators/:username', creatorController.getPublicCreatorProfile);
router.post('/test', creatorController.testCreator);
router.get('/check-username/:username', creatorController.checkUsername);

// Profile creation routes (requires auth)
router.post('/', protect, creatorController.createCreatorProfile);
router.get('/profile-data', protect, creatorController.getProfileData);
router.post('/upgrade-role', protect, creatorController.upgradeToCreator);

// Dashboard route
router.get('/dashboard', protect, getCreatorDashboard);
router.put('/metrics', protect, updateCreatorMetrics);
router.put('/social-media-followers', protect, updateSocialMediaFollowers);

// Creator section update routes (requires creator role)
router.route('/me')
  .get(protect, authorize('creator'), creatorController.getMyCreatorProfile)
  .put(protect, authorize('creator'), creatorController.updateCreatorProfile);

router.post('/personal-info', protect, authorize('creator'), creatorController.savePersonalInfo);
router.post('/basic-info', protect, authorize('creator'), creatorController.saveBasicInfo);
router.post('/professional-info', protect, authorize('creator'), creatorController.saveProfessionalInfo);
router.post('/description', protect, authorize('creator'), creatorController.saveDescription);
router.post('/social-info', protect, authorize('creator'), creatorController.saveSocialInfo);
router.post('/pricing', protect, authorize('creator'), creatorController.savePricing);
router.post('/requirements', protect, authorize('creator'), creatorController.saveRequirements);
router.post('/gallery', protect, authorize('creator'), creatorController.saveGallery);
router.post('/publish', protect, authorize('creator'), creatorController.publishProfile);
router.put('/publish', protect, authorize('creator'), creatorController.publishProfile);
router.get('/completion-status', protect, authorize('creator'), creatorController.getCompletionStatus);

// Admin/Debug routes (should be restricted in production)
router.post('/force-complete', protect, authorize('creator'), creatorController.forceCompleteProfile);
router.post('/emergency-fix', protect, authorize('admin'), creatorController.emergencyFixProfile);
router.get('/debug/:userId', protect, authorize('admin'), creatorController.debugProfileData);
router.post('/test-gallery', protect, authorize('creator'), creatorController.testGalleryStorage);

// Creator profile route for dashboard data
router.get('/me/profile', protect, getCreatorProfileData);

// Onboarding step routes
// router.route('/personal-info').post(protect, creatorController.savePersonalInfo);
// router.route('/professional-info').post(protect, creatorController.saveProfessionalInfo);
// router.route('/description-faq').post(protect, creatorController.saveDescriptionFaq);
// router.route('/social-info').post(protect, creatorController.saveSocialInfo);
// router.route('/pricing').post(protect, creatorController.savePricing);
// router.route('/gallery-portfolio').post(protect, creatorController.saveGalleryPortfolio);
// router.route('/publish').post(protect, creatorController.publishCreatorProfile);

export default router;