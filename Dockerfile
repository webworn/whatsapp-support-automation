# Multi-stage build: Frontend + Backend integration for Railway
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files first
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy all frontend source code
COPY frontend/ ./

# Set production environment variables for frontend build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL="https://whatsapp-support-automation-production.up.railway.app"
ENV NEXT_PUBLIC_APP_NAME="WhatsApp AI SaaS Platform"
ENV NEXT_PUBLIC_WS_URL="wss://whatsapp-support-automation-production.up.railway.app"
ENV NEXT_PUBLIC_ENV=production

# Ensure public directory exists (Next.js sometimes doesn't preserve empty dirs)
RUN mkdir -p public && \
    echo "=== Public directory ensured ==="

# Build frontend for production
RUN echo "=== Starting frontend build ===" && \
    npm run build && \
    echo "=== Frontend build completed ===" || \
    (echo "=== Frontend build failed ===" && exit 1)

# Ensure public directory still exists after build
RUN mkdir -p public && \
    ls -la public && \
    echo "=== Public directory verified ==="

# Verify build output (non-fatal)
RUN echo "=== Build verification ===" && \
    ls -la || echo "Root directory listing failed" && \
    ls -la .next/ || echo ".next directory not found" && \
    ls -la public/ || echo "public directory not found" && \
    echo "=== Verification complete ==="

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

# Copy only the essential built files (skip public for now)
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next

# Create public directory with some default content
RUN mkdir -p ./frontend/public && \
    echo '{}' > ./frontend/public/placeholder.json

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