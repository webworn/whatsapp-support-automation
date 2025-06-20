# Simplified single-stage build for Railway
FROM node:18-alpine

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

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with memory optimization
RUN npm ci --prefer-offline --no-audit --progress=false && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build the application
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

# Start the application (Railway will handle health checks via HTTP)
CMD ["npm", "run", "start:prod"]