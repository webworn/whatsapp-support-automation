# Multi-stage build for Railway deployment
FROM node:18-alpine AS builder

# Install OpenSSL and other necessary packages for Railway
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    ca-certificates

# Set working directory
WORKDIR /app

# Copy backend package files first
COPY package*.json ./
COPY prisma ./prisma/

# Install backend dependencies only (no frontend build in Docker)
RUN npm ci && npm cache clean --force

# Copy backend source code only
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Generate Prisma client
RUN npx prisma generate

# Build backend only (skip frontend build in Docker)
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies for Railway
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    ca-certificates \
    curl

WORKDIR /app

# Copy package files for production install
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client for production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Start the application (Railway will handle health checks via HTTP)
CMD ["npm", "run", "start:prod"]