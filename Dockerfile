# Multi-stage build for Railway deployment
FROM node:18-alpine AS base

# Install OpenSSL and other necessary packages for Railway
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    ca-certificates

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies for Railway
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    ca-certificates

WORKDIR /app

# Copy dependencies and generated Prisma client
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]