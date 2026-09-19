/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkOnly, Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Authenticated content — HTML page navigations, RSC payloads, and the
// GraphQL API — is deliberately excluded from ALL runtime caching (see
// docs/adr/0001-pwa-conversion-mvp-scope.md). `defaultCache` otherwise
// NetworkFirst-caches same-origin documents/RSC/API responses, which would
// risk serving one user's cached authenticated page (e.g. a board) to a
// different user, or a stale post-logout page, when falling back to cache.
// The app's Apollo client already requests with `cache: 'no-store'`, so
// nothing here should ever be served from the cache — only the static app
// shell (JS/CSS/fonts/images) is precached/cached by `defaultCache`.
const runtimeCaching = [
  {
    matcher: ({ request }: { request: Request }) => request.destination === 'document',
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ request }: { request: Request }) => request.headers.get('RSC') === '1',
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith('/api/'),
    handler: new NetworkOnly(),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
