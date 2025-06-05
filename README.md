# Order Management System

This is a full-stack Order Management System with separate frontend and backend directories.

## Project Structure

```
.
├── frontend/           # React frontend application
│   ├── src-jsx/       # Source files
│   ├── public/        # Static files
│   └── ...           # Frontend configuration files
│
└── backend/           # Express backend server
    ├── models/        # MongoDB models
    ├── routes/        # API routes
    └── ...           # Backend configuration files
```

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- Order management with roll tracking
- Multiple roll statuses (Pending, Casting, Annealing, etc.)
- Grade selection (ALLOYS, ADAMITE, EN-8, EN-9, etc.)
- Roll descriptions (SHAFT, ROLL, REEL, CASTING, FORGING)
- Dashboard with order statistics
- Search and filter functionality
