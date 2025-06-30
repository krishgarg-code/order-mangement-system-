import express from 'express';
import Order from '../models/Order.js';
import storageService from '../services/storageService.js';
import mongoose from 'mongoose';

// Only import local database in development
let localDatabase = null;
if (process.env.NODE_ENV === 'development') {
  const { default: localDb } = await import('../services/localDatabase.js');
  localDatabase = localDb;
}

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

    let orders, total;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Use MongoDB
      [orders, total] = await Promise.all([
        Order.find
        (query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments(query)
      ]);
    } else {
      // Only use local database fallback in development
      if (process.env.NODE_ENV === 'development') {
        console.log('MongoDB not connected, using local database (development only)');
        const allOrders = await localDatabase.findOrders(query);
        total = allOrders.length;
        orders = allOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(skip, skip + limit);
      } else {
        // In production, throw an error if MongoDB is not connected
        throw new Error('Database connection unavailable');
      }
    }

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
  let overdueOrders;

  if (mongoose.connection.readyState === 1) {
    // Use MongoDB
    overdueOrders = await Order.findOverdue();
  } else {
    // Only use local database fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB not connected, using local database (development only)');
      // Simple overdue logic for local database
      const allOrders = await localDatabase.readOrders();
      const now = new Date();
      overdueOrders = allOrders.filter(order =>
        order.expectedDelivery &&
        new Date(order.expectedDelivery) < now &&
        order.rolls && !order.rolls.every(roll => roll.status === 'dispached')
      );
    } else {
      // In production, throw an error if MongoDB is not connected
      throw new Error('Database connection unavailable');
    }
  }

  res.json(overdueOrders);
}));

// Create a new order (with cache invalidation)
router.post('/', asyncHandler(async (req, res) => {
  let savedOrder;

  if (mongoose.connection.readyState === 1) {
    // Use MongoDB
    savedOrder = await storageService.createOrder(req.body);
  } else {
    // Only use local database fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB not connected, using local database (development only)');
      savedOrder = await localDatabase.createOrder(req.body);
    } else {
      // In production, throw an error if MongoDB is not connected
      throw new Error('Database connection unavailable');
    }
  }

  res.status(201).json(savedOrder);
}));

// Update an order (with cache invalidation)
router.put('/:id', asyncHandler(async (req, res) => {
  let order;

  if (mongoose.connection.readyState === 1) {
    // Use MongoDB
    order = await storageService.updateOrder(req.params.id, req.body);
  } else {
    // Only use local database fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB not connected, using local database (development only)');
      order = await localDatabase.updateOrder(req.params.id, req.body);
    } else {
      // In production, throw an error if MongoDB is not connected
      throw new Error('Database connection unavailable');
    }
  }

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json(order);
}));

// Delete an order
router.delete('/:id', asyncHandler(async (req, res) => {
  let order;

  if (mongoose.connection.readyState === 1) {
    // Use MongoDB
    order = await Order.findByIdAndDelete(req.params.id);
  } else {
    // Only use local database fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB not connected, using local database (development only)');
      order = await localDatabase.deleteOrder(req.params.id);
    } else {
      // In production, throw an error if MongoDB is not connected
      throw new Error('Database connection unavailable');
    }
  }

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ message: 'Order deleted successfully' });
}));

// Get order statistics (cached)
router.get('/stats', asyncHandler(async (req, res) => {
  let stats;

  if (mongoose.connection.readyState === 1) {
    // Use MongoDB
    stats = await storageService.getDashboardStats();
  } else {
    // Only use local database fallback in development
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB not connected, using local database (development only)');
      stats = await localDatabase.getStats();
    } else {
      // In production, throw an error if MongoDB is not connected
      throw new Error('Database connection unavailable');
    }
  }

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