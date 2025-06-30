// Vercel API route for health check
const mongoose = require('mongoose');
require('dotenv/config');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
    }
  }
};

module.exports = async function handler(req, res) {
  console.log('🏥 Health check requested');
  
  // Connect to database
  await connectDB();
  
  const healthData = {
    status: 'ok',
    message: 'Order Management System API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL,
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    }
  };

  console.log('🏥 Health check response:', healthData);
  
  res.status(200).json(healthData);
}
