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
