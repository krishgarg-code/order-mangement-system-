const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all orders...');
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  console.log('Creating new order with data:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validate required fields
    const requiredFields = ['orderNumber', 'companyName', 'quantity', 'orderDate', 'expectedDelivery'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate rolls array
    if (!Array.isArray(req.body.rolls) || req.body.rolls.length === 0) {
      throw new Error('At least one roll is required');
    }

    // Validate each roll
    req.body.rolls.forEach((roll, index) => {
      if (!roll.rollNumber || !roll.hardness) {
        throw new Error(`Roll ${index + 1} is missing required fields (rollNumber and hardness are required)`);
      }
    });

    // Create the order
    const order = new Order({
      ...req.body,
      orderDate: new Date(req.body.orderDate),
      expectedDelivery: new Date(req.body.expectedDelivery),
      quantity: parseInt(req.body.quantity) || 1
    });

    console.log('Created order instance:', order);
    
    const newOrder = await order.save();
    console.log('Order saved successfully:', newOrder);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate order number',
        error: error.message
      });
    }
    res.status(400).json({ 
      message: error.message,
      stack: error.stack
    });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  console.log(`Updating order ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
  
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!order) {
      console.log(`Order ${req.params.id} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order updated successfully:', order);
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ 
      message: error.message,
      stack: error.stack
    });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  console.log(`Deleting order ${req.params.id}`);
  
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      console.log(`Order ${req.params.id} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order deleted successfully:', order);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 