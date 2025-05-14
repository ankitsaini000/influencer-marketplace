import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import Payment from '../models/Payment';

// @desc    Process payment
// @route   POST /api/payments
// @access  Private
export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  console.log('Payment processing request received with body:', req.body);
  const { orderId, paymentMethod, amount, paymentDetails } = req.body;

  if (!orderId || !paymentMethod || !amount) {
    console.log('Missing required payment fields');
    res.status(400);
    throw new Error('Please provide all required payment information');
  }

  try {
    // Find the order being paid for
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized: Not your order');
    }

    // Verify payment amount matches order amount
    if (Number(amount) !== Number(order.totalAmount)) {
      console.log(`Payment amount mismatch: Expected ${order.totalAmount}, got ${amount}`);
      res.status(400);
      throw new Error('Payment amount does not match order total');
    }

    // In a real-world application, you would integrate with a payment gateway
    // For this example, we'll simulate a successful transaction
    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      order: orderId,
      transactionId,
      amount,
      paymentMethod,
      status: 'completed',
      paymentDetails: paymentDetails || {},
    });

    // Update order payment status
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'in_progress';
    await order.save();

    console.log('Payment processed successfully:', {
      paymentId: payment._id,
      transactionId,
      status: payment.status
    });

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment._id,
        transactionId,
        amount: payment.amount,
        status: payment.status,
        orderId: order._id
      }
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500);
    throw new Error('Failed to process payment: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id).populate('order');

  if (payment) {
    // Check if payment belongs to the user
    if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized access to payment details');
    }
    
    res.json(payment);
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const { amount, reason } = req.body;
  
  if (!amount || !reason) {
    res.status(400);
    throw new Error('Please provide refund amount and reason');
  }

  const payment = await Payment.findById(req.params.id);

  if (payment) {
    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized: Only admins can process refunds');
    }

    if (payment.status === 'refunded') {
      res.status(400);
      throw new Error('Payment has already been refunded');
    }

    // Validate refund amount
    if (Number(amount) > Number(payment.amount)) {
      res.status(400);
      throw new Error('Refund amount cannot exceed original payment amount');
    }

    // In a real app, you would make a call to payment gateway for refund
    // Update payment status
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;

    const updatedPayment = await payment.save();
    
    // Update the associated order if needed
    const order = await Order.findById(payment.order);
    if (order) {
      order.status = 'refunded';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: updatedPayment
    });
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getUserPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const payments = await Payment.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('order', 'packageType totalAmount status');
  
  res.json(payments);
}); 