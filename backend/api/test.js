// Simple test API endpoint for Vercel
export default async function handler(req, res) {
  console.log('🧪 Test endpoint called');

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
    res.status(200).json({
      message: 'API test endpoint working!',
      timestamp: new Date().toISOString(),
      vercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      path: req.url,
      method: req.method
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      message: 'Test endpoint error',
      error: error.message
    });
  }
}
