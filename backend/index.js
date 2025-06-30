import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version info
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const app = express();

// ==================== SYSTEM STARTUP LOGGING ====================
console.log('🚀 Order Management System Backend Starting...');
console.log('=' .repeat(60));
console.log(`📦 Backend Version: ${packageJson.version}`);
console.log(`📦 Package Name: ${packageJson.name}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🕐 Startup Time: ${new Date().toISOString()}`);
console.log(`🖥️  Node.js Version: ${process.version}`);
console.log(`🖥️  Platform: ${process.platform} ${process.arch}`);
console.log('=' .repeat(60));

// ==================== MIDDLEWARE CONFIGURATION ====================
console.log('🔧 Configuring middleware...');

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:4173', // Vite preview
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.PRODUCTION_URL || null
].filter(Boolean);

console.log('🌐 CORS Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Allowed Origins: ${allowedOrigins.length} configured`);
allowedOrigins.forEach((origin, index) => {
  console.log(`   ${index + 1}. ${origin}`);
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) {
          console.log('🌐 CORS: Allowing request with no origin');
          return callback(null, true);
        }

        // Check if origin is in allowed list or is a Vercel preview URL
        if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
          console.log(`🌐 CORS: Allowing origin: ${origin}`);
          return callback(null, true);
        }

        console.log(`🚫 CORS: Blocking origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
    : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

console.log('✅ CORS middleware configured');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Body parsing middleware configured (10MB limit)');

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const origin = req.get('Origin') || 'No Origin';

  console.log('📨 Incoming Request:');
  console.log(`   Time: ${timestamp}`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.url}`);
  console.log(`   Origin: ${origin}`);
  console.log(`   User-Agent: ${userAgent.substring(0, 50)}...`);
  console.log(`   Body Size: ${JSON.stringify(req.body).length} bytes`);

  if (Object.keys(req.body).length > 0) {
    console.log(`   Body Keys: [${Object.keys(req.body).join(', ')}]`);
  }

  next();
});

console.log('✅ Request logging middleware configured');

// ==================== STATIC FILE SERVING ====================
console.log('📁 Configuring static file serving...');

// Determine the path to the built frontend files
const frontendDistPath = process.env.VERCEL
  ? join(__dirname, '..', 'dist')  // In Vercel, dist is at root level
  : join(__dirname, '..', 'frontend', 'dist'); // Local development

console.log(`📂 Frontend dist path: ${frontendDistPath}`);

if (existsSync(frontendDistPath)) {
  // Serve static files from the frontend build
  app.use(express.static(frontendDistPath));
  console.log('✅ Static file serving configured');
  console.log(`   Serving from: ${frontendDistPath}`);
} else {
  console.log('⚠️  Frontend dist directory not found');
  console.log(`   Expected path: ${frontendDistPath}`);
  console.log('   Frontend will not be served (API only mode)');
}

// ==================== MONGODB CONNECTION ====================
console.log('🗄️  Configuring MongoDB connection...');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.error('💡 Please set MONGODB_URI in your environment variables');
  process.exit(1);
}

console.log('✅ MongoDB URI found in environment variables');
console.log('🔗 Attempting to connect to MongoDB...');
console.log(`📍 MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`); // Hide credentials in logs

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: 'majority'
};

console.log('⚙️  MongoDB Connection Options:');
console.log(`   Server Selection Timeout: ${mongooseOptions.serverSelectionTimeoutMS}ms`);
console.log(`   Socket Timeout: ${mongooseOptions.socketTimeoutMS}ms`);
console.log(`   Max Pool Size: ${mongooseOptions.maxPoolSize}`);
console.log(`   Min Pool Size: ${mongooseOptions.minPoolSize}`);
console.log(`   Retry Writes: ${mongooseOptions.retryWrites}`);
console.log(`   Write Concern: ${mongooseOptions.w}`);

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Initiating MongoDB connection...');
    await mongoose.connect(MONGODB_URI, mongooseOptions);

    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database Information:');
    console.log(`   Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`   Connection State: ${getConnectionState(mongoose.connection.readyState)}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);

    const collections = Object.keys(mongoose.connection.collections);
    console.log(`   Collections (${collections.length}): [${collections.join(', ')}]`);

    // Test a simple query to ensure the connection is working
    try {
      const testResult = await mongoose.connection.db.admin().ping();
      console.log('✅ Database ping successful:', testResult);
    } catch (pingError) {
      console.log('⚠️  Database ping failed:', pingError.message);
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('🔍 Error Details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });

    // Exit only on initial connection failure
    if (mongoose.connection.readyState === 0) {
      console.error('💥 Failed to connect to MongoDB. Please check your connection string and credentials.');
      process.exit(1);
    }
  }
};

// Helper function to get readable connection state
function getConnectionState(state) {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  return states[state] || 'Unknown';
}

// Initialize database connection
console.log('🚀 Starting database connection...');
connectDB();

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔍 Error details:', {
    name: err.name,
    code: err.code,
    state: getConnectionState(mongoose.connection.readyState)
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
  console.log(`🔄 Connection state: ${getConnectionState(mongoose.connection.readyState)}`);
  console.log('🔄 Attempting to reconnect...');

  // Only attempt to reconnect if we're not already trying to connect
  if (mongoose.connection.readyState === 0) {
    setTimeout(() => {
      console.log('🔄 Initiating reconnection...');
      connectDB();
    }, 5000); // Wait 5 seconds before reconnecting
  }
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 MongoDB connecting...');
});

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/', (req, res) => {
  const connectionState = getConnectionState(mongoose.connection.readyState);
  const isConnected = mongoose.connection.readyState === 1;

  const healthData = {
    status: 'ok',
    message: 'Welcome to the Order Management API',
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    routing: {
      isVercel: !!process.env.VERCEL,
      routePrefix: process.env.VERCEL ? '' : '/api',
      requestPath: req.path,
      requestUrl: req.url
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    mongodb: {
      status: isConnected ? 'connected' : 'disconnected',
      state: connectionState,
      stateCode: mongoose.connection.readyState,
      database: mongoose.connection.db?.databaseName || 'Not connected',
      host: mongoose.connection.host || 'Not connected',
      port: mongoose.connection.port || 'Not connected',
      collections: isConnected ? Object.keys(mongoose.connection.collections) : []
    },
    storage: {
      type: 'MongoDB Only',
      cache: 'Disabled',
      blob: 'Disabled',
      local: 'Disabled'
    }
  };

  console.log('🏥 Health check requested');
  console.log(`   MongoDB Status: ${healthData.mongodb.status}`);
  console.log(`   Memory Usage: ${healthData.memory.used}MB / ${healthData.memory.total}MB`);
  console.log(`   Uptime: ${Math.round(healthData.uptime)}s`);

  res.json(healthData);
});

// ==================== ROUTES CONFIGURATION ====================
console.log('🛣️  Configuring routes...');

import orderRoutes from './routes/orders.js';

// Always use /api prefix for consistency
app.use('/api/orders', orderRoutes);
console.log('✅ API routes configured with /api prefix');

console.log('✅ Routes configured:');
console.log('   GET  / - Health check');
console.log('   GET  /api/orders - List orders');
console.log('   POST /api/orders - Create order');
console.log('   PUT  /api/orders/:id - Update order');
console.log('   DELETE /api/orders/:id - Delete order');
console.log('   GET  /api/orders/stats - Dashboard stats');
console.log('   GET  /api/orders/health - Storage health');
console.log('   GET  /api/orders/analytics - Order analytics');
console.log('   GET  /api/orders/overdue - Overdue orders');

// ==================== REACT APP CATCH-ALL ROUTE ====================
// Serve React app for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      message: 'API route not found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Serve React app
  const indexPath = join(frontendDistPath, 'index.html');
  if (existsSync(indexPath)) {
    console.log(`📱 Serving React app for: ${req.path}`);
    res.sendFile(indexPath);
  } else {
    console.log(`❌ React app index.html not found at: ${indexPath}`);
    res.status(404).json({
      message: 'Frontend not available',
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }
});

console.log('✅ React app catch-all route configured');

// ==================== ERROR HANDLING ====================
// This should not be reached due to catch-all route above
app.use((req, res) => {
  console.log('🚫 404 Not Found:');
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.url}`);
  console.log(`   Origin: ${req.get('Origin') || 'No Origin'}`);
  console.log(`   User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

  res.status(404).json({
    message: 'Route not found',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Application Error:');
  console.error(`   Message: ${err.message}`);
  console.error(`   Name: ${err.name}`);
  console.error(`   Status Code: ${err.statusCode || 500}`);
  console.error(`   Request: ${req.method} ${req.url}`);
  console.error(`   Stack: ${err.stack}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
});

// ==================== SERVER STARTUP ====================
// Export app for Vercel serverless functions
export default app;

// Start server only when running locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    console.log('🚀 Server Started Successfully!');
    console.log('=' .repeat(60));
    console.log(`🌐 Server running on port: ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    console.log(`📊 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`📈 Stats API: http://localhost:${PORT}/api/orders/stats`);
    console.log(`🔍 Health API: http://localhost:${PORT}/api/orders/health`);
    console.log('=' .repeat(60));
    console.log('✅ Backend is ready to accept requests!');

    // Log system information
    console.log('📊 System Information:');
    console.log(`   Process ID: ${process.pid}`);
    console.log(`   Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    console.log(`   Node.js Version: ${process.version}`);
    console.log(`   Platform: ${process.platform} ${process.arch}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('💥 Server Error:', error.message);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.error('💡 Try using a different port or kill the process using this port');
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  });
} else {
  console.log('🚀 Running in Vercel serverless mode');
  console.log(`📦 Version: ${packageJson.version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
}