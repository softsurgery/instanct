# Build from the repository root:
#   docker build -f apps/mobile/Dockerfile -t instanct-mobile:dev .

FROM node:22-alpine

WORKDIR /repo

RUN apk add --no-cache libc6-compat && \
    corepack enable && corepack prepare pnpm@11.25.0 --activate && \
    printf 'ignore-scripts=true\n' > .npmrc

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY patches ./patches

# App package.json stubs (needed by pnpm workspace resolution)
COPY apps/api/package.json ./apps/api/package.json
RUN sed -i '/"postinstall":/d' apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/landing/package.json ./apps/landing/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
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
COPY packages/softsurgery-abstractions/mobile-components/package.json ./packages/softsurgery-abstractions/mobile-components/package.json
COPY packages/softsurgery-abstractions/mobile-form-builder/package.json ./packages/softsurgery-abstractions/mobile-form-builder/package.json
COPY packages/softsurgery-abstractions/mobile-hooks/package.json ./packages/softsurgery-abstractions/mobile-hooks/package.json
COPY packages/softsurgery-abstractions/mobile-lib/package.json ./packages/softsurgery-abstractions/mobile-lib/package.json
COPY packages/softsurgery-abstractions/mobile-ui/package.json ./packages/softsurgery-abstractions/mobile-ui/package.json
COPY packages/softsurgery-abstractions/typescript-config ./packages/softsurgery-abstractions/typescript-config
COPY packages/softsurgery-abstractions/ui/package.json ./packages/softsurgery-abstractions/ui/package.json

# Install dependencies for mobile and its workspace packages
RUN --mount=type=cache,id=pnpm,target=/root/.cache/pnpm \
    pnpm install --frozen-lockfile --filter instanct-mobile-app... --ignore-scripts && \
    pnpm store prune


# Copy workspace packages mobile depends on
COPY packages/api-client ./packages/api-client
COPY packages/softsurgery-abstractions/hooks ./packages/softsurgery-abstractions/hooks
COPY packages/softsurgery-abstractions/lib ./packages/softsurgery-abstractions/lib
COPY packages/softsurgery-abstractions/mobile-components ./packages/softsurgery-abstractions/mobile-components
COPY packages/softsurgery-abstractions/mobile-form-builder ./packages/softsurgery-abstractions/mobile-form-builder
COPY packages/softsurgery-abstractions/mobile-hooks ./packages/softsurgery-abstractions/mobile-hooks
COPY packages/softsurgery-abstractions/mobile-lib ./packages/softsurgery-abstractions/mobile-lib
COPY packages/softsurgery-abstractions/mobile-ui ./packages/softsurgery-abstractions/mobile-ui

# Copy mobile app source
COPY apps/mobile ./apps/mobile

# Build-time environment file
ARG MOBILE_ENV_FILE=env/dev/mobile.env
COPY ${MOBILE_ENV_FILE} /tmp/mobile.env
RUN rm -f apps/mobile/.env apps/mobile/.env.local && cp /tmp/mobile.env apps/mobile/.env.local

# Build NativeWind stylesheet cache
RUN pnpm --filter instanct-mobile-app run postinstall

WORKDIR /repo/apps/mobile

# Copy and set up container entrypoint script for Expo login
COPY apps/mobile/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV EXPO_UNSAFE_DOTENV_KEYS=1
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV PORT=8081
EXPOSE 8081

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npx", "expo", "start", "--dev-client"]
