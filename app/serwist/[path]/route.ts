import { spawnSync } from 'node:child_process';
import { createSerwistRoute } from '@serwist/turbopack';

// A revision helps Serwist version the precached offline fallback page so
// stale cached responses aren't served after a new deploy.
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout ?? crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: '/~offline', revision }],
    swSrc: 'app/sw.ts',
    useNativeEsbuild: true,
    // Service workers only run in browsers modern enough to support them at
    // all, so target a modern JS baseline instead of Next's legacy
    // browserslist target — esbuild can't downlevel-transform some
    // destructuring patterns in `serwist` for those older targets.
    esbuildOptions: {
      target: 'es2020',
    },
  });
