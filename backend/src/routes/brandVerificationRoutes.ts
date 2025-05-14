import express from 'express';
import {
  submitVerificationRequest,
  getVerificationRequest,
  getAllVerificationRequests,
  getVerificationRequestById,
  approveVerificationRequest,
  rejectVerificationRequest,
  checkVerificationStatus,
} from '../controllers/brandVerificationController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Routes for brand users
router.post('/', protect, submitVerificationRequest);
router.get('/', protect, getVerificationRequest);
router.get('/status', protect, checkVerificationStatus);

// Admin-only routes
router.get('/all', protect, admin, getAllVerificationRequests);
router.get('/:id', protect, admin, getVerificationRequestById);
router.put('/:id/approve', protect, admin, approveVerificationRequest);
router.put('/:id/reject', protect, admin, rejectVerificationRequest);

export default router; 