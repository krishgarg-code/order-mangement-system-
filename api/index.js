/**
 * Vercel Serverless Function Entry Point
 * This file acts as a bridge between Vercel's serverless function structure
 * and our existing Express backend
 */

// Import the main Express app from backend
import app from '../backend/index.js';

// Add debugging for Vercel deployment
console.log('🚀 Vercel API function loaded');
console.log('📍 Current working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📦 Vercel environment detected:', !!process.env.VERCEL);

// Add test routes to verify API is working
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called at /test');
  res.json({
    message: 'API is working!',
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called at /api/test');
  res.json({
    message: 'API is working at /api/test!',
    path: req.path,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Export the Express app as a Vercel serverless function
export default app;
