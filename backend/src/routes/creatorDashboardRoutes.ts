// Use require syntax to avoid TypeScript import issues
const express = require('express');
import { protect, authorize } from '../middleware/auth';
import * as creatorDashboardController from '../controllers/creatorDashboardController';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);
router.use(authorize('creator'));

// Dashboard routes
router.get('/', creatorDashboardController.getCreatorDashboard);
router.put('/metrics', creatorDashboardController.updateCreatorMetrics);
router.get('/profile', creatorDashboardController.getCreatorProfileData);
router.put('/social-followers', creatorDashboardController.updateSocialMediaFollowers);

export default router; 