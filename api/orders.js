// Vercel API route for orders
const mongoose = require('mongoose');
require('dotenv/config');

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
});

// Create model (handle existing model)
let Order;
try {
  Order = mongoose.model('Order');
} catch {
  Order = mongoose.model('Order', orderSchema);
}

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error; // Re-throw to handle in the main handler
    }
  }
};

export default async function handler(req, res) {
  console.log(`📊 Orders API called: ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database
    await connectDB();
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError);
    return res.status(500).json({
      message: 'Database connection failed',
      error: dbError.message
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const orders = await Order.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${orders.length} orders`);
        res.status(200).json(orders);
        break;
        
      case 'POST':
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        console.log(`✅ Created new order: ${savedOrder._id}`);
        res.status(201).json(savedOrder);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('❌ Orders API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
