// Simple test API endpoint for Vercel
module.exports = function handler(req, res) {
  console.log('🧪 Test endpoint called');
  
  res.status(200).json({
    message: 'API test endpoint working!',
    timestamp: new Date().toISOString(),
    vercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    path: req.url,
    method: req.method
  });
}
