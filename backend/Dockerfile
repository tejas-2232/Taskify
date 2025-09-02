# Backend Dockerfile - Fixed version
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm install && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim AS production

# Install system dependencies and dumb-init
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# ✅ FIX: Set permissions BEFORE switching user
RUN chown -R nodejs:nodejs /app/node_modules/.prisma

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
