# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN pnpm install --frozen-lockfile=false

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

# NEXT_PUBLIC_* values must be present at build time so they get
# inlined into the client bundle.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SHORT_DOMAIN
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SHORT_DOMAIN=${NEXT_PUBLIC_SHORT_DOMAIN}

COPY --from=deps /app /app
COPY apps/web ./apps/web
RUN pnpm --filter @momoflow/web build

# --- runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app .
EXPOSE 3000
CMD ["pnpm", "--filter", "@momoflow/web", "start"]
