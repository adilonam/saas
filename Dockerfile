# Build stage
FROM node:25-bullseye AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    python3 \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app and build
COPY . .

# Accept build argument for backend URL
ARG FAST_API_URL
ENV FAST_API_URL=$FAST_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:25-bullseye
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]

