# Instanct

Monorepo for the Instanct web app, mobile app, and API.

```text
/
├── apps/
│   ├── web/       # Next.js (instanct-ui)
│   ├── mobile/    # Expo React Native (instanct-mobile-app)
│   └── api/       # NestJS (instanct-api)
├── packages/      # shared Turbo packages (eslint, typescript, ui)
├── package.json
└── pnpm-workspace.yaml
```

## Package manager

The workspace root uses **pnpm** workspaces (`apps/*`, `packages/*`) with Turbo.

Each imported application still declares Yarn Classic (`yarn@1.22.22`) and keeps its own `yarn.lock`. That is intentional: unifying Next.js, Expo, and NestJS into a single Yarn 1 hoist graph would require `nohoist` / resolution changes. Apps can still be installed independently with Yarn from their own directories.

## Scripts

```sh
pnpm install --ignore-scripts   # ignore-scripts avoids apps/api postinstall DB seeding
pnpm dev:web
pnpm dev:mobile
pnpm dev:api
pnpm build
pnpm lint
```

Copy each app's `.env.example` to `.env` before running it. The API `postinstall` script seeds the database; run that only when a database is available.
