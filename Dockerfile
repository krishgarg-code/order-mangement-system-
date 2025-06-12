# Multi-stage Dockerfile for Order Management System Monorepo

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./frontend/

# Build frontend
RUN npm run build:frontend

# Stage 2: Setup backend and serve
FROM node:18-alpine AS production

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create a simple static file server for frontend
RUN npm install -g serve

# Expose ports
EXPOSE 3000 4173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start both backend and frontend
CMD ["sh", "-c", "npm run start --workspace=backend & serve -s frontend/dist -l 4173 & wait"]
