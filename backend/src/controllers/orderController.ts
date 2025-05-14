import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Payment from '../models/Payment';
import path from 'path';
import fs from 'fs';
import CreatorMetrics from '../models/CreatorMetrics';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  console.log('Create order request received with body:', JSON.stringify(req.body, null, 2));
  
  // Destructure the request body
  const {
    creatorId,
    packageType,
    packagePrice,
    platformFee,
    totalAmount,
    paymentMethod,
    specialInstructions,
    message,
    files,
    paymentStatus,
  } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!creatorId) missingFields.push('creatorId');
  if (!packageType) missingFields.push('packageType');
  if (!packagePrice) missingFields.push('packagePrice');
  if (!totalAmount) missingFields.push('totalAmount');
  if (!paymentMethod) missingFields.push('paymentMethod');

  if (missingFields.length > 0) {
    console.log('Missing required fields in order creation:', missingFields);
    res.status(400);
    throw new Error(`Please provide all required fields: ${missingFields.join(', ')}`);
  }

  try {
    // Log user info for debugging
    console.log('User info:', {
      userId: req.user?._id,
      username: req.user?.name || req.user?.username,
      role: req.user?.role
    });

    // Validate payment method
    const validPaymentMethods = ['card', 'paypal', 'upi', 'bankTransfer'];
    const normalizedPaymentMethod = paymentMethod.toLowerCase();
    
    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      console.log(`Invalid payment method: ${paymentMethod}. Acceptable values: ${validPaymentMethods.join(', ')}`);
      res.status(400);
      throw new Error(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`);
    }

    // Validate package type
    const validPackageTypes = ['basic', 'standard', 'premium'];
    const normalizedPackageType = packageType.toLowerCase();
    
    if (!validPackageTypes.includes(normalizedPackageType)) {
      console.log(`Invalid package type: ${packageType}. Acceptable values: ${validPackageTypes.join(', ')}`);
      res.status(400);
      throw new Error(`Invalid package type. Must be one of: ${validPackageTypes.join(', ')}`);
    }

    // Process and save files if they exist
    let fileUrls: string[] = [];
    if (files && files.length > 0) {
      // In a real implementation, you'd handle file uploads properly
      fileUrls = files.map((file: any) => {
        return file.path || file.url || file.name || 'Unnamed file';
      });
    }

    // Create order data
    const orderData = {
      user: req.user._id,
      creatorId,
      packageType: normalizedPackageType,
      packagePrice: Number(packagePrice),
      platformFee: Number(platformFee),
      totalAmount: Number(totalAmount),
      paymentMethod: normalizedPaymentMethod,
      specialInstructions: specialInstructions || '',
      message: message || '',
      files: fileUrls,
      isPaid: paymentStatus === 'completed', // Mark as paid if payment was successful
      paidAt: paymentStatus === 'completed' ? new Date() : undefined,
      status: paymentStatus === 'failed' ? 'cancelled' : paymentStatus === 'completed' ? 'in_progress' : 'pending',
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    // Create new order in the database
    const order = await Order.create(orderData);

    console.log('Order created successfully:', {
      orderId: order._id,
      creatorId: (order as any).creator,
      packageType: (order as any).packageType,
      paymentMethod: (order as any).paymentMethod,
      totalAmount: (order as any).totalAmount,
      status: (order as any).status
    });

    // Create payment record
    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const paymentData = {
      user: req.user._id,
      order: order._id,
      transactionId,
      amount: Number(totalAmount),
      paymentMethod: normalizedPaymentMethod,
      status: paymentStatus || 'pending',
      paymentDetails: {}
    };

    // Add payment details based on payment method
    if (normalizedPaymentMethod === 'card') {
      paymentData.paymentDetails = {
        cardLast4: req.body.cardLast4 || '1234', // Mock data for development
        cardBrand: req.body.cardBrand || 'Visa', // Mock data for development
      };
    } else if (normalizedPaymentMethod === 'paypal') {
      paymentData.paymentDetails = {
        paypalEmail: req.body.paypalEmail || req.user.email || 'user@example.com',
      };
    } else if (normalizedPaymentMethod === 'upi') {
      paymentData.paymentDetails = {
        upiId: req.body.upiId || 'user@bank',
      };
    }

    console.log('Creating payment record with data:', JSON.stringify(paymentData, null, 2));
    const payment = await Payment.create(paymentData);
    console.log('Payment record created successfully:', {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      status: payment.status
    });

    // Return success response with created order data
    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        creatorId: (order as any).creator,
        packageType: (order as any).packageType,
        packagePrice: (order as any).packagePrice,
        platformFee: (order as any).platformFee,
        totalAmount: (order as any).totalAmount,
        paymentMethod: (order as any).paymentMethod,
        specialInstructions: (order as any).specialInstructions,
        message: (order as any).message,
        files: (order as any).files,
        isPaid: (order as any).isPaid,
        paidAt: (order as any).paidAt,
        orderDate: (order as any).createdAt,
        status: (order as any).status,
        paymentId: payment._id,
        transactionId: payment.transactionId
      }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    
    // Check for specific error types
    if (err instanceof Error && err.name === 'ValidationError') {
      console.error('Validation error details:', err.message);
      res.status(400);
      throw new Error(`Validation error: ${err.message}`);
    } else if (err instanceof Error && err.name === 'MongoError') {
      console.error('MongoDB error:', err.message);
      res.status(500);
      throw new Error(`Database error: ${err.message}`);
    } else {
      res.status(500);
      throw new Error(`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if the order belongs to the user or user is an admin
    if ((order as any).user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized access to order');
    }
    
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if the order belongs to the user or user is an admin
    if ((order as any).user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized access to order');
    }

    (order as any).isPaid = true;
    (order as any).paidAt = new Date();
    order.status = 'in_progress';

    const updatedOrder = await order.save();
    console.log('Order updated to paid:', { orderId: updatedOrder._id });
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status to completed/delivered
// @route   PUT /api/orders/:id/complete
// @access  Private/Creator or Admin
export const completeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Only admin or creator can mark an order as complete
    // In a real app, you'd check if the logged-in user is the creator for this order
    if (req.user.role !== 'admin' && req.user.role !== 'creator') {
      res.status(403);
      throw new Error('Unauthorized access');
    }

    (order as any).isDelivered = true;
    (order as any).deliveryDate = new Date();
    order.status = 'completed';

    const updatedOrder = await order.save();
    console.log('Order completed:', { orderId: updatedOrder._id });
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  console.log(`Retrieved ${orders.length} orders for user ${req.user._id}`);
  res.json(orders);
});

/**
 * @desc    Get all orders for a creator
 * @route   GET /api/orders
 * @access  Private (Creator only)
 */
export const getOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user._id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can access orders'
      });
      return;
    }
    
    // Fetch orders for creator
    const orders = await Order.find({ creator: creatorId })
      .populate('user', 'name profilePicture username')
      .populate('package', 'title price')
      .populate('serviceRequest', 'requirements')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

/**
 * @desc    Get a single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Creator only)
 */
export const getOrderByIdCreator = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user._id;
    const orderId = req.params.id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can access orders'
      });
      return;
    }
    
    // Find order by id that belongs to the creator
    const order = await Order.findOne({
      _id: orderId,
      creator: creatorId
    })
      .populate('user', 'name profilePicture username email')
      .populate('package', 'title price')
      .populate('serviceRequest', 'requirements')
      .populate('promotion', 'discountPercentage code');
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not authorized to view'
      });
      return;
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Creator only)
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const creatorId = req.user._id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can update orders'
      });
      return;
    }
    
    // Check if status is valid
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be one of: pending, in-progress, completed, cancelled'
      });
      return;
    }
    
    // Find order by id that belongs to the creator
    const order = await Order.findOne({
      _id: id,
      creator: creatorId
    });
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not authorized to update'
      });
      return;
    }
    
    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      date: new Date()
    });
    
    // If status is completed, update the completion date
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

/**
 * @desc    Add client feedback to an order
 * @route   PUT /api/orders/:id/feedback
 * @access  Private (Creator only)
 */
export const addOrderFeedback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { clientFeedback } = req.body;
    const creatorId = req.user._id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can update orders'
      });
      return;
    }
    
    // Validate feedback
    if (!clientFeedback || clientFeedback.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Feedback cannot be empty'
      });
      return;
    }
    
    // Find order by id that belongs to the creator
    const order = await Order.findOne({
      _id: id,
      creator: creatorId
    });
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not authorized to update'
      });
      return;
    }
    
    // Add feedback to order
    order.clientFeedback = clientFeedback;
    order.clientFeedbackDate = new Date();
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order feedback added successfully',
      data: order
    });
  } catch (error) {
    console.error('Error adding order feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding order feedback'
    });
  }
});

export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  addOrderFeedback,
  getOrderByIdCreator,
  getMyOrders,
  updateOrderToPaid,
  completeOrder
}; 