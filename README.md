# Instanct

Monorepo for the Instanct web app, landing site, mobile app, and API.

```text
/
├── apps/
│   ├── web/       # Next.js (instanct-ui)
│   ├── landing/   # Next.js marketing site (instanct-landing)
│   ├── mobile/    # Expo React Native (instanct-mobile-app)
│   └── api/       # NestJS (instanct-api)
├── packages/      # shared Turbo packages (eslint, typescript, ui)
├── package.json
└── pnpm-workspace.yaml
```

## Package manager

The workspace uses **pnpm** (`apps/*`, `packages/*`) with Turbo. Install from the repository root:

```sh
pnpm install
```

Do not use npm or Yarn. The root `packageManager` field pins `pnpm@11.25.0`.

## Scripts

```sh
pnpm dev          # web, landing, mobile, API, and nginx
pnpm dev:web
pnpm dev:landing
pnpm dev:mobile
pnpm dev:api
pnpm dev:nginx
pnpm build
pnpm lint
```

Copy each app's `.env.example` to `.env` before running it. Seed the API database only when you need it:

```sh
pnpm --filter instanct-api seed:all
```

Dev nginx (`pnpm dev` or `pnpm dev:nginx`) proxies host apps on port 80:

```text
app-dev.instanct.com     -> web     (localhost:3007)
api-dev.instanct.com     -> api     (localhost:5005)
landing-dev.instanct.com -> landing (localhost:3008)
```
