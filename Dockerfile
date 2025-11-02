# Base stage with Node.js and pnpm
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 react

# Copy built application
COPY --from=builder --chown=react:nodejs /app/dist ./dist
COPY --from=builder --chown=react:nodejs /app/public ./public
COPY --from=builder --chown=react:nodejs /app/.content-collections ./.content-collections
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server-start.mjs ./server-start.mjs

USER react

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

# Run the server wrapper
CMD ["node", "server-start.mjs"]
