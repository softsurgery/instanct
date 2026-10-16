# syntax=docker/dockerfile:1
# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t instanct-api .

FROM node:22-alpine AS builder

WORKDIR /repo

RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@11.25.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --parents apps/*/package.json packages/*/package.json ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter instanct-api... --ignore-scripts --prefer-offline --store-dir /pnpm/store \
    && test -x node_modules/typescript/bin/tsc \
    && node -e "require('bcrypt')"

COPY scripts/mjs/build-shared-packages.mjs scripts/mjs/prepare-api-image.mjs ./scripts/mjs/
COPY packages/tsconfig.nsa.json ./packages/tsconfig.nsa.json
COPY --parents packages/nsa-* ./

RUN node scripts/mjs/build-shared-packages.mjs \
    && test -f packages/nsa-database/dist/index.js \
    && test -f packages/nsa-auth/dist/index.js

COPY apps/api ./apps/api

RUN rm -f apps/api/*.tsbuildinfo \
    && cd apps/api \
    && /repo/node_modules/.bin/nest build \
    && test -f dist/main.js \
    && test -f dist/assets/migrations/V1_1__init_schema.sql

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter instanct-api --prod --store-dir /pnpm/store deploy --legacy --ignore-scripts /pruned \
    && node scripts/mjs/prepare-api-image.mjs

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat \
    && addgroup -S app \
    && adduser -S app -G app

WORKDIR /repo

COPY --from=builder --chown=app:app /runtime/ ./

USER app

WORKDIR /repo/apps/api

ENV APP_PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/main.js"]
