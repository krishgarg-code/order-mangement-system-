import mongoose from 'mongoose';

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
  console.log('🏥 Health check requested');

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let mongoStatus = 'disconnected';
  let mongoHost = 'unknown';
  let mongoName = 'unknown';
  let dbError = null;

  try {
    await connectDB();
    mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    mongoHost = mongoose.connection.host || 'unknown';
    mongoName = mongoose.connection.name || 'unknown';
  } catch (error) {
    console.error('❌ Database connection failed in health check:', error);
    dbError = error.message;
  }

  const healthData = {
    status: 'ok',
    message: 'Order Management System API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL,
    mongodb: {
      status: mongoStatus,
      host: mongoHost,
      name: mongoName,
      error: dbError
    }
  };

  console.log('🏥 Health check response:', healthData);
  res.status(200).json(healthData);
}
