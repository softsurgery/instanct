# Build from the repository root:
#   docker build -f apps/landing/Dockerfile -t instanct-landing .

FROM node:22-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate && \
    printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY patches ./patches

# App package.json stubs (needed by pnpm workspace resolution)
COPY apps/api/package.json ./apps/api/package.json
RUN sed -i '/"postinstall":/d' apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/landing/package.json ./apps/landing/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json

# Package stubs for pnpm install (all workspace members must be present)
COPY packages/softsurgery-abstractions/components/package.json ./packages/softsurgery-abstractions/components/package.json
COPY packages/softsurgery-abstractions/contexts/package.json ./packages/softsurgery-abstractions/contexts/package.json
COPY packages/softsurgery-abstractions/datatable-builder/package.json ./packages/softsurgery-abstractions/datatable-builder/package.json
COPY packages/softsurgery-abstractions/eslint-config/package.json ./packages/softsurgery-abstractions/eslint-config/package.json
COPY packages/softsurgery-abstractions/form-builder/package.json ./packages/softsurgery-abstractions/form-builder/package.json
COPY packages/softsurgery-abstractions/hooks/package.json ./packages/softsurgery-abstractions/hooks/package.json
COPY packages/softsurgery-abstractions/lib/package.json ./packages/softsurgery-abstractions/lib/package.json

COPY packages/softsurgery-abstractions/typescript-config ./packages/softsurgery-abstractions/typescript-config
COPY packages/softsurgery-abstractions/ui/package.json ./packages/softsurgery-abstractions/ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-landing... --ignore-scripts

COPY apps/landing ./apps/landing
COPY scripts/allowed-dev-origins.ts ./scripts/allowed-dev-origins.ts

# Copy only the packages landing actually uses
COPY packages/api-client ./packages/api-client
COPY packages/i18n ./packages/i18n
COPY packages/softsurgery-abstractions/components ./packages/softsurgery-abstractions/components
COPY packages/softsurgery-abstractions/contexts ./packages/softsurgery-abstractions/contexts
COPY packages/softsurgery-abstractions/form-builder ./packages/softsurgery-abstractions/form-builder
COPY packages/softsurgery-abstractions/hooks ./packages/softsurgery-abstractions/hooks
COPY packages/softsurgery-abstractions/lib ./packages/softsurgery-abstractions/lib
COPY packages/softsurgery-abstractions/ui ./packages/softsurgery-abstractions/ui

ENV npm_config_ignore_scripts=true

ARG LANDING_ENV_FILE=env/prod/landing.env
COPY ${LANDING_ENV_FILE} /tmp/landing.env
RUN grep -E '^(NEXT_PUBLIC_|API_BASE_URL=)' /tmp/landing.env > apps/landing/.env && \
    set -a && . apps/landing/.env && set +a && \
    NODE_ENV=production /repo/node_modules/.bin/turbo run build --filter=instanct-landing

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
