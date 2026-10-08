# Instanct landing

Marketing site for Instanct (`instanct-landing`). It is a Next.js **app router** application: a single home page of sections, plus terms and privacy pages whose body comes from the API content-page resource. Visual primitives and i18n config come from `@instanct/*`. The shared packages are described in the [root README](../../README.md).

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

Legal pages need a running API and seeded content pages (`pnpm --filter instanct-api seed:content`). If the fetch fails, `findBySlug` returns `null` and `LegalPageShell` renders `LegalUnavailable` with the translated title and subtitle.

## Pages

| Route | What it renders |
| --- | --- |
| `/` | Header, hero, features, how it works, product showcase, safety, FAQ, call to action, footer |
| `/terms` | Content page slug `terms`, for the request locale |
| `/privacy` | Content page slug `privacy`, for the request locale |

`src/lib/site.ts` is the content model for the home page: nav anchors, feature keys, step keys, safety points, FAQ keys, and showcase cards. Components map those keys through `react-i18next`. Copy for English and French lives in `@instanct/i18n` (`landing` namespace). `src/i18n/config.ts` extends that shared config and resolves the language from `localStorage`, then the browser, with `en` as the fallback.

The root layout reads `Accept-Language`, resolves `en` or `fr`, and sets `<html lang>`. A small inline script applies the stored theme (`light`, `dark`, or `system`) before paint so the default dark theme does not flash. `Providers` mounts TanStack Query (five-minute stale time) and the same `ThemeProvider` the backoffice uses.

## How legal HTML is loaded

Terms and privacy are server components. They call `findBySlug(slug, locale)` in `src/lib/content.ts`, which uses `createApiClient` (`src/lib/api.ts`) and `api.contentPage.findBySlug`. There is no auth interceptor work here: these reads are public.

`LegalPageShell` receives the `ContentPage`. `LegalHtmlPage` runs the body through `prepareLegalHtml` from `@instanct/lib` and renders it. The client shows a notice when the page has `hasNotApplied` or `unresolvedKeys`, which is how unpublished template variables stay visible to editors.

```text
app/terms/page.tsx
  -> findBySlug("terms", locale)
       -> GET {API_BASE_URL}/content-pages/slug/terms?locale=
  -> LegalPageShell
       -> LegalHtmlPage (prepareLegalHtml) or LegalUnavailable
```

`LegalPageShell` is a client component. It keeps the server result as `initialData` and refetches when the visitor switches language, so terms and privacy follow the active locale.

The backoffice edits these documents at `/content-management/pages`.

## Layout of `src/`

```text
src/
├── app/
│   ├── layout.tsx       # font, theme script, header, footer
│   ├── page.tsx         # home sections
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   └── global-error.tsx
├── components/          # one file per home section, plus legal shell
├── i18n/                # wraps @instanct/i18n for the landing namespace
└── lib/
    ├── api.ts           # createApiClient
    ├── content.ts       # findBySlug
    └── site.ts          # nav, feature, and FAQ keys
```

Store badges read `site.urls`. The header language switcher writes the locale the i18n detector caches in `localStorage`.
