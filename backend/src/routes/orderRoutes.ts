import express from 'express';
import { protect, authorize } from '../middleware/auth';
import orderController from '../controllers/orderController';

const router = express.Router();

// Client routes
router.post('/', protect, orderController.createOrder);
router.get('/myorders', protect, orderController.getMyOrders);

// Creator routes
router.get('/', protect, authorize('creator'), orderController.getOrders);

// Order by ID routes (must be after /myorders to avoid conflict)
router.route('/:id')
  .get(protect, (req, res, next) => {
    if (req.user.role === 'creator') {
      return orderController.getOrderByIdCreator(req, res, next);
    }
    return orderController.getOrderById(req, res, next);
  });

// Order update routes
router.put('/:id/status', protect, authorize('creator'), orderController.updateOrderStatus);
router.put('/:id/feedback', protect, authorize('creator'), orderController.addOrderFeedback);
router.put('/:id/pay', protect, orderController.updateOrderToPaid);
router.put('/:id/complete', protect, orderController.completeOrder);

export default router; 