import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'], // Vite's default ports and custom port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;


if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}
app.get('/', (req, res) => {
  res.send('Welcome to the Order Management API');
}
);

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Hide credentials in logs

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

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Collections:', Object.keys(mongoose.connection.collections));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit only on initial connection failure
    if (mongoose.connection.readyState === 0) {
      console.error('Failed to connect to MongoDB. Please check your connection string and credentials.');
      process.exit(1);
    }
  }
};

// Initialize database connection
connectDB();

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  // Only attempt to reconnect if we're not already trying to connect
  if (mongoose.connection.readyState === 0) {
    connectDB();
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to the Order Management API',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      database: mongoose.connection.db?.databaseName,
      collections: Object.keys(mongoose.connection.collections)
    }
  });
});

// Routes
import orderRoutes from './routes/orders.js';
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 