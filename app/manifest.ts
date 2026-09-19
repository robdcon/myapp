import type { MetadataRoute } from 'next';

// Placeholder product name until a final name is chosen (see docs/adr/0001-pwa-conversion-mvp-scope.md).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Board Manager',
    short_name: 'Board Manager',
    description: 'Create shared checklists, notice boards, and event boards.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#219591',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
