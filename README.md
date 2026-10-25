# Instanct

Monorepo for the Instanct web app, landing site, mobile app, and API. The product is a professional discovery and connection platform: profiles, nearby geolocation, chat, sessions, requests, and an admin surface for users, roles, and reference data. A separate `data-flow` app dumps MySQL and uploads the file to Google Drive.

Clients talk to one NestJS API. Shared libraries live in the separate [softsurgery-abstractions](https://github.com/softsurgery/softsurgery-abstractions) repo and are checked out here as the `packages/` git submodule. `packages/nsa-*` holds the Nest abstractions (persistence, users, files, workflows). `@softsurgery/*` holds the UI and HTTP abstractions so the web and mobile apps describe forms, tables, and requests the same way.

| App              | Package               | What it is                        | README                                           |
| ---------------- | --------------------- | --------------------------------- | ------------------------------------------------ |
| `apps/web`       | `instanct-ui`         | Next.js pages-router backoffice   | [apps/web/README.md](apps/web/README.md)         |
| `apps/landing`   | `instanct-landing`    | Next.js app-router marketing site | [apps/landing/README.md](apps/landing/README.md) |
| `apps/mobile`    | `instanct-mobile-app` | Expo Router client                | [apps/mobile/README.md](apps/mobile/README.md)   |
| `apps/api`       | `instanct-api`        | NestJS + TypeORM + MySQL          | [apps/api/README.md](apps/api/README.md)         |
| `apps/data-flow` | `instanct-data-flow`  | MySQL dump to Google Drive        | `apps/data-flow/.env.example`                    |

```text
/
├── apps/
│   ├── web/          # backoffice: pages and portals
│   ├── landing/      # marketing pages and CMS-backed content
│   ├── mobile/       # Expo Router screens, resource modules, React Query hooks
│   ├── data-flow/    # one-shot mysqldump upload
│   └── api/
│       └── src/
│           ├── modules/    # users, requests, geolocation, system reports
│           ├── routers/    # /  /admin  /public  /callback  /test
│           └── seeders/
├── packages/         # git submodule → softsurgery/softsurgery-abstractions
│   ├── nsa-*/        # Nest shared abstractions (database, auth, storage, …)
│   └── @softsurgery/*   # UI, HTTP, form, and table abstractions
├── infra/nginx/      # reverse proxy in front of the apps
├── scripts/
├── package.json
└── pnpm-workspace.yaml
```

## Clone

`packages/` is a submodule. Clone with submodules, or init them after a plain clone:

```sh
git clone --recurse-submodules git@github.com:softsurgery/instanct.git
# or
git submodule update --init --recursive
```

Edit shared packages in [softsurgery-abstractions](https://github.com/softsurgery/softsurgery-abstractions) (or inside the `packages/` working tree). Instanct pins a submodule commit; bump it when you want apps to pick up a new abstractions revision:

```sh
cd packages && git pull origin main && cd ..
git add packages && git commit -m "chore: bump softsurgery-abstractions"
```

## Package manager

The workspace uses **pnpm** (`apps/*`, `packages/*`) with Turbo. App dependencies on `@softsurgery/*` stay `workspace:*`. Install from the repository root:

```sh
pnpm install
```

Do not use npm or Yarn. The root `packageManager` field pins `pnpm@11.25.0`. Node 22 or newer is required (`engines.node` is `>=22`).

## Scripts

`pnpm dev` runs the `dev` script of every app under `apps/`, including `data-flow`, which dumps the database and exits. Prefer a filtered script:

```sh
pnpm dev:web         # Next.js on :3007
pnpm dev:landing     # Next.js on :3008
pnpm dev:mobile      # Expo dev client
pnpm dev:api         # Nest watch mode
pnpm dev:data-flow   # watch the dump job
pnpm data-flow       # build and run one dump
pnpm build
pnpm lint
pnpm check-types        # syncs shared dependencies, then checks types
pnpm check:shared-deps  # validates and syncs shared workspace dependency ranges
pnpm check:expo         # validates Expo SDK and peer dependency alignment
```

Copy each app's `.env.example` to `.env` before running it. Seed the API database only when you need it:

```sh
pnpm --filter instanct-api seed:all
```

## Docker

Images build from the repository root on Node 22. Compose runs the API, the web backoffice, and the landing site. The database and object storage are not part of these files; each service reads its own env file (`env/dev/` or `env/prod/`).

```sh
docker compose -f docker-compose.dev.yml up --build   # api :5005, web :3007, landing :3008
docker compose up --build                              # api :5000, web :3000, landing :3001
```

`python3 scripts/compose.py` is a menu for those stacks, plus nginx and Bugsink.

Start the reverse proxy on its own. It reaches the host apps through `host.docker.internal`:

```sh
docker compose -f infra/nginx/docker-compose.yml up -d
```

Dev hosts on port 80:

```text
app-dev.instanct.com     -> web     (localhost:3007)
api-dev.instanct.com     -> api     (localhost:5005)
landing-dev.instanct.com -> landing (localhost:3008)
```

Production upstreams in the same nginx config are web `:3000`, landing `:3001`, and API `:5000`.

## How a request moves

```text
Web (NextAuth session)   ── createApiClient ──┐
Landing (server fetch)   ── createApiClient ──┼──► nginx :80/:443
Mobile (Expo React Query)── createApiClient ──┘         │
                                                      ▼
                                            NestJS  prefix /api
                                                      │
                              ┌───────────────────────┼────────────────────────┐
                              ▼                       ▼                        ▼
                           /admin                   /                    /public
                     users, roles, logs      product controllers      open reads
                              │                       │
                              ▼                       ▼
                         AuthGuard (@Public skips)
                              │
                              ▼
                    Controller  →  Service  →  Repository  →  MySQL
```

HTTP controllers are mounted by `RouterModule.forRoot()` when `HTTP_ENABLE=true`. The global prefix comes from `API_PREFIX` (default `api`), so a list call looks like `GET /api/admin/...` or `GET /api/requests/list`.

| Prefix      | Role                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `/`         | Authenticated product API: profile, chat, sessions, requests, uploads |
| `/admin`    | Users, roles, permissions, logs                                       |
| `/public`   | Unauthenticated reads                                                 |
| `/callback` | External callbacks                                                    |
| `/test`     | Test routes                                                           |

`AuthGuard` is registered as `APP_GUARD` from `AuthModule`. It verifies the bearer JWT and attaches the payload to the request. Handlers marked `@Public()` skip that check. A failed call returns 401; the web and mobile clients retry once against `/auth/refresh-token` or `/client-auth/refresh-token`.

Validation is global: `ValidationPipe` whitelists and transforms DTO bodies. `ClassSerializerInterceptor` applies `@Expose()` on the way out, which is how `ResponseDtoHelper` renames audit fields.

Socket.IO is a second entry, not a REST prefix. Socket connections are managed through `@softsurgery/lib` (`getSocket`, `disconnectSocket`), authenticated with the same access token across web and mobile:

| Namespace         | Gateway                | Used for                                                                 |
| ----------------- | ---------------------- | ------------------------------------------------------------------------ |
| `/chat`           | `ChatGateway`          | messages, typing indicators, conversation updates                        |
| `/notifications`  | `NotificationGateway`  | live alerts after `@Notify` and `@BatchNotify`                           |
| `/geolocation`    | `GeolocationGateway`   | nearby users on the map                                                  |
| `/presence`       | `UserPresenceGateway`  | real-time client presence tracking, heartbeats, and device active status |
| `/admin/presence` | `AdminPresenceGateway` | administrative real-time presence monitoring across connected users      |

## Persistence conventions

Every persisted row shares audit columns through `EntityHelper`: `createdAt`, `updatedAt`, soft-delete `deletedAt`, and a `restrictDelete` flag. Response DTOs mirror those fields with `ResponseDtoHelper`.

Writes that must be atomic use `@Transactional()` from `@nestjs-cls/transactional`. `ClsModule` is installed in `AppModule` with the TypeORM adapter. Repositories resolve `txHost.tx.getRepository(...)` when a transaction is active and fall back to the injected repository otherwise. A service method and the repositories it calls therefore share one transaction without passing a `QueryRunner` around.

When `DATABASE_SYNCHRONIZE` is false, `MigrationService` applies SQL from the API assets folder after listen. Triggers are a separate bootstrap step: `TriggerSynchronizer` drops and recreates every registered `AbstractTrigger`. See [apps/api/docs/database-triggers.md](apps/api/docs/database-triggers.md).

## Backend abstractions

New API features sit on these bases. Controllers stay thin: they validate a DTO, call a service, and return a response DTO.

### Repository and CRUD service

`DatabaseAbstractRepository<T>` (`packages/nsa-database/src/repositories/database.repository.ts`) is the persistence port. A concrete repository only supplies the TypeORM `Repository<T>` and the optional transaction host. The base class implements find, save, upsert, soft delete, restore, bulk delete, query-builder access, and relation discovery.

`AbstractCrudService<T>` sits on that repository. It turns an `IQueryObject` into TypeORM find options, then exposes `findOneById`, `findAll`, `findAllPaginated`, `save`, `update`, and `delete`. Pagination returns `PageDto` plus `PageMetaDto`. Education, experience, conversations, notifications, sessions, geolocation, and content pages extend this class and add behavior on top.

```text
Controller
  -> Service extends AbstractCrudService<Entity>
       -> Repository extends DatabaseAbstractRepository<Entity>
            -> TypeORM Repository (request transaction, or the default one)
```

### Query string builder

List endpoints accept one query shape (`page`, `limit`, `sort`, `filter`, `select`, `join`, `search`). `QueryBuilder` compiles that string into TypeORM `FindManyOptions`. Filters use lookup tokens separated by `||`, conditions by `;`, and values by `,`:

| Token                     | Meaning          |
| ------------------------- | ---------------- |
| `$eq`                     | equality         |
| `$cont`                   | contains         |
| `$starts` / `$ends`       | prefix / suffix  |
| `$gt` `$gte` `$lt` `$lte` | comparisons      |
| `$in` / `$between`        | lists and ranges |
| `$isnull`                 | null check       |
| `$or`                     | disjunction      |
| `!`                       | negation         |

`join` becomes relations (`relation.nested`), `sort` becomes `order`, and `search` scans string columns on the entity metadata. The web data table and the mobile list hooks send this same language. A column filter in `@softsurgery/datatable-builder` is already a `filter` fragment the API can compile.

### Versioned rows

`DatabaseVersioningAbstractRepository<T>` is the same port for entities whose primary key is `(id, version)` and that carry an `isLatest` flag. Reads by id return the latest row. `findOneByVersion`, `findAllVersions`, and latest-only counts keep history in the same table. Ordinary entities stay on `DatabaseAbstractRepository`.

### Users as a single table hierarchy

Accounts are one MySQL table with a discriminator column. `AbstractUserEntity` is the TypeORM parent (`@TableInheritance` on `users.type`). It owns identity and the relations every account needs: role, password, email, username, sessions, devices, notifications, and logs.

`UserEntity` is the concrete child (`@ChildEntity`). It adds the profile: phone, bio, gender, picture, cover, experiences, education, follows, bookmarks, and geolocation. Another account kind is a new `@ChildEntity` on the same table, not a second users table.

`AbstractUserService` is the matching service base. `UserService` extends it. The base hashes passwords on save and resolves users by id, email, or username. Role and permission rows (`RoleEntity`, `PermissionEntity`, `RolePermissionEntity`) hang off the same user model. Seeded roles are `Admin` and `User`. Devices and multi-device connection sessions are tracked via `UserDeviceEntity` (keyed by MAC address) and `UserConnectionHistoryEntity`.

### Dynamic runtime bindings and lazy module resolution

Shared Nest packages (`@softsurgery/nsa-um`, `@softsurgery/nsa-auth`, `@softsurgery/nsa-chat`, `@softsurgery/nsa-sessions`, etc.) define generic interfaces, abstract services, and injection tokens (`USER_SERVICE`, `USER_REPOSITORY`, `USER_ENTITY`, `USER_DTO`) without statically importing concrete implementations from `apps/api`.

At bootstrap (`apps/api/src/bind-app-values.ts`), concrete classes, DTOs, and enums are registered synchronously:

- `createBindingSlot<T>(initial)` (`@softsurgery/nsa-helpers`) provides typed, encapsulated getter/setter slots for registry state.
- `createLazyModuleRefProxy<T>(resolve)` wraps dependencies in a lazy ES6 Proxy. It resolves on first property access and rebinds functions to the underlying concrete instance (`method.bind(instance)`). This solves the NestJS circular proxy trap (`ModuleRef.get()` during factory init returning proxies that lose `this` context and instance fields when modules reference each other via `forwardRef`).
- `resolveBoundProvider(moduleRef, getter)` wires these utilities directly into Nest provider factories (e.g. `resolveBoundUserService` and `resolveBoundUserRepository` in `AuthModule`).

See [apps/api/docs/runtime-bindings.md](apps/api/docs/runtime-bindings.md).

### File storage as a strategy

`StorageService` (`nsa-storage`) is abstract. Callers inject that class. `storageProvider` reads `s3.driver` (`STORAGE_DRIVER`: `local` or `s3`) and constructs either `LocalStorageService` or `S3StorageService` (AWS SDK). Both implement `store`, `loadResource`, `duplicate`, and `delete`. Shared behavior lives on the base class: lookup by slug or systematic name, expose/hide, confirm a temporary upload, and a cron that deletes temporary files every two hours. Metadata for every file is a `StorageEntity` row, independent of where the bytes sit.

### Workflows

Status changes that have legal and illegal transitions go through `AbstractWorkflowService<Status, Event>`. It wraps an [XState](https://xstate.js.org/) machine:

- `canTransition(status, event)` asks the machine whether the event is legal.
- `transition(status, event)` returns the next status or throws `BadRequestException`.
- `getNextSteps(status)` lists events the current state accepts.
- `isUpdatable(status)` reads `isUpdatable` from the state meta.

`RequestWorkflowService` is the current subclass. It loads a request, asks the machine for the next status, and persists that status through `RequestService`. A new workflow is a machine plus a subclass.

### Database triggers

MySQL triggers are application code, synchronized on bootstrap. `AbstractTrigger` implements the `DatabaseTrigger` contract: a base name, an `apply` list of `{ table, BEFORE|AFTER, INSERT|UPDATE|DELETE }`, and the SQL for the function and each trigger. Names are truncated to MySQL's 64-character limit. `TriggerRegistry` collects triggers; `TriggerSynchronizer` drops and recreates them on `OnApplicationBootstrap`. Chat uses this for conversation last-message and participant counters. See [apps/api/docs/database-triggers.md](apps/api/docs/database-triggers.md).

### Notifications

`@Notify` and `@BatchNotify` only set metadata. `NotificationInterceptor` reads that metadata after the handler finishes, then `NotificationGateway` writes a `NotificationEntity` and emits it on `/notifications`. Offline users read the row later. The controller must use `@UseInterceptors(NotificationInterceptor)` or the decorators do nothing. See [apps/api/docs/notifications.md](apps/api/docs/notifications.md).

### Reference data and configuration

Lookup lists (industries, objectives, and similar catalogs) are data, not TypeScript enums. `RefTypeEntity` is a tree (`parent` / `children`). `RefParamEntity` is a value under a type, with an optional JSON `extras` blob. The backoffice edits the tree; mobile reads it through `useIndustries` and `useObjectives`.

Runtime settings use the same shape. `ConfigurationNamespaceEntity` groups `ConfigurationParamEntity` rows, optionally scoped to a user. Seed commands load core, maps, and application namespaces. The map gateway reads the maps namespace when it decides who is nearby.

### Templates and content pages

`ContentPageEntity` in `@softsurgery/nsa-content` (via `ContentPageService extends AbstractCrudService`) stores HTML by slug and locale: `terms`, `privacy`, `about`, `faqs`, and `support`. Landing loads `terms`, `privacy`, and `support`. Mobile settings load the same slugs, including `about` and `faqs`. Email and document layouts live in `@softsurgery/nsa-templates` (`TemplateEntity`, `TemplateStyleEntity`) and are seeded with `seed:templates`. The backoffice edits them through `@softsurgery/template`.

## Frontend abstractions

`packages/` is the shared layer. Nest code imports `@softsurgery/nsa-*`. Web and landing import the React packages. Mobile imports the React Native twins plus `@softsurgery/hooks` and `@softsurgery/lib`. Feature code in an app should call these packages instead of reimplementing a table, a form, or an Axios instance.

| Package                                                                                                                                 | What it abstracts                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `@softsurgery/nsa-database`                                                                                                             | Repository, CRUD service, query builder, migrations, triggers                                  |
| `@softsurgery/nsa-um`                                                                                                                   | User table hierarchy, roles, permissions                                                       |
| `@softsurgery/nsa-auth`                                                                                                                 | JWT guard, sign-in, devices                                                                    |
| `@softsurgery/nsa-storage`                                                                                                              | Local and S3 file storage                                                                      |
| `@softsurgery/nsa-chat`, `@softsurgery/nsa-sessions`, `@softsurgery/nsa-notifications`                                                  | Conversations, sessions, live alerts                                                           |
| `@softsurgery/nsa-content`, `@softsurgery/nsa-templates`, `@softsurgery/nsa-configurations`, `@softsurgery/nsa-reference-types`         | CMS pages, layouts, settings, lookup trees                                                     |
| `@softsurgery/nsa-workflows`, `@softsurgery/nsa-mail`, `@softsurgery/nsa-logger`, `@softsurgery/nsa-sentry`, `@softsurgery/nsa-helpers` | Status machines, mail, request logs, error reporting, shared helpers and runtime binding slots |
| `@softsurgery/api-client`                                                                                                               | Axios instance and one resource object per API area                                            |
| `@softsurgery/form-builder`                                                                                                             | Declarative web forms                                                                          |
| `@softsurgery/mobile-form-builder`                                                                                                      | The same form model for React Native                                                           |
| `@softsurgery/datatable-builder`                                                                                                        | Server-driven admin tables                                                                     |
| `@softsurgery/ui` / `@softsurgery/components`                                                                                           | Web primitives (Radix, editor, toasts) and composites                                          |
| `@softsurgery/mobile-ui` / `@softsurgery/mobile-components`                                                                             | Native primitives and composites                                                               |
| `@softsurgery/template`                                                                                                                 | Template list, editor, and preview for the backoffice                                          |
| `@softsurgery/hooks`                                                                                                                    | Persisted auth and preference stores, shared hooks                                             |
| `@softsurgery/contexts`                                                                                                                 | Breadcrumb, intro, footer, theme, and `AppProvider`                                            |
| `@softsurgery/lib`                                                                                                                      | `cn`, centralized socket management, nested stores, legal HTML cleanup                         |
| `@softsurgery/i18n`                                                                                                                     | Shared `en` / `fr` config. Landing copies live here                                            |
| `@repo/eslint-config`, `@repo/typescript-config`                                                                                        | Tooling                                                                                        |

### API client

`createApiClient({ baseURL, authAdapter })` builds one Axios instance and a tree of resources (`auth`, `admin.user`, `admin.role`, `upload`, `notification`, `experience`, `contentPage`, `chat`, `session`, and so on). The request interceptor attaches the bearer token from `useAuthPersistStore`, the `x-timezone` header, and `x-custom-lang` from `localStorage`. A 401 retries once against `/auth/refresh-token` or `/client-auth/refresh-token`, then calls `onUnauthorized`.

Web (`apps/web/src/lib/api.ts`), landing (`apps/landing/src/lib/api.ts`), and mobile (`apps/mobile/lib/api.ts`) all use `@softsurgery/api-client`. Web hooks into NextAuth session handling, landing reads public content pages, and mobile wires its persisted Zustand store (`useAuthPersistStore`). React Query hooks under `apps/mobile/hooks/content/` invoke these unified resource functions directly.

### Form builder

Screens do not assemble inputs by hand. A hook returns a `FormStructure`:

```text
FormStructure
  └── fieldsets[]
        └── rows[]
              └── fields[]   { id, variant, label, error, props }
```

`FieldVariant` selects the control (`text`, `select`, `combo_box`, `editor`, `avatar`, `image_gallery`, `custom`, and others). `FormBuilder` walks that tree and renders headers, optional accordion fieldsets, and `FieldBuilder` for each field. The screen owns validation and submit. The structure only describes layout and bindings: `props.value` and `props.onChange` point at a Zustand store (`setNested` from `@softsurgery/lib`).

Web hooks live next to the feature, for example `useCreateEducationFormStructure`. Mobile uses `@softsurgery/mobile-form-builder` with the same tree and native controls (map pin, picture upload, date and time). Zod schemas in each app validate the DTO before the resource function runs.

### Data table

Admin lists pass a `DataTableConfig` into `@softsurgery/datatable-builder`: page, page size, sort, search, column filters, and row callbacks (`create`, `inspect`, `update`, `delete`). Column meta declares how a column filters (`string`, `select`, `date-range`) and how it exports. `useDataTableState(tableId)` persists page, sort, search, and filters in local storage and produces the query string `QueryBuilder` understands.

A backoffice screen follows one shape, visible in `Users` and the `*Portal` components:

1. A page under `apps/web/src/pages` renders a portal or feature component.
2. The component sets breadcrumb and intro through `@softsurgery/contexts`.
3. `useQuery` calls `api.admin.*` with the table's query string.
4. `DataTable` renders the rows. Sheets and dialogs own create, update, and delete, each backed by a form structure or a confirm action.

### App shell context

`AppProvider` (`@softsurgery/contexts`) receives `{ appType, api }`. The backoffice sets `appType: "admin"` so shared components know which resource tree to call. `ThemeProvider` is the same context on web and landing (`class` on `<html>`, default `light`). Mobile reads the theme from `usePreferencePersistStore` in `@softsurgery/hooks` and applies it with NativeWind.

## Further reading

- [API](apps/api/README.md), [runtime bindings](apps/api/docs/runtime-bindings.md), [triggers](apps/api/docs/database-triggers.md), [notifications](apps/api/docs/notifications.md)
- [Web backoffice](apps/web/README.md)
- [Mobile app](apps/mobile/README.md)
- [Landing site](apps/landing/README.md)
