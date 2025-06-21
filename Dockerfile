# Multi-stage build: Frontend + Backend integration for Railway
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app

# Copy frontend directory and its contents
COPY frontend ./frontend

# Change to frontend directory
WORKDIR /app/frontend

# Install frontend dependencies
RUN npm ci --prefer-offline --no-audit --progress=false

# Set production environment variables for frontend build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_APP_NAME="WhatsApp AI SaaS Platform"
ENV NEXT_PUBLIC_WS_URL=""
ENV NEXT_PUBLIC_ENV=production

# Build frontend for production
RUN npm run build

# Debug: Show build output
RUN ls -la .next/

# Main application stage
FROM node:18-alpine AS backend

# Install necessary packages
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    ca-certificates \
    curl

# Set working directory
WORKDIR /app

# Set Node.js memory limit to avoid OOM
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Copy backend package files
COPY package*.json ./
COPY prisma ./prisma/

# Install backend dependencies with legacy peer deps to resolve conflicts
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit --progress=false && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy backend source code
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Create frontend directory structure
RUN mkdir -p frontend/public frontend/.next

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json

# Copy standalone server if it exists
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/standalone || true

# Build the backend application
RUN npm run build

# Remove dev dependencies to save space
RUN npm prune --omit=dev

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]