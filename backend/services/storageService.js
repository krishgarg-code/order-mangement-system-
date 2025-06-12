/**
 * Enhanced Storage Service - Hybrid MongoDB + Vercel Edge Storage
 * Combines MongoDB for core data with Vercel KV for caching and Blob for files
 */

import { kv } from '@vercel/kv';
import { put, del, list } from '@vercel/blob';
import Order from '../models/Order.js';

class StorageService {
  constructor() {
    this.cachePrefix = 'oms:';
    this.cacheTTL = {
      stats: 300,      // 5 minutes
      orders: 60,      // 1 minute
      search: 180      // 3 minutes
    };
  }

  // ==================== CACHING LAYER ====================

  /**
   * Get cached data with fallback to database
   */
  async getCachedData(key, fallbackFn, ttl = 300) {
    try {
      const cacheKey = `${this.cachePrefix}${key}`;
      
      // Try to get from cache first
      const cached = await kv.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return cached;
      }

      // Cache miss - get from database
      console.log(`Cache miss for key: ${key}, fetching from database`);
      const data = await fallbackFn();
      
      // Store in cache for next time
      if (data) {
        await kv.set(cacheKey, data, { ex: ttl });
      }
      
      return data;
    } catch (error) {
      console.error('Cache error, falling back to database:', error);
      return await fallbackFn();
    }
  }

  /**
   * Invalidate cache for specific patterns
   */
  async invalidateCache(pattern) {
    try {
      const keys = await kv.keys(`${this.cachePrefix}${pattern}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => kv.del(key)));
        console.log(`Invalidated ${keys.length} cache keys for pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // ==================== ORDER OPERATIONS ====================

  /**
   * Get dashboard statistics with caching
   */
  async getDashboardStats() {
    return this.getCachedData('dashboard:stats', async () => {
      const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'completed' }),
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $unwind: '$items' },
          { $group: { _id: null, total: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } }
        ])
      ]);

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        lastUpdated: new Date().toISOString()
      };
    }, this.cacheTTL.stats);
  }

  /**
   * Get orders with intelligent caching
   */
  async getOrders(filters = {}) {
    const cacheKey = `orders:${JSON.stringify(filters)}`;
    
    return this.getCachedData(cacheKey, async () => {
      let query = Order.find(filters);
      
      // Apply sorting
      query = query.sort({ createdAt: -1 });
      
      return await query.exec();
    }, this.cacheTTL.orders);
  }

  /**
   * Create order and invalidate relevant caches
   */
  async createOrder(orderData) {
    const order = await Order.create(orderData);
    
    // Invalidate relevant caches
    await this.invalidateCache('dashboard');
    await this.invalidateCache('orders');
    
    return order;
  }

  /**
   * Update order and invalidate caches
   */
  async updateOrder(orderId, updateData) {
    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    
    // Invalidate relevant caches
    await this.invalidateCache('dashboard');
    await this.invalidateCache('orders');
    
    return order;
  }

  // ==================== FILE STORAGE ====================

  /**
   * Upload file to Vercel Blob storage
   */
  async uploadFile(filename, fileBuffer, options = {}) {
    try {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        addRandomSuffix: true,
        ...options
      });

      console.log(`File uploaded successfully: ${blob.url}`);
      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from Vercel Blob storage
   */
  async deleteFile(url) {
    try {
      await del(url);
      console.log(`File deleted successfully: ${url}`);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * List files in Vercel Blob storage
   */
  async listFiles(prefix = '') {
    try {
      const { blobs } = await list({ prefix });
      return blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }));
    } catch (error) {
      console.error('File listing error:', error);
      return [];
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  /**
   * Get order analytics with caching
   */
  async getOrderAnalytics(timeRange = '30d') {
    const cacheKey = `analytics:orders:${timeRange}`;
    
    return this.getCachedData(cacheKey, async () => {
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
            revenue: {
              $sum: {
                $reduce: {
                  input: '$items',
                  initialValue: 0,
                  in: { $add: ['$$value', { $multiply: ['$$this.quantity', '$$this.price'] }] }
                }
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      return analytics;
    }, this.cacheTTL.stats);
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

    try {
      // Test KV Cache
      await kv.set('health:check', 'ok', { ex: 10 });
      const result = await kv.get('health:check');
      health.cache = result === 'ok';
    } catch (error) {
      console.error('KV Cache health check failed:', error);
    }

    try {
      // Test Blob storage
      const { blobs } = await list({ limit: 1 });
      health.blob = true;
    } catch (error) {
      console.error('Blob storage health check failed:', error);
    }

    return health;
  }
}

export default new StorageService();
