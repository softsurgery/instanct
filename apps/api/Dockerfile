# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t instanct-api .

# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# Prevent workspace postinstall hooks (DB seeders) during image builds.
RUN printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile --filter instanct-api... --ignore-scripts && \
    pnpm rebuild bcrypt

COPY apps/api ./apps/api
COPY packages ./packages

RUN cd apps/api && /repo/node_modules/.bin/nest build

# --- Runtime Stage ---
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/package.json ./

CMD ["dist/main.js"]
