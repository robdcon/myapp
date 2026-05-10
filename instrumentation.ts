/**
 * Next.js instrumentation hook — called once when a new server instance boots.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Use this file for startup-time safety checks that must run before the app
 * serves any traffic.
 */
export async function register() {
  if (process.env.ENABLE_TEST_MODE === 'true' && process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL: ENABLE_TEST_MODE must not be set in production. Remove it from your environment.'
    );
  }
}
