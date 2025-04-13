# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code and TypeScript config
COPY tsconfig.json .
COPY src ./src
COPY src/config.template.ts ./src/config.ts

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose port 3001
EXPOSE 3001

# Set environment variables with defaults
ENV PORT=3001 \
    NODE_ENV=production

CMD ["node", "dist/index.js"] 