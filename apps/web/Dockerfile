# Build from the repository root:
#   docker build -f apps/web/Dockerfile -t instanct-backoffice .

FROM node:22-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate && \
    printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# App package.json stubs (needed by pnpm workspace resolution)
COPY apps/api/package.json ./apps/api/package.json
RUN sed -i '/"postinstall":/d' apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

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

RUN pnpm install --frozen-lockfile --filter instanct-ui... --ignore-scripts

COPY apps/web ./apps/web
COPY scripts/allowed-dev-origins.ts ./scripts/allowed-dev-origins.ts

# Copy only the packages web actually uses
COPY packages/api-client ./packages/api-client
COPY packages/components ./packages/components
COPY packages/contexts ./packages/contexts
COPY packages/datatable-builder ./packages/datatable-builder
COPY packages/form-builder ./packages/form-builder
COPY packages/hooks ./packages/hooks
COPY packages/i18n ./packages/i18n
COPY packages/lib ./packages/lib
COPY packages/ui ./packages/ui

ENV npm_config_ignore_scripts=true

# NEXT_PUBLIC_* vars are baked at build time (create apps/web/.env.build before build).
RUN set -a && \
    [ -f apps/web/.env.build ] && . apps/web/.env.build; \
    set +a && \
    /repo/node_modules/.bin/turbo run build --filter=instanct-ui

# ---- Production image ----
FROM node:22-alpine AS runner

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder --chown=app:app /repo/apps/web/public ./apps/web/public
COPY --from=builder --chown=app:app /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=app:app /repo/apps/web/.next/static ./apps/web/.next/static

USER app

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/web/server.js"]

