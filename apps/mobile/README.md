# Instanct mobile

Expo Router client for Instanct (`instanct-mobile-app`). People discover nearby professionals, manage a profile, chat, schedule sessions, and send meeting requests. UI primitives come from `@softsurgery/mobile-ui` and `@softsurgery/mobile-components`. Forms use `@softsurgery/mobile-form-builder`. Auth and theme persistence use `@softsurgery/hooks`. The shared abstractions are described in the [root README](../../README.md).

HTTP goes through `api-client`. `lib/api.ts` builds that client with the mobile Axios settings (base URL, delay, `/client-auth/refresh-token`, and the device auth store) and `ApiProvider` injects it. Screens read it with `useApi()`.

## Run

From the repository root:

```sh
pnpm install
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

`pnpm dev:mobile` starts the Expo dev client. `pnpm --filter instanct-mobile-app android` and `ios` run a native build. iOS needs Xcode. Android needs a device or emulator and the maps setup in [docs/ANDROID_MAPS_FIX.md](docs/ANDROID_MAPS_FIX.md).

| Variable                                                         | Role                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`                                       | REST base URL, including the `/api` prefix                       |
| `EXPO_PUBLIC_API_SOCKET_URL`                                     | Origin for Socket.IO (`/chat`, `/notifications`, `/geolocation`) |
| `EXPO_PUBLIC_GLOBAL_DELAY`                                       | Artificial delay on HTTP and socket emits, `0` in normal use     |
| `GOOGLE_MAPS_API_KEY`                                            | Native maps                                                      |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_LINKEDIN_CLIENT_ID` | SSO                                                              |
| `EXPO_PUBLIC_OAUTH_REDIRECT_URI`                                 | Deep link the provider returns to (`app/oauth.tsx`)              |

## Navigation

Routes are files under `app/`. `app/_layout.tsx` is the root: gesture handler, safe area, keyboard controller, TanStack Query with an AsyncStorage persister, splash screen, and the NativeWind theme from `usePreferencePersistStore`.

| Group                        | Role                                                  |
| ---------------------------- | ----------------------------------------------------- |
| `app/index.tsx`              | Entry redirect                                        |
| `app/auth/`                  | Sign-in, sign-up, legal                               |
| `app/oauth.tsx`              | SSO return                                            |
| `app/main/(tabs)/`           | Home, map, activities, menu                           |
| `app/main/chat/`             | Conversation, details, report                         |
| `app/main/sessions/`         | List, details, manage                                 |
| `app/main/request/`          | New request, answer                                   |
| `app/main/explore/`          | Session starter, user filters                         |
| `app/main/profile/`          | Profile, education, experience, industries, devices   |
| `app/main/settings/`         | Language, theme, about, FAQs, support, privacy, terms |
| `app/main/notifications.tsx` | Notification inbox                                    |

Tabs are declared in `app/main/(tabs)/_layout.tsx`. Stack screens push on top of that layout.

## Data flow

```text
Screen
  -> hooks/content/<domain>/useX.ts     # useQuery / useMutation / useInfiniteQuery
       -> useApi()                       # api-client resources
            -> lib/api.ts                # bearer, x-timezone, one refresh, logout
                 -> API QueryBuilder / CRUD services
```

`lib/api.ts` reads the access token from the app's `useAuthPersistStore` (`hooks/useAuthPersistStore.ts`), a Zustand store persisted on the device. On 401 it retries `/client-auth/refresh-token` once, then `performLogout`. `FormData` uploads drop the JSON content type so multipart boundaries stay intact. DTOs are imported from `api-client`. List functions take the same `page`, `limit`, `sort`, `search`, `filter`, and `join` fields the API `QueryBuilder` understands. Infinite lists (sessions, bookmarks, incoming and outgoing requests) use that pagination with `useInfiniteQuery`.

Hooks under `hooks/content/` are the only place screens should fetch. Group them by domain: `users`, `sessions`, `chat`, `notification`, `reference-types`, `configurations`. Reference data hooks (`useIndustries`, `useObjectives`) read the `RefType` / `RefParam` tree. Configuration hooks read namespaces the map and the client need.

Chat does not poll. `lib/socket.ts` keeps one Socket.IO connection per namespace (`chat`, `notifications`, `geolocation`) against `EXPO_PUBLIC_API_SOCKET_URL`, with the access token. A token change disconnects and opens a new socket. Hooks such as `useConversationMessages`, `useUserPresence`, and `useNotifications` subscribe to those sockets and write through the React Query cache.

## Forms

Create and edit screens use `@softsurgery/mobile-form-builder`. A hook such as `useSigninFormStructure` or `useSessionStarterFormStructure` returns a `FormStructure`: fieldsets, rows, and fields. `FormBuilder` renders native controls (text, select, date, time, picture, map pin). The field `props` write into a local store. Zod schemas in `types/validations/` check the payload before the resource function runs. Translation keys for those errors live in the namespace named at the top of each schema file.

## Layout of the app

```text
app/                 # Expo Router screens
components/          # auth, chat, map, profile, request, session, settings
contexts/            # API client, loader, and other screen-level providers
hooks/
  content/           # React Query hooks by domain
  useAuthPersistStore.ts
i18n/locales/        # en, and further locales
lib/                 # socket, query client, theme, logout
stores/              # feature Zustand stores
types/               # Zod schemas and UI-only types
```

Internationalization is i18next. `app/_layout.tsx` imports `../i18n`. Add a locale under `i18n/locales` and a settings entry; the language screen writes the preference the detector reads.

## Related docs

- [Chat module](docs/CHAT_MODULE.md)
- [Android maps](docs/ANDROID_MAPS_FIX.md)
- [API](../api/README.md)
