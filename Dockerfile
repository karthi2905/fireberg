# Multi-stage Dockerfile for FireBerg
# Stage 1: Build Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY server/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy server package & install production deps only
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/
WORKDIR /app/server
RUN npm ci --only=production
RUN npx prisma generate

# Copy built artifacts
COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose port
EXPOSE 3001

# Start the unified server
CMD ["node", "dist/index.js"]
