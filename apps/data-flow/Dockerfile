# Build from the repository root:
#   docker build -f apps/data-flow/Dockerfile -t instanct-data-flow .
#
#   docker run --rm -p 3009:3009 instanct-data-flow

FROM node:22-bookworm-slim AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate && \
    printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches

COPY apps/api/package.json ./apps/api/package.json
RUN sed -i '/"postinstall":/d' apps/api/package.json
COPY apps/data-flow/package.json ./apps/data-flow/package.json
COPY apps/landing/package.json ./apps/landing/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api-client/package.json ./apps/api-client/package.json
COPY apps/i18n/package.json ./apps/i18n/package.json

COPY packages/chat-materials/package.json ./packages/chat-materials/package.json
COPY packages/components/package.json ./packages/components/package.json
COPY packages/contexts/package.json ./packages/contexts/package.json
COPY packages/datatable-builder/package.json ./packages/datatable-builder/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/form-builder/package.json ./packages/form-builder/package.json
COPY packages/hooks/package.json ./packages/hooks/package.json
COPY packages/lib/package.json ./packages/lib/package.json
COPY packages/mobile-components/package.json ./packages/mobile-components/package.json
COPY packages/mobile-form-builder/package.json ./packages/mobile-form-builder/package.json
COPY packages/mobile-hooks/package.json ./packages/mobile-hooks/package.json
COPY packages/mobile-lib/package.json ./packages/mobile-lib/package.json
COPY packages/mobile-ui/package.json ./packages/mobile-ui/package.json
COPY packages/template/package.json ./packages/template/package.json
COPY packages/typescript-config ./packages/typescript-config
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-data-flow... --ignore-scripts

COPY apps/data-flow ./apps/data-flow
COPY scripts/allowed-dev-origins.ts ./scripts/allowed-dev-origins.ts

ENV npm_config_ignore_scripts=true
RUN cd /repo/apps/data-flow && NODE_ENV=production /repo/node_modules/.bin/next build

FROM node:22-bookworm-slim AS runner

RUN useradd --system --create-home --user-group app

WORKDIR /app

COPY --from=builder --chown=app:app /repo/apps/data-flow/.next/standalone ./
COPY --from=builder --chown=app:app /repo/apps/data-flow/.next/static ./apps/data-flow/.next/static

USER app

ENV NODE_ENV=production
ENV PORT=3009
ENV HOSTNAME=0.0.0.0

EXPOSE 3009

CMD ["node", "apps/data-flow/server.js"]
