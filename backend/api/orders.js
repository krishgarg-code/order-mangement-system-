import mongoose from 'mongoose';

// Load env variables
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI not defined in environment variables");
}

// Order Schema - Updated to match frontend expectations
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  companyName: { type: String, required: true },
  broker: { type: String },
  quantity: { type: Number, default: 1 },
  orderDate: { type: Date, default: Date.now },
  expectedDelivery: { type: Date },
  notes: { type: String },
  rolls: [{
    rollNumber: { type: String },
    hardness: { type: String, required: true },
    machining: { type: String },
    rollDescription: { type: String },
    dimensions: { type: String },
    status: { 
      type: String, 
      enum: ['Pending', 'casting', 'annealing', 'machining', 'bearing/wobler', 'dispached'],
      default: 'Pending'
    },
    grade: { type: String }
  }]
}, {
  timestamps: true
});

// Create model safely
let Order;
try {
  Order = mongoose.model('Order');
} catch {
  Order = mongoose.model('Order', orderSchema);
}

// DB connection
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  }
};

// Main handler
export default async function handler(req, res) {
  console.log(`Orders API called: ${req.method}`);

  // CORS configuration for production
  const allowedOrigins = [
    'https://cs-frontend-rust.vercel.app',
    'http://localhost:3000', // for local development
    'http://localhost:5173'  // for Vite dev server
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
  } catch (err) {
    console.error('❌ DB connect error:', err);
    return res.status(500).json({ message: 'DB connection failed', error: err.message });
  }

  try {
    if (req.method === 'GET') {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const newOrder = new Order(req.body);
      const saved = await newOrder.save();
      return res.status(201).json(saved);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Order ID is required' });
      }
      const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(200).json(updatedOrder);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Order ID is required' });
      }
      const deletedOrder = await Order.findByIdAndDelete(id);
      if (!deletedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(200).json({ message: 'Order deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('❌ Orders API error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
