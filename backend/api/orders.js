import mongoose from 'mongoose';

// Load env variables
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI not defined in environment variables");
}

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

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('❌ Orders API error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
