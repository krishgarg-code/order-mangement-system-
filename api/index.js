/**
 * Vercel Serverless Function Entry Point
 * This file acts as a bridge between Vercel's serverless function structure
 * and our existing Express backend
 */

// Import the main Express app from backend
import app from '../backend/index.js';

// Export the Express app as a Vercel serverless function
export default app;
