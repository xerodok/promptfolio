# syntax=docker/dockerfile:1.7
# Multi-stage build producing a small, non-root image that runs the Next.js
# standalone server. Build with:
#   docker build --build-arg GIT_SHA=$(git rev-parse --short HEAD) -t promptfolio .
#
# Size: the app (standalone server + static assets + public/) is ~60 MB; the
# Node binary is the rest. Measured on the same build (2026-10):
#   node:22-alpine runtime ............ 322 MB
#   distroless nodejs22-debian12 ...... 288 MB  (no shell, uid 65532)
#   alpine + stripped node (this) ..... 257 MB  (sh present, uid 100)
# Deleting files in a later layer never shrinks an image, so the runtime
# starts from bare Alpine and copies in only the Node binary (debug symbols
# stripped) and its two runtime libraries. For the true minimum, skip the
# server entirely: `pnpm export:static` is ~1 MB of files.

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# --- deps: install with a cached, frozen lockfile --------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- build ------------------------------------------------------------------
FROM base AS build
ARG APP_VERSION=dev
ARG GIT_SHA=unknown
ENV APP_VERSION=$APP_VERSION GIT_SHA=$GIT_SHA
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- nodebin: the Node binary without debug symbols (the official one ships unstripped)
FROM base AS nodebin
RUN apk add --no-cache binutils && strip /usr/local/bin/node

# --- runtime: bare Alpine + Node + the standalone output, as an unprivileged user
FROM alpine:3.21 AS runtime
RUN apk add --no-cache libstdc++ libgcc && addgroup -S app && adduser -S -G app app
COPY --from=nodebin /usr/local/bin/node /usr/local/bin/node
ARG APP_VERSION=dev
ARG GIT_SHA=unknown
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    APP_VERSION=$APP_VERSION \
    GIT_SHA=$GIT_SHA
WORKDIR /app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --chown=app:app scripts/healthcheck.mjs ./healthcheck.mjs
USER app
EXPOSE 3000
# No wget/curl in the image: the probe is a few lines of Node.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["node", "/app/healthcheck.mjs"]
CMD ["node", "server.js"]
