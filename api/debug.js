/**
 * Debug API endpoint to test Vercel deployment
 */

export default function handler(req, res) {
  console.log('🔍 Debug endpoint called');
  console.log('📍 Working directory:', process.cwd());
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('📦 Vercel detected:', !!process.env.VERCEL);
  console.log('🛣️ Request URL:', req.url);
  console.log('📝 Request method:', req.method);
  
  // Check if we can access files
  const fs = require('fs');
  const path = require('path');
  
  try {
    const files = fs.readdirSync(process.cwd());
    console.log('📁 Root directory files:', files);
  } catch (error) {
    console.error('❌ Cannot read directory:', error.message);
  }
  
  res.status(200).json({
    message: 'Debug endpoint working',
    cwd: process.cwd(),
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
