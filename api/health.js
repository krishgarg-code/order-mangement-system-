// Health check endpoint
export default function handler(req, res) {
  console.log('🏥 Health check called');
  
  res.status(200).json({
    status: 'ok',
    message: 'Order Management API Health Check',
    timestamp: new Date().toISOString(),
    vercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV
  });
}
