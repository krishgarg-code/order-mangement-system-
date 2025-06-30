/**
 * Simple Local JSON Database Service
 * This is a temporary solution for development when MongoDB is not available
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'data');
    this.ordersFile = path.join(this.dbPath, 'orders.json');
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dbPath, { recursive: true });
      
      // Create orders file if it doesn't exist
      try {
        await fs.access(this.ordersFile);
      } catch {
        await fs.writeFile(this.ordersFile, JSON.stringify([], null, 2));
      }
      
      this.initialized = true;
      console.log('Local database initialized');
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      throw error;
    }
  }

  async readOrders() {
    await this.init();
    try {
      const data = await fs.readFile(this.ordersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading orders:', error);
      return [];
    }
  }

  async writeOrders(orders) {
    await this.init();
    try {
      await fs.writeFile(this.ordersFile, JSON.stringify(orders, null, 2));
    } catch (error) {
      console.error('Error writing orders:', error);
      throw error;
    }
  }

  async findOrders(query = {}) {
    const orders = await this.readOrders();
    
    // Simple filtering logic
    let filtered = orders;
    
    if (query.companyName) {
      const regex = new RegExp(query.companyName, 'i');
      filtered = filtered.filter(order => regex.test(order.companyName));
    }
    
    if (query['rolls.status']) {
      filtered = filtered.filter(order => 
        order.rolls && order.rolls.some(roll => roll.status === query['rolls.status'])
      );
    }
    
    if (query['rolls.grade']) {
      filtered = filtered.filter(order => 
        order.rolls && order.rolls.some(roll => roll.grade === query['rolls.grade'])
      );
    }
    
    return filtered;
  }

  async createOrder(orderData) {
    const orders = await this.readOrders();
    
    // Generate ID
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newOrder = {
      _id: id,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await this.writeOrders(orders);
    
    return newOrder;
  }

  async updateOrder(id, updateData) {
    const orders = await this.readOrders();
    const index = orders.findIndex(order => order._id === id);
    
    if (index === -1) {
      return null;
    }
    
    orders[index] = {
      ...orders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await this.writeOrders(orders);
    return orders[index];
  }

  async deleteOrder(id) {
    const orders = await this.readOrders();
    const index = orders.findIndex(order => order._id === id);
    
    if (index === -1) {
      return null;
    }
    
    const deletedOrder = orders.splice(index, 1)[0];
    await this.writeOrders(orders);
    
    return deletedOrder;
  }

  async countOrders(query = {}) {
    const orders = await this.findOrders(query);
    return orders.length;
  }

  async getStats() {
    const orders = await this.readOrders();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      order.rolls && order.rolls.some(roll => roll.status === 'Pending')
    ).length;
    const completedOrders = orders.filter(order => 
      order.rolls && order.rolls.every(roll => roll.status === 'dispached')
    ).length;
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: 0, // Would need pricing data to calculate
      lastUpdated: new Date().toISOString()
    };
  }
}

export default new LocalDatabase();
