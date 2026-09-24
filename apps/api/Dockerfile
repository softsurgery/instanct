# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t instanct-api .

# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# App package.json stubs (needed by pnpm workspace resolution)
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/landing/package.json ./apps/landing/package.json

# Package stubs for pnpm install (all workspace members must be present)
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/components/package.json ./packages/components/package.json
COPY packages/contexts/package.json ./packages/contexts/package.json
COPY packages/datatable-builder/package.json ./packages/datatable-builder/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/form-builder/package.json ./packages/form-builder/package.json
COPY packages/hooks/package.json ./packages/hooks/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json
COPY packages/lib/package.json ./packages/lib/package.json

COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-api... --ignore-scripts && \
    pnpm rebuild bcrypt

# API has no workspace package dependencies — only copy its own source
COPY apps/api ./apps/api
RUN sed -i '/"postinstall":/d' apps/api/package.json

# Build the app — run from the api directory so nest-cli.json is found
RUN cd apps/api && /repo/node_modules/.bin/nest build

# Fail fast if dist/main.js was not produced
RUN test -f /repo/apps/api/dist/main.js || \
    (echo "ERROR: nest build did not produce dist/main.js" && ls -la /repo/apps/api/dist/ 2>/dev/null; exit 1)

# Prune to production-only dependencies
RUN pnpm deploy --legacy --filter instanct-api --prod --ignore-scripts /pruned

# --- Runtime Stage ---
FROM node:22-alpine AS runner

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# dist/ comes from nest build output (pnpm deploy skips it because .gitignore)
COPY --from=builder --chown=app:app /repo/apps/api/dist ./dist
# node_modules from pnpm deploy (production-only)
COPY --from=builder --chown=app:app /pruned/node_modules ./node_modules
# package.json for metadata
COPY --from=builder --chown=app:app /repo/apps/api/package.json ./

USER app

ENV APP_PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/main.js"]
