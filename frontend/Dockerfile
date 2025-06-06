# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy frontend directory
COPY ./frontend .

# Install dependencies and build
RUN pnpm install --frozen-lockfile && \
    pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy all files from builder
COPY --from=builder /app .

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Environment variables
ENV PORT=3000 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
