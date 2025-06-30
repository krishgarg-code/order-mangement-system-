
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
    this.inMemoryOrders = []; // Fallback for read-only environments
    this.useInMemory = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Try to create data directory and file (for local development)
      await fs.mkdir(this.dbPath, { recursive: true });

      // Create orders file if it doesn't exist
      try {
        await fs.access(this.ordersFile);
      } catch {
        await fs.writeFile(this.ordersFile, JSON.stringify([], null, 2));
      }

      this.initialized = true;
      this.useInMemory = false;
      console.log('Local file database initialized');
    } catch (error) {
      // If file system is read-only (like in Vercel), use in-memory storage
      console.warn('File system is read-only, using in-memory storage:', error.message);
      this.useInMemory = true;
      this.initialized = true;

      // Add some sample data for demonstration
      this.inMemoryOrders = [
        {
          _id: "sample1",
          orderNumber: "ORD-001",
          companyName: "Sample Company A",
          broker: "Broker A",
          quantity: 5,
          orderDate: new Date().toISOString(),
          expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Sample order for demonstration",
          rolls: [
            {
              rollNumber: "R001",
              hardness: "HRC 45-50",
              machining: "Rough",
              rollDescription: "ROLL",
              dimensions: "100x200",
              status: "Pending",
              grade: "ALLOYS"
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      console.log('In-memory database initialized with sample data');
    }
  }

  async readOrders() {
    await this.init();

    if (this.useInMemory) {
      return [...this.inMemoryOrders]; // Return a copy
    }

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

    if (this.useInMemory) {
      this.inMemoryOrders = [...orders]; // Store a copy
      return;
    }

    try {
      await fs.writeFile(this.ordersFile, JSON.stringify(orders, null, 2));
    } catch (error) {
      console.error('Error writing orders:', error);
      // Fall back to in-memory if write fails
      console.warn('Falling back to in-memory storage');
      this.useInMemory = true;
      this.inMemoryOrders = [...orders];
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
