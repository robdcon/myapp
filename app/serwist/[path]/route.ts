import { spawnSync } from 'node:child_process';
import { createSerwistRoute } from '@serwist/turbopack';

// A revision helps Serwist version the precached offline fallback page so
// stale cached responses aren't served after a new deploy. Fall back to a
// random UUID whenever git isn't available or the lookup fails, rather than
// trusting `spawnSync`'s result blindly — `.stdout` can be an empty string
// (not `null`/`undefined`) on failure, which would otherwise slip past a
// bare `??` fallback and produce an empty revision.
function resolveRevision(): string {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' });
  const stdout = result.stdout?.trim();

  if (result.error || result.status !== 0 || !stdout) {
    return crypto.randomUUID();
  }

  return stdout;
}

const revision = resolveRevision();

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
