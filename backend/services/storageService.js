/**
 * Storage Service - MongoDB Only
 * Simple storage service using only MongoDB for data persistence
 */

import Order from '../models/Order.js';

class StorageService {
  constructor() {
    // Simple MongoDB-only storage service
  }

  // ==================== ORDER OPERATIONS ====================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ 'rolls.status': 'Pending' }),
      Order.countDocuments({ 'rolls.status': 'dispached' })
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: 0, // Revenue calculation would need pricing data
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get orders with filtering
   */
  async getOrders(filters = {}) {
    let query = Order.find(filters);
    
    // Apply sorting
    query = query.sort({ createdAt: -1 });
    
    return await query.exec();
  }

  /**
   * Create order
   */
  async createOrder(orderData) {
    const order = await Order.create(orderData);
    return order;
  }

  /**
   * Update order
   */
  async updateOrder(id, updateData) {
    const order = await Order.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    );
    return order;
  }

  /**
   * Delete order
   */
  async deleteOrder(id) {
    const order = await Order.findByIdAndDelete(id);
    return order;
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(timeRange = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const analytics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          totalRolls: { $sum: { $size: '$rolls' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return analytics;
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check storage service health
   */
  async healthCheck() {
    const health = {
      mongodb: false,
      cache: false,
      blob: false,
      timestamp: new Date().toISOString()
    };

    try {
      // Test MongoDB
      await Order.findOne().limit(1);
      health.mongodb = true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    // KV and Blob are disabled
    health.cache = false;
    health.blob = false;

    return health;
  }
}

export default new StorageService();
