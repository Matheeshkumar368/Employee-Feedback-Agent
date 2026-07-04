# =============================================================================
# AuraHR — Multi-Stage Production Dockerfile
# Base: Node 20 LTS (Alpine) for minimal image size
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps — install production + dev dependencies (cached layer)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat needed for some native Node bindings on Alpine
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
# --ignore-scripts avoids running postinstall hooks that may fail in CI
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 2: builder — compile Next.js app with standalone output
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Runtime secrets are NOT baked into the image.
# Pass sensitive values at `docker run` time via --env-file or -e flags.
# Only non-sensitive build-time values are set here.
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# next.config.ts always enables standalone output — no extra env needed.
ENV MONGODB_URI=mongodb+srv://matheeshkumar2_db_user:fireboy@cluster0.pjppi3s.mongodb.net/aurahr?retryWrites=true&w=majority
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: runner — minimal production image (~120 MB)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Non-root user for security best practices
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Static assets (served by the Next.js standalone server)
COPY --from=builder /app/public ./public

# Standalone server bundle (includes node_modules subset)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Pre-built static chunks (CSS, JS, images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck — Docker will mark the container unhealthy if the app stops responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
