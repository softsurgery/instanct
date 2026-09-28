# Instanct web

Backoffice for Instanct (`instanct-ui`). Operators manage users, roles, content pages, configuration, reference data, logs, bug reports, and feedback, and they can open a user profile. It is a Next.js **pages router** app. Shared UI and data access come from `@instanct/*` packages. The abstractions themselves are described in the [root README](../../README.md).

## Run

From the repository root:

```sh
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm dev:web
```

`pnpm dev:web` starts Next on port **3007**. The dev nginx host is `app-dev.instanct.com`.

| Variable | Role |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | API base used in the browser |
| `BASE_URL` | API base used on the server (NextAuth's `authorize`) |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth session |
| `GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_ID`, `GOOGLE_SECRET` | OAuth providers. Credentials sign-in always goes through the API |
| `NEXT_PUBLIC_SENTRY_DSN` | BugSink / Sentry-compatible reporting |

## Shell

`pages/_app.tsx` wraps every page:

```text
SessionProvider
  AuthTokenSync          # copies the NextAuth access token into useAuthPersistStore
  QueryClientProvider
    ThemeProvider        # @instanct/contexts, class strategy, default dark
      AppProvider        # { appType: "admin", api }
        Application
```

`Application` treats `/auth` as public. Any other route redirects to `/auth` until `useSession()` has a session, and an authenticated visit to `/auth` redirects home. Signed-in pages render inside `Layout` (sidebar, header). `AppProviders` holds breadcrumb, page intro, and footer content that feature screens set on mount and clear on unmount.

`src/lib/api.ts` calls `createApiClient` from `@instanct/api-client`. The browser uses `NEXT_PUBLIC_BASE_URL`; the server uses `BASE_URL`. `onUnauthorized` signs out through NextAuth and returns to `/auth`. Feature code imports `api` and calls a resource (`api.admin.user`, `api.auth`, `api.upload`), not Axios.

NextAuth lives at `pages/api/auth/[...nextauth].ts`. The credentials provider calls `api.auth.signIn`. GitHub and Google are NextAuth providers; the API remains the source of the access and refresh tokens stored on the session.

## Routes

Pages are thin. They render a feature component or a `*Portal`.

| Path | Screen |
| --- | --- |
| `/auth` | Sign-in |
| `/dashboard` | Dashboard |
| `/profile` | Current user profile (experience, education, follows) |
| `/notifications` | Notifications |
| `/user-management/users` | User table. `[id]` inspects one user |
| `/user-management/roles` | Roles and permissions |
| `/audit-monitoring/logger` | Request logs |
| `/audit-monitoring/bug-report` | Bug reports |
| `/audit-monitoring/feedback` | Feedback |
| `/content-management/pages` | Content pages (landing legal HTML) |
| `/content-management/configuration` | Configuration namespaces |
| `/content-management/reference-types` | Reference type tree |
| `/content-management/reference-parameters` | Reference parameters |

The sidebar in `components/layout/AppSidebar.tsx` is the same map.

## Screen pattern

A management screen has four pieces. Users (`components/administrative-tools/user-management/users/Users.tsx`) is the reference:

1. **Query.** `useQuery` / `useMutation` from TanStack Query. The query key includes the table state. The query function calls an `@instanct/api-client` resource with `page`, `limit`, `sort`, `search`, `filter`, and `join`. That string is what the API `QueryBuilder` compiles.
2. **Table.** `DataTable` from `@instanct/datatable-builder` receives a `DataTableConfig`: names, pagination setters, sort, search, column filters, and callbacks for create, inspect, update, and delete. Column definitions live in a `columns.tsx` next to the screen and declare filter and export meta.
3. **Form structure.** Create and update sheets call a hook such as `useUpdateUserFormStructure` or `useCreateEducationFormStructure`. The hook returns a `FormStructure` whose fields bind `props.value` / `props.onChange` to a Zustand store. `FormBuilder` renders it. Zod schemas in `src/types/validations` check the DTO before the mutation runs.
4. **Chrome.** `useBreadcrumb` and `useIntro` from `@instanct/contexts` set the header for the lifetime of the screen.

Portals (`DashboardPortal`, `LoggerPortal`, `ContentPagesPortal`, `ConfigurationPortal`, `RefTypePortal`, `RefParamPortal`, `BugReportPortal`, `FeedbackPortal`) are the same pattern behind a single component the page renders.

Profile editors (experience, education, cover) reuse the form-structure hooks and the upload helpers in `hooks/content/useUploads.ts`. Uploads go through `api.upload`, which hits the API `StorageService`.

## Layout of `src/`

```text
src/
├── pages/            # routes only
├── components/
│   ├── layout/       # sidebar, header, page shell
│   ├── auth/
│   ├── administrative-tools/   # users, roles
│   ├── audit-monitoring/       # logger, bugs, feedback
│   ├── content-management/     # pages, configuration, reference data
│   ├── profile/
│   └── dashboard/
├── hooks/
│   ├── content/      # React Query wrappers around api resources
│   └── stores/       # Zustand drafts for forms (user, education, …)
├── lib/api.ts        # createApiClient
└── types/            # DTOs re-exported for screens, Zod schemas
```

Copy and chrome strings go through `next-i18next` (`appWithTranslation` in `_app.tsx`).

## Adding a management screen

1. Add a page under `src/pages` that renders a portal or feature component.
2. Add the route to `AppSidebar`.
3. Define columns and a `DataTableConfig` fed by `useQuery` on the matching `api.admin.*` resource.
4. If the screen edits data, add a `useXFormStructure` hook and a Zustand store. Pass the structure to `FormBuilder`.
5. Validate with a Zod schema, then `useMutation` and invalidate the list query.
