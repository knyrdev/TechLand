# TechLand Application Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp (needed for some packages)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S techland -u 1001

# Set ownership
RUN chown -R techland:nodejs /app

# Switch to non-root user
USER techland

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "app.js"]