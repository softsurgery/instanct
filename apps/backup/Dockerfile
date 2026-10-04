# Build from the repository root:
#   docker build -f apps/backup/Dockerfile -t instanct-backup .
#
#   docker run --rm --env-file apps/backup/.env \
#     -e GDRIVE_SERVICE_ACCOUNT_FILE=/secrets/gdrive-service-account.json \
#     -v /path/to/gdrive-service-account.json:/secrets/gdrive-service-account.json:ro \
#     -v instanct-backups:/backups \
#     instanct-backup

FROM node:22-bookworm-slim AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/backup/package.json ./apps/backup/package.json
COPY apps/landing/package.json ./apps/landing/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY apps/web/package.json ./apps/web/package.json

COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/components/package.json ./packages/components/package.json
COPY packages/contexts/package.json ./packages/contexts/package.json
COPY packages/datatable-builder/package.json ./packages/datatable-builder/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/form-builder/package.json ./packages/form-builder/package.json
COPY packages/hooks/package.json ./packages/hooks/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json
COPY packages/lib/package.json ./packages/lib/package.json
COPY packages/mobile-components/package.json ./packages/mobile-components/package.json
COPY packages/mobile-form-builder/package.json ./packages/mobile-form-builder/package.json
COPY packages/mobile-ui/package.json ./packages/mobile-ui/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-backup... --ignore-scripts

COPY apps/backup ./apps/backup
RUN rm -rf apps/backup/dist && cd apps/backup && /repo/node_modules/.bin/nest build
RUN test -f /repo/apps/backup/dist/main.js

RUN pnpm deploy --legacy --filter instanct-backup --prod --ignore-scripts /pruned

FROM node:22-bookworm-slim AS runner

RUN apt-get update \
    && apt-get install -y --no-install-recommends default-mysql-client \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --create-home --user-group app

WORKDIR /app

COPY --from=builder --chown=app:app /repo/apps/backup/dist ./dist
COPY --from=builder --chown=app:app /pruned/node_modules ./node_modules
COPY --from=builder --chown=app:app /repo/apps/backup/package.json ./

RUN mkdir -p /backups && chown app:app /backups

USER app

ENV NODE_ENV=production
ENV BACKUP_DIR=/backups
ENV GDRIVE_SERVICE_ACCOUNT_FILE=/secrets/gdrive-service-account.json

VOLUME ["/backups"]

CMD ["node", "dist/main.js"]
