/**
 * Vercel Serverless Function Entry Point
 * This file acts as a bridge between Vercel's serverless function structure
 * and our existing Express backend
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

// Import routes directly
import orderRoutes from '../backend/routes/orders.js';

const app = express();

// Add debugging for Vercel deployment
console.log('🚀 Vercel API function loaded');
console.log('📍 Current working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📦 Vercel environment detected:', !!process.env.VERCEL);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).then(() => {
    console.log('✅ MongoDB connected in Vercel function');
  }).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });
}

// Test endpoint
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    message: 'API is working!',
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Order Management API',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Register order routes without /api prefix (Vercel handles the /api part)
app.use('/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`🚫 404: ${req.method} ${req.url}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(500).json({
    message: err.message,
    path: req.url
  });
});

// Export the Express app as a Vercel serverless function
export default app;
