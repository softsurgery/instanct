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
pnpm install --ignore-scripts   # ignore-scripts avoids apps/api postinstall DB seeding
```

Do not use npm or Yarn. The root `packageManager` field pins `pnpm@11.25.0`.

## Scripts

```sh
pnpm dev          # web, landing, mobile, and API
pnpm dev:web
pnpm dev:landing
pnpm dev:mobile
pnpm dev:api
pnpm build
pnpm lint
```

Copy each app's `.env.example` to `.env` before running it. The API `postinstall` script seeds the database; run that only when a database is available.
