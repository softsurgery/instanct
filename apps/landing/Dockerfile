# Build from the repository root:
#   docker build -f apps/landing/Dockerfile -t instanct-landing .

FROM node:22-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate && \
    printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# App package.json stubs (needed by pnpm workspace resolution)
COPY apps/api/package.json ./apps/api/package.json
RUN sed -i '/"postinstall":/d' apps/api/package.json
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

RUN pnpm install --frozen-lockfile --filter instanct-landing... --ignore-scripts

COPY apps/landing ./apps/landing
COPY scripts/allowed-dev-origins.ts ./scripts/allowed-dev-origins.ts

# Copy only the packages landing actually uses
COPY packages/api-client ./packages/api-client
COPY packages/components ./packages/components
COPY packages/contexts ./packages/contexts
COPY packages/form-builder ./packages/form-builder
COPY packages/hooks ./packages/hooks
COPY packages/i18n ./packages/i18n
COPY packages/lib ./packages/lib
COPY packages/ui ./packages/ui

ENV npm_config_ignore_scripts=true

RUN set -a && \
    [ -f apps/landing/.env.build ] && . apps/landing/.env.build; \
    set +a && \
    /repo/node_modules/.bin/turbo run build --filter=instanct-landing

# ---- Production image ----
FROM node:22-alpine AS runner

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder --chown=app:app /repo/apps/landing/public ./apps/landing/public
COPY --from=builder --chown=app:app /repo/apps/landing/.next/standalone ./
COPY --from=builder --chown=app:app /repo/apps/landing/.next/static ./apps/landing/.next/static

USER app

ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "apps/landing/server.js"]

