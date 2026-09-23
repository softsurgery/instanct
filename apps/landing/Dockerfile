# Build from the repository root:
#   docker build -f apps/landing/Dockerfile -t instanct-landing .

FROM node:22-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

RUN printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/landing/package.json ./apps/landing/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json
COPY packages/components/package.json ./packages/components/package.json
COPY packages/contexts/package.json ./packages/contexts/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/lib/package.json ./packages/lib/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-landing... --ignore-scripts

COPY apps/landing ./apps/landing
COPY packages ./packages

RUN set -a && \
    [ -f apps/landing/.env.build ] && . apps/landing/.env.build; \
    set +a && \
    /repo/node_modules/.bin/turbo run build --filter=instanct-landing

# ---- Production image ----
FROM gcr.io/distroless/nodejs22-debian12 AS runner

WORKDIR /app

COPY --from=builder /repo/apps/landing/.next ./.next
COPY --from=builder /repo/apps/landing/public ./public
COPY --from=builder /repo/apps/landing/package.json ./package.json
COPY --from=builder /repo/apps/landing/next.config.ts ./next.config.ts
COPY --from=builder /repo/node_modules ./node_modules

EXPOSE 3002

CMD ["node_modules/next/dist/bin/next", "start"]
