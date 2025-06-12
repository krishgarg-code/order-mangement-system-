# Order Management System - Monorepo

A full-stack order management system built with React (frontend) and Node.js/Express (backend), configured as a monorepo for seamless development and deployment.

## 🏗️ Architecture

This project is structured as a monorepo with the following components:

```
order-management-system/
├── frontend/          # React + Vite + TypeScript frontend
├── backend/           # Node.js + Express + MongoDB backend
├── scripts/           # Database initialization and utility scripts
├── docker-compose.yml # Local development with Docker
├── Dockerfile         # Production container
├── vercel.json        # Vercel deployment configuration
└── package.json       # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- MongoDB (local or cloud)
- Git

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd order-management-system
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string and other settings
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both frontend (http://localhost:8080) and backend (http://localhost:3000) concurrently.

### Using Docker (Recommended for full local setup)

1. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - MongoDB on port 27017
   - Backend API on port 3000
   - Frontend on port 8080

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## 📦 Available Scripts

### Root Level Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start the backend server (production)
- `npm run lint` - Run linting on frontend code
- `npm run clean` - Clean build artifacts and caches

### Workspace-Specific Commands

- `npm run dev:frontend` - Start only the frontend development server
- `npm run dev:backend` - Start only the backend development server
- `npm run build:frontend` - Build only the frontend
- `npm run build:backend` - Build only the backend

## 🌐 Deployment

### Vercel (Recommended)

This project is configured for seamless Vercel deployment:

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `MONGODB_URI`
   - `NODE_ENV=production`
3. **Deploy:** Vercel will automatically build and deploy both frontend and backend

The `vercel.json` configuration handles:
- Frontend static files served from root
- Backend API routes under `/api/*`
- Proper build commands for the monorepo structure

### Docker Deployment

1. **Build production image:**
   ```bash
   docker build -t oms-app .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 -p 4173:4173 \
     -e MONGODB_URI="your-mongodb-uri" \
     -e NODE_ENV=production \
     oms-app
   ```

## 🛠️ Development

### Project Structure

#### Frontend (`/frontend`)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** Radix UI + Tailwind CSS
- **State Management:** React Query
- **Routing:** React Router

#### Backend (`/backend`)
- **Runtime:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **Authentication:** Ready for implementation
- **API:** RESTful endpoints

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/order-management

# Backend
PORT=3000
NODE_ENV=development

# Frontend (build-time)
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Order Management System
```

### Adding Dependencies

- **Shared dependencies:** `npm install <package>`
- **Frontend only:** `npm install <package> --workspace=frontend`
- **Backend only:** `npm install <package> --workspace=backend`

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific workspace
npm run test --workspace=frontend
npm run test --workspace=backend
```

## 📝 API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-app.vercel.app/api`

### Endpoints

#### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## Features

- Order management with roll tracking
- Multiple roll statuses (Pending, Casting, Annealing, etc.)
- Grade selection (ALLOYS, ADAMITE, EN-8, EN-9, etc.)
- Roll descriptions (SHAFT, ROLL, REEL, CASTING, FORGING)
- Dashboard with order statistics
- Search and filter functionality
- Monorepo architecture for unified development and deployment
- Docker support for containerized deployment
- Vercel-ready configuration for serverless deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts:** Change ports in `package.json` scripts and `vite.config.ts`
2. **MongoDB connection:** Verify `MONGODB_URI` in environment variables
3. **Build failures:** Run `npm run clean` and reinstall dependencies

### Getting Help

- Check the [Issues](../../issues) page
- Review the [Wiki](../../wiki) for detailed guides
- Contact the development team

---

Built with ❤️ using modern web technologies
