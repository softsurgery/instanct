# Instanct landing

Marketing site for Instanct (`instanct-landing`). It is a Next.js **app router** application: a home page, plus terms, privacy, and support pages whose body comes from the API content-page resource. Visual primitives and i18n config come from `@instanct/*`. The shared packages are described in the [root README](../../README.md).

## Run

From the repository root:

```sh
pnpm install
cp apps/landing/.env.example apps/landing/.env
pnpm dev:landing
```

The dev script listens on port **3008**. The dev nginx host is `landing-dev.instanct.com`.

| Variable | Role |
| --- | --- |
| `NEXT_PUBLIC_APP_STORE_URL` | App Store badge target |
| `NEXT_PUBLIC_PLAY_STORE_URL` | Play Store badge target |
| `NEXT_PUBLIC_WEB_URL` | Link to the web app. `site.urls.web` falls back to `http://localhost:3000` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Footer contact. Falls back to `hello@instanct.com` |
| `NEXT_PUBLIC_API_BASE_URL` | Public API base |
| `API_BASE_URL` | Server-side API base, preferred by `src/lib/api.ts` when both are set |

Terms and privacy need a running API and seeded content pages (`pnpm --filter instanct-api seed:content`). If that fetch fails, `LegalPageShell` renders `LegalUnavailable` with the translated title and subtitle. Support uses the same fetch and falls back to local copy when the API has no page.

## Pages

| Route | What it renders |
| --- | --- |
| `/` | Header, hero, FAQ, call to action, footer |
| `/terms` | Content page slug `terms`, for the request locale |
| `/privacy` | Content page slug `privacy`, for the request locale |
| `/support` | Content page slug `support`, with a local fallback when the API has no row |

`src/lib/site.ts` holds store and contact URLs plus the FAQ keys the home page renders. Copy for English and French lives in `@instanct/i18n` (`landing` namespace). `src/i18n/config.ts` extends that shared config and resolves the language from `localStorage`, then the browser, with `en` as the fallback.

The root layout reads `Accept-Language`, resolves `en` or `fr`, and sets `<html lang>`. A small inline script applies the stored theme (`light`, `dark`, or `system`) before paint so the default light theme does not flash. `Providers` mounts TanStack Query (five-minute stale time) and the same `ThemeProvider` the backoffice uses (`defaultTheme="light"`).

## How content HTML is loaded

Terms, privacy, and support are server components. Each page calls `api.contentPage.findBySlug` from `src/lib/api.ts` (`createApiClient`). There is no auth interceptor work here: these reads are public. Support falls back to `fallbackSupportPages` in `src/lib/support-content.ts` when the fetch returns nothing.

`LegalPageShell` receives the `ContentPage`. `LegalHtmlPage` runs the body through `prepareLegalHtml` from `@instanct/lib` and renders it. The client shows a notice when the page has `hasNotApplied` or `unresolvedKeys`, which is how unpublished template variables stay visible to editors.

```text
app/terms/page.tsx
  -> api.contentPage.findBySlug("terms", locale)
       -> GET {API_BASE_URL}/content-pages/slug/terms?locale=
  -> LegalPageShell
       -> LegalHtmlPage (prepareLegalHtml) or LegalUnavailable
```

`LegalPageShell` is a client component. It keeps the server result as `initialData` and refetches when the visitor switches language, so terms, privacy, and support follow the active locale.

The backoffice edits these documents at `/content-management/pages`.

## Layout of `src/`

```text
src/
├── app/
│   ├── layout.tsx       # font, theme script, header, footer
│   ├── page.tsx         # hero, FAQ, call to action
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── support/page.tsx
│   └── global-error.tsx
├── components/          # home sections and the legal shell
├── i18n/                # wraps @instanct/i18n for the landing namespace
└── lib/
    ├── api.ts           # createApiClient
    ├── support-content.ts
    └── site.ts          # nav, feature, and FAQ keys
```

Store badges read `site.urls`. The header language switcher writes the locale the i18n detector caches in `localStorage`.
