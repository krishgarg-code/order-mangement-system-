import express from 'express';
import Order from '../models/Order.js';
import storageService from '../services/storageService.js';
import mongoose from 'mongoose';

const router = express.Router();

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all orders with pagination and filtering
router.get('/', asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Add filters if provided
    if (req.query.status) {
      query['rolls.status'] = req.query.status;
    }
    if (req.query.grade) {
      query['rolls.grade'] = req.query.grade;
    }
    if (req.query.companyName) {
      query.companyName = new RegExp(req.query.companyName, 'i');
    }

    // Ensure MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection unavailable');
    }

    // Use MongoDB only
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      orders: orders || [],
      pagination: {
        total: total || 0,
        page,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
}));

// Get overdue orders
router.get('/overdue', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const overdueOrders = await Order.findOverdue();
  res.json(overdueOrders);
}));

// Create a new order (with cache invalidation)
router.post('/', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const savedOrder = await storageService.createOrder(req.body);
  res.status(201).json(savedOrder);
}));

// Update an order (with cache invalidation)
router.put('/:id', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const order = await storageService.updateOrder(req.params.id, req.body);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json(order);
}));

// Delete an order
router.delete('/:id', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ message: 'Order deleted successfully' });
}));

// Get order statistics (cached)
router.get('/stats', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const stats = await storageService.getDashboardStats();
  res.json(stats);
}));

// Get analytics data
router.get('/analytics', asyncHandler(async (req, res) => {
  const timeRange = req.query.range || '30d';
  const analytics = await storageService.getOrderAnalytics(timeRange);
  res.json(analytics);
}));

// Storage health check
router.get('/health', asyncHandler(async (req, res) => {
  const health = await storageService.healthCheck();
  res.json(health);
}));

export default router; 