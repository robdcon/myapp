/**
 * Example utility function to test commit hooks
 * This file demonstrates how pre-commit hooks work
 */

export const greet = (name: string): string => {
  // Using console.warn (allowed by ESLint rules)
  console.warn('Greeting:', name);

  return `Hello, ${name}!`;
};

// Intentionally unused variable (prefixed with underscore to satisfy ESLint)
const _unusedVar = 'test';

// Function with TypeScript error (commented out for now)
// export const badFunction = (x): string => {
//   return x;  // TypeScript error: Parameter 'x' implicitly has an 'any' type
// };

/**
 * Simple self-test for the greet function.
 * This can be used by commit hooks or manual runs to verify behavior.
 */
const selfTestGreet = (): void => {
  const input = 'World';
  const expected = 'Hello, World!';
  const actual = greet(input);

  if (actual !== expected) {
    throw new Error(`greet self-test failed: expected "${expected}", got "${actual}"`);
  }
};

// Allow running this file directly (e.g., via ts-node or tsx) to execute the self-test.
if (require.main === module) {
  console.log('Running greet self-test from test-hooks.ts...');
  selfTestGreet();
  console.log('✅ greet self-test passed.');
}
