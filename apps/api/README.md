# Instanct API

NestJS backend for the web backoffice, the landing site, and the mobile app. Package name: `instanct-api`. It exposes a versioned HTTP API under the `api` prefix and three Socket.IO namespaces.

The shared abstractions (repository, CRUD service, query builder, user inheritance, storage, workflows, triggers, notifications) live in `packages/nsa-*` and are described in the [root README](../../README.md). This file is how the API app wires those packages.

## Run

From the repository root:

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm dev:api
```

The process reads `.env`, or `.env.${NODE_ENV}` when `NODE_ENV` is set. Defaults in `src/config/app.config.ts`:

| Variable                                                        | Role                                                                                                            |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `APP_PORT`                                                      | Listen port. Example file uses `5000`. The dev nginx upstream expects `5005`.                                   |
| `API_PREFIX`                                                    | Global prefix, default `api`                                                                                    |
| `HTTP_ENABLE`                                                   | Must be `true` or `RouterModule` mounts no controllers                                                          |
| `DATABASE_*`                                                    | MySQL connection. `DATABASE_SYNCHRONIZE=false` turns on SQL migrations after listen                             |
| `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION` | Access and refresh tokens                                                                                       |
| `STORAGE_DRIVER`                                                | `local` or `s3`. S3 also needs `S3_*` (bucket, region, endpoint, keys). Local uploads use `UPLOAD_PATH`         |
| `SMTP_*`                                                        | Mail transport. If SMTP cannot be resolved, the mailer falls back to `jsonTransport` so the process still boots |
| `SENTRY_DSN`                                                    | BugSink / Sentry-compatible error reporting                                                                     |

Swagger is registered only when `NODE_ENV=development`, at `/docs`, with bearer auth.

Seed reference data, roles, the admin user, templates, industries, and objectives:

```sh
pnpm --filter instanct-api seed:all
```

Individual commands (`seed:permissions`, `seed:roles`, `seed:configuration`, `seed:content`, …) are in `package.json`.

## Bootstrap

`src/main.ts` creates `AppModule` and then:

1. Enables CORS and serves `public/`.
2. Installs `ValidationPipe` (`whitelist`, `transform`) and `ClassSerializerInterceptor`.
3. Sets the global prefix from `app.globalPrefix`.
4. Mounts Swagger in development.
5. Listens, then runs `MigrationService` when schema synchronize is off.

`AppModule` loads config, TypeORM, the CLS transactional plugin, JWT, the scheduler, the mailer, throttling (100 requests / 60s), Sentry, `DatabaseModule`, `SeedersModule`, `StorageModule`, and `RouterModule.forRoot()`.

`AuthGuard` is an `APP_GUARD` provided by `AuthModule`, so it is global. `@Public()` on a handler opts out.

## Layout

```text
src/
├── app/            # AppModule, app-level enums (notification types, config namespaces)
├── config/         # app, database, s3, swagger
├── modules/        # product domains that stay in this app
│   ├── users/      # UserEntity, profile, education, experience, bookmarks, blocks
│   ├── requests/   # request CRUD + XState workflow
│   ├── geolocation/
│   └── system-reports/   # bugs, feedback, device info
├── routers/
│   └── routes/     # which controllers sit on which prefix
└── seeders/
```

`modules/` is product behavior. Persistence, auth, chat, sessions, storage, notifications, content, templates, configuration, reference data, mail, logging, and workflows come from `packages/nsa-*` (`@softsurgery/nsa-*`). A new CRUD resource is a repository extending `DatabaseAbstractRepository`, a service extending `AbstractCrudService`, a controller, and a registration on the right route module.

## HTTP surface

`RouterModule` registers five Nest router entries when `HTTP_ENABLE=true`. Controllers are declared on the route module, and their feature module is imported beside them, so the route file is the map of the public surface.

| Route module           | Prefix      | Controllers                                                                                                                                                                                                            |
| ---------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RoutesModule`         | `/`         | Auth, current user, follows, education, experience, bookmarks, blocks, storage, configuration, chat, sessions, requests and request workflow, notifications, reference types, content pages, templates, bugs, feedback |
| `RoutesAdminModule`    | `/admin`    | Users, roles, permissions, logger                                                                                                                                                                                      |
| `RoutesPublicModule`   | `/public`   | Open reads (module is reserved for unauthenticated controllers)                                                                                                                                                        |
| `RoutesCallbackModule` | `/callback` | External callbacks                                                                                                                                                                                                     |
| `RoutesTestModule`     | `/test`     | Test controllers                                                                                                                                                                                                       |

Authenticated product calls are under `/api/...`. Admin calls are under `/api/admin/...`.

## Auth

Two services share the user hierarchy:

- `AuthService` signs the backoffice in (email or username plus password, plus GitHub, Google, and Apple). The web app's NextAuth credentials and OAuth providers call `api.auth.signIn` and store the access and refresh tokens.
- `ClientAuthService` signs the mobile app in, including Google, LinkedIn, and Apple OAuth. Device rows are `UserDeviceEntity` (identified by MAC address), and login sessions are recorded in `UserConnectionHistoryEntity`.

Both issue a JWT signed with `app.jwt.secret`. `AuthGuard` verifies it and sets `request.user`. Password hashing lives in `AbstractUserService.save`, so every account path goes through the same hash.

## Realtime

Gateways authenticate with the same access token (`getTokenPayloadForWebSocket`):

| Namespace         | Class                  | Responsibility                                                  |
| ----------------- | ---------------------- | --------------------------------------------------------------- |
| `/chat`           | `ChatGateway`          | Send and load messages, conversation membership, unread counts  |
| `/notifications`  | `NotificationGateway`  | Push a saved `NotificationEntity` to the user's socket room     |
| `/geolocation`    | `GeolocationGateway`   | Presence on the map, using the maps configuration namespace     |
| `/presence`       | `UserPresenceGateway`  | Real-time user presence tracking and device active status       |
| `/admin/presence` | `AdminPresenceGateway` | Administrative monitoring of online users and connected clients |

Chat counters that must stay correct under concurrent writes are MySQL triggers (`ConversationLastMessageTrigger`, `ConversationParticipantsTrigger`), not application-side increments. Registration and SQL shape are documented in [docs/database-triggers.md](docs/database-triggers.md).

## Domain notes

**Users.** `UserEntity` is a `@ChildEntity` of `AbstractUserEntity` from `@softsurgery/nsa-um`. Profile relations (picture, cover, experiences, education, follows, bookmarks, geolocation) live on the child. Role assignment uses `RoleEntity` and `PermissionEntity` from the same package.

**Requests.** `RequestService` is a normal CRUD service. `RequestWorkflowService` extends `AbstractWorkflowService` with `requestMachine`. `next(id, event)` loads the row, asks the machine for the next status, and saves it. Illegal events become `400`.

**Reference data.** `RefTypeEntity` / `RefParamEntity` (`@softsurgery/nsa-reference-types`) are the catalogs (industries, objectives). **Configuration** namespaces (`@softsurgery/nsa-configurations`) hold runtime key/value params, including map behavior and application metadata. **Content pages** (`@softsurgery/nsa-content`) are HTML documents keyed by slug and locale (`terms`, `privacy`, `about`, `faqs`, `support`). **Templates** (`@softsurgery/nsa-templates`) are seeded email and document layouts.

**Storage.** Inject `StorageService` from `@softsurgery/nsa-storage`. `storageProvider` chooses `LocalStorageService` or `S3StorageService` from `STORAGE_DRIVER` (`local` or `s3`). Temporary uploads are deleted on a two-hour cron defined on the base class.

**Reports.** Bugs, feedback, and device info are `system-reports`. They use the same repository base as the rest of the API.

## Adding a resource

1. Entity extending `EntityHelper` (or `@ChildEntity` of `AbstractUserEntity` if it is another account kind).
2. Repository extending `DatabaseAbstractRepository<Entity>`.
3. Service extending `AbstractCrudService<Entity>`. Add `@Transactional()` on methods that write more than one row.
4. DTOs. Response DTOs extend `ResponseDtoHelper` so audit fields serialize with the rest of the API.
5. Controller. List queries type their query as `IQueryObject` and pass it to `findAllPaginated`.
6. Register the controller on `RoutesModule` or `RoutesAdminModule` and import the feature module there.
7. If the action should alert a user, add `@Notify` / `@BatchNotify` and `@UseInterceptors(NotificationInterceptor)`. See [docs/notifications.md](docs/notifications.md).

## Further reading

- [Root architecture](../../README.md)
- [Runtime bindings & lazy resolution](docs/runtime-bindings.md)
- [Database triggers](docs/database-triggers.md)
- [Notifications](docs/notifications.md)
