# PWA conversion: MVP scope, tooling, and caching boundary

We're converting the app into a PWA using **Serwist** (the maintained successor to
`next-pwa`/Workbox, with better Next.js App Router + Turbopack support). MVP scope is
**installability and static app-shell precaching only** — no offline data access and no push
notifications, since both would require designing around Apollo's `cache: 'no-store'` GraphQL
fetching and the Auth0 session model, which is a separate piece of work.

Concretely: the service worker precaches static assets (JS/CSS/fonts/manifest/icons) but
explicitly excludes `/api/graphql` from any runtime caching — GraphQL responses stay live-network
only, matching the app's existing `no-store` fetch policy. Updates deploy silently
(`skipWaiting` + `clientsClaim`, no user prompt) since there's no long-lived offline session to
protect yet. A minimal static "you're offline" page is served for failed navigations, since data
still won't load offline but the shell will.

Install UX relies entirely on native browser prompts (Chrome's install banner/address-bar icon,
iOS "Add to Home Screen") — no custom install button. iOS Safari needs explicit
`apple-mobile-web-app-capable` / `apple-touch-icon` meta tags in `app/layout.tsx` in addition to
the manifest, since iOS doesn't fully honor the Web App Manifest spec.

Manifest identity: `name`/`short_name` use the placeholder **"Board Manager"** pending a real
product name; `theme_color: #219591` (matches the existing `appPrimary` token in `theme.ts`);
`display: standalone`. Icons are scaffolded as placeholders (192×192, 512×512, maskable) since no
real app icon/logo exists in `public/` yet — real artwork is a follow-up, not a blocker.

Deployed on **Vercel**, which serves the service worker and static assets without extra
infrastructure.

## Deferred to a later phase

- Offline access/editing of boards and items
- Push notifications (e.g. board shared, item checked)
- Custom install-prompt UI
- Real app icon artwork and final product name
