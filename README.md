# Instanct

Monorepo for the Instanct web app, landing site, mobile app, and API. The product is a professional discovery and connection platform: profiles, nearby geolocation, chat, sessions, requests, and an admin surface for users, roles, and reference data.

Clients talk to one NestJS API. Shared packages hold the UI and HTTP abstractions so the web and mobile apps describe forms, tables, and requests the same way the API describes persistence, users, files, and workflows.

| App | Package | What it is | README |
| --- | --- | --- | --- |
| `apps/web` | `instanct-ui` | Next.js pages-router backoffice | [apps/web/README.md](apps/web/README.md) |
| `apps/landing` | `instanct-landing` | Next.js app-router marketing site | [apps/landing/README.md](apps/landing/README.md) |
| `apps/mobile` | `instanct-mobile-app` | Expo Router client | [apps/mobile/README.md](apps/mobile/README.md) |
| `apps/api` | `instanct-api` | NestJS + TypeORM + MySQL | [apps/api/README.md](apps/api/README.md) |

```text
/
├── apps/
│   ├── web/          # backoffice: pages, portals, form structures, data tables
│   ├── landing/      # marketing pages and CMS-backed legal content
│   ├── mobile/       # Expo Router screens, resource modules, React Query hooks
│   └── api/
│       └── src/
│           ├── modules/    # users, requests, geolocation, system reports
│           ├── shared/     # auth, chat, sessions, storage, notifications, …
│           ├── routers/    # /  /admin  /public  /callback  /test
│           └── seeders/
├── packages/         # @instanct/* UI, HTTP, form, and table abstractions
├── infra/nginx/      # reverse proxy in front of the apps
├── package.json
└── pnpm-workspace.yaml
```

## Package manager

The workspace uses **pnpm** (`apps/*`, `packages/*`) with Turbo. Install from the repository root:

```sh
pnpm install
```

Do not use npm or Yarn. The root `packageManager` field pins `pnpm@11.25.0`. Node 18 or newer is required.

## Scripts

```sh
pnpm dev          # web, landing, mobile, and API
pnpm dev:web      # Next.js on :3007
pnpm dev:landing  # Next.js on :3008
pnpm dev:mobile   # Expo dev client
pnpm dev:api      # Nest watch mode
pnpm build
pnpm lint
pnpm check-types
```

Copy each app's `.env.example` to `.env` before running it. Seed the API database only when you need it:

```sh
pnpm --filter instanct-api seed:all
```

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
Web (NextAuth session)  ── createApiClient ──┐
Landing (server fetch)  ── createApiClient ──┼──► nginx :80/:443
Mobile (Expo axios)     ── api/*.ts       ──┘         │
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

| Prefix | Role |
| --- | --- |
| `/` | Authenticated product API: profile, chat, sessions, requests, uploads |
| `/admin` | Users, roles, permissions, logs |
| `/public` | Unauthenticated reads |
| `/callback` | External callbacks |
| `/test` | Test routes |

`AuthGuard` is registered as `APP_GUARD` from `AuthModule`. It verifies the bearer JWT and attaches the payload to the request. Handlers marked `@Public()` skip that check. A failed call returns 401; the web and mobile clients retry once against `/auth/refresh-token`.

Validation is global: `ValidationPipe` whitelists and transforms DTO bodies. `ClassSerializerInterceptor` applies `@Expose()` on the way out, which is how `ResponseDtoHelper` renames audit fields.

Socket.IO is a second entry, not a REST prefix. Mobile opens one connection per namespace through `getSocket` in `apps/mobile/lib/socket.ts`, authenticated with the same access token:

| Namespace | Gateway | Used for |
| --- | --- | --- |
| `/chat` | `ChatGateway` | messages, presence, conversation updates |
| `/notifications` | `NotificationGateway` | live alerts after `@Notify` |
| `/geolocation` | `GeolocationGateway` | nearby users on the map |

## Persistence conventions

Every persisted row shares audit columns through `EntityHelper`: `createdAt`, `updatedAt`, soft-delete `deletedAt`, and a `restrictDelete` flag. Response DTOs mirror those fields with `ResponseDtoHelper`.

Writes that must be atomic use `@Transactional()` from `@nestjs-cls/transactional`. `ClsModule` is installed in `AppModule` with the TypeORM adapter. Repositories resolve `txHost.tx.getRepository(...)` when a transaction is active and fall back to the injected repository otherwise. A service method and the repositories it calls therefore share one transaction without passing a `QueryRunner` around.

When `DATABASE_SYNCHRONIZE` is false, `MigrationService` applies SQL from the API assets folder after listen. Triggers are a separate bootstrap step: `TriggerSynchronizer` drops and recreates every registered `AbstractTrigger`. See [apps/api/docs/database-triggers.md](apps/api/docs/database-triggers.md).

## Backend abstractions

New API features sit on these bases. Controllers stay thin: they validate a DTO, call a service, and return a response DTO.

### Repository and CRUD service

`DatabaseAbstractRepository<T>` (`apps/api/src/shared/database/repositories/database.repository.ts`) is the persistence port. A concrete repository only supplies the TypeORM `Repository<T>` and the optional transaction host. The base class implements find, save, upsert, soft delete, restore, bulk delete, query-builder access, and relation discovery.

`AbstractCrudService<T>` sits on that repository. It turns an `IQueryObject` into TypeORM find options, then exposes `findOneById`, `findAll`, `findAllPaginated`, `save`, `update`, and `delete`. Pagination returns `PageDto` plus `PageMetaDto`. Education, experience, conversations, notifications, sessions, geolocation, and content pages extend this class and add behavior on top.

```text
Controller
  -> Service extends AbstractCrudService<Entity>
       -> Repository extends DatabaseAbstractRepository<Entity>
            -> TypeORM Repository (request transaction, or the default one)
```

### Query string builder

List endpoints accept one query shape (`page`, `limit`, `sort`, `filter`, `select`, `join`, `search`). `QueryBuilder` compiles that string into TypeORM `FindManyOptions`. Filters use lookup tokens separated by `||`, conditions by `;`, and values by `,`:

| Token | Meaning |
| --- | --- |
| `$eq` | equality |
| `$cont` | contains |
| `$starts` / `$ends` | prefix / suffix |
| `$gt` `$gte` `$lt` `$lte` | comparisons |
| `$in` / `$between` | lists and ranges |
| `$isnull` | null check |
| `$or` | disjunction |
| `!` | negation |

`join` becomes relations (`relation.nested`), `sort` becomes `order`, and `search` scans string columns on the entity metadata. The web data table and the mobile list hooks send this same language. A column filter in `@instanct/datatable-builder` is already a `filter` fragment the API can compile.

### Versioned rows

`DatabaseVersioningAbstractRepository<T>` is the same port for entities whose primary key is `(id, version)` and that carry an `isLatest` flag. Reads by id return the latest row. `findOneByVersion`, `findAllVersions`, and latest-only counts keep history in the same table. Ordinary entities stay on `DatabaseAbstractRepository`.

### Users as a single table hierarchy

Accounts are one MySQL table with a discriminator column. `AbstractUserEntity` is the TypeORM parent (`@TableInheritance` on `users.type`). It owns identity and the relations every account needs: role, password, email, username, sessions, devices, notifications, and logs.

`UserEntity` is the concrete child (`@ChildEntity`). It adds the profile: phone, bio, gender, picture, cover, experiences, education, follows, bookmarks, and geolocation. Another account kind is a new `@ChildEntity` on the same table, not a second users table.

`AbstractUserService` is the matching service base. `UserService` extends it. The base hashes passwords on save and resolves users by id, email, or username. Role and permission rows (`RoleEntity`, `PermissionEntity`, `RolePermissionEntity`) hang off the same user model. Seeded roles are `Admin` and `User`.

### File storage as a strategy

`StorageService` is abstract. Callers inject that class. `storageProvider` reads `s3.driver` (`STORAGE_DRIVER`) and constructs either `LocalStorageService` or `MinioStorageService`. Both implement `store`, `loadResource`, `duplicate`, and `delete`. Shared behavior lives on the base class: lookup by slug or systematic name, expose/hide, confirm a temporary upload, and a cron that deletes temporary files every two hours. Metadata for every file is a `StorageEntity` row, independent of where the bytes sit.

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

`ContentPageEntity` (via `ContentPageService extends AbstractCrudService`) stores legal and marketing HTML by slug and locale. The landing site loads `terms` and `privacy` with `findBySlug`. Email and document layouts live in the templates module (`TemplateEntity`, `TemplateStyleEntity`) and are seeded with `seed:templates`.

## Frontend abstractions

`packages/` is the shared layer. Web and landing import the React packages. Mobile imports the React Native twins plus `@instanct/hooks` and `@instanct/lib`. Feature code in an app should call these packages instead of reimplementing a table, a form, or an Axios instance.

| Package | What it abstracts |
| --- | --- |
| `@instanct/api-client` | Axios instance and one resource object per API area |
| `@instanct/form-builder` | Declarative web forms |
| `@instanct/mobile-form-builder` | The same form model for React Native |
| `@instanct/datatable-builder` | Server-driven admin tables |
| `@instanct/ui` / `@instanct/components` | Web primitives (Radix, editor, toasts) and composites |
| `@instanct/mobile-ui` / `@instanct/mobile-components` | Native primitives and composites |
| `@instanct/hooks` | Persisted auth and preference stores, shared hooks |
| `@instanct/contexts` | Breadcrumb, intro, footer, theme, and `AppProvider` |
| `@instanct/lib` | `cn`, nested stores, legal HTML cleanup |
| `@instanct/i18n` | Shared `en` / `fr` config. Landing copies live here |
| `@repo/eslint-config`, `@repo/typescript-config` | Tooling |

### API client

`createApiClient({ baseURL })` builds one Axios instance and a tree of resources (`auth`, `admin.user`, `admin.role`, `upload`, `notification`, `experience`, `contentPage`, and so on). The request interceptor attaches the bearer token from `useAuthPersistStore`, the `x-timezone` header, and `x-custom-lang` from `localStorage`. A 401 retries once against `/auth/refresh-token`, then calls `onUnauthorized`.

Web (`apps/web/src/lib/api.ts`) and landing (`apps/landing/src/lib/api.ts`) each call this factory. Web passes `onUnauthorized` so a dead session signs out through NextAuth. Landing only needs public content-page reads.

Mobile keeps its own Axios module (`apps/mobile/api/axios.ts`) and one file per resource (`api/auth.ts`, `api/session.ts`, …). The interceptor contract matches the shared client: bearer token, timezone, one refresh retry, then logout. Screens do not call Axios; they call a resource function from a React Query hook under `hooks/content/`.

### Form builder

Screens do not assemble inputs by hand. A hook returns a `FormStructure`:

```text
FormStructure
  └── fieldsets[]
        └── rows[]
              └── fields[]   { id, variant, label, error, props }
```

`FieldVariant` selects the control (`text`, `select`, `combo_box`, `editor`, `avatar`, `image_gallery`, `custom`, and others). `FormBuilder` walks that tree and renders headers, optional accordion fieldsets, and `FieldBuilder` for each field. The screen owns validation and submit. The structure only describes layout and bindings: `props.value` and `props.onChange` point at a Zustand store (`setNested` from `@instanct/lib`).

Web hooks live next to the feature, for example `useCreateEducationFormStructure`. Mobile uses `@instanct/mobile-form-builder` with the same tree and native controls (map pin, picture upload, date and time). Zod schemas in each app validate the DTO before the resource function runs.

### Data table

Admin lists pass a `DataTableConfig` into `@instanct/datatable-builder`: page, page size, sort, search, column filters, and row callbacks (`create`, `inspect`, `update`, `delete`). Column meta declares how a column filters (`string`, `select`, `date-range`) and how it exports. `useDataTableState(tableId)` persists page, sort, search, and filters in local storage and produces the query string `QueryBuilder` understands.

A backoffice screen follows one shape, visible in `Users` and the `*Portal` components:

1. A page under `apps/web/src/pages` renders a portal or feature component.
2. The component sets breadcrumb and intro through `@instanct/contexts`.
3. `useQuery` calls `api.admin.*` with the table's query string.
4. `DataTable` renders the rows. Sheets and dialogs own create, update, and delete, each backed by a form structure or a confirm action.

### App shell context

`AppProvider` (`@instanct/contexts`) receives `{ appType, api }`. The backoffice sets `appType: "admin"` so shared components know which resource tree to call. `ThemeProvider` is the same context on web and landing (`class` on `<html>`, default `dark`). Mobile reads the theme from `usePreferencePersistStore` in `@instanct/hooks` and applies it with NativeWind.

## Further reading

- [API](apps/api/README.md), [triggers](apps/api/docs/database-triggers.md), [notifications](apps/api/docs/notifications.md)
- [Web backoffice](apps/web/README.md)
- [Mobile app](apps/mobile/README.md)
- [Landing site](apps/landing/README.md)
