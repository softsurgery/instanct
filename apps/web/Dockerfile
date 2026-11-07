# Build from the repository root:
#   docker build -f apps/web/Dockerfile -t instanct-backoffice .

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
COPY packages/softsurgery-abstractions/template/package.json ./packages/softsurgery-abstractions/template/package.json
COPY packages/softsurgery-abstractions/chat-materials/package.json ./packages/softsurgery-abstractions/chat-materials/package.json
COPY packages/softsurgery-abstractions/mobile-components/package.json ./packages/softsurgery-abstractions/mobile-components/package.json
COPY packages/softsurgery-abstractions/mobile-form-builder/package.json ./packages/softsurgery-abstractions/mobile-form-builder/package.json
COPY packages/softsurgery-abstractions/mobile-hooks/package.json ./packages/softsurgery-abstractions/mobile-hooks/package.json
COPY packages/softsurgery-abstractions/mobile-lib/package.json ./packages/softsurgery-abstractions/mobile-lib/package.json
COPY packages/softsurgery-abstractions/mobile-ui/package.json ./packages/softsurgery-abstractions/mobile-ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-ui... --ignore-scripts

COPY apps/web ./apps/web
COPY scripts/allowed-dev-origins.ts ./scripts/allowed-dev-origins.ts

# Copy only the packages web actually uses
COPY packages/api-client ./packages/api-client
COPY packages/i18n ./packages/i18n
COPY packages/softsurgery-abstractions/components ./packages/softsurgery-abstractions/components
COPY packages/softsurgery-abstractions/contexts ./packages/softsurgery-abstractions/contexts
COPY packages/softsurgery-abstractions/datatable-builder ./packages/softsurgery-abstractions/datatable-builder
COPY packages/softsurgery-abstractions/form-builder ./packages/softsurgery-abstractions/form-builder
COPY packages/softsurgery-abstractions/hooks ./packages/softsurgery-abstractions/hooks
COPY packages/softsurgery-abstractions/lib ./packages/softsurgery-abstractions/lib
COPY packages/softsurgery-abstractions/ui ./packages/softsurgery-abstractions/ui
COPY packages/softsurgery-abstractions/template ./packages/softsurgery-abstractions/template
COPY packages/softsurgery-abstractions/chat-materials ./packages/softsurgery-abstractions/chat-materials
COPY packages/softsurgery-abstractions/mobile-components ./packages/softsurgery-abstractions/mobile-components
COPY packages/softsurgery-abstractions/mobile-form-builder ./packages/softsurgery-abstractions/mobile-form-builder
COPY packages/softsurgery-abstractions/mobile-hooks ./packages/softsurgery-abstractions/mobile-hooks
COPY packages/softsurgery-abstractions/mobile-lib ./packages/softsurgery-abstractions/mobile-lib
COPY packages/softsurgery-abstractions/mobile-ui ./packages/softsurgery-abstractions/mobile-ui

ENV npm_config_ignore_scripts=true

# Next.js inlines NEXT_PUBLIC_* at build time. Compose selects dev or prod.
ARG WEB_ENV_FILE=env/prod/web.env
COPY ${WEB_ENV_FILE} /tmp/web.env
RUN grep -E '^(NEXT_PUBLIC_|BASE_URL=)' /tmp/web.env > apps/web/.env && \
    set -a && . apps/web/.env && set +a && \
    /repo/node_modules/.bin/turbo run build --filter=instanct-ui

# ---- Production image ----
FROM node:22-alpine AS runner

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder --chown=app:app /repo/apps/web/public ./apps/web/public
COPY --from=builder --chown=app:app /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=app:app /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=app:app /repo/apps/web/next-i18next.config.mjs ./apps/web/next-i18next.config.mjs

USER app

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
