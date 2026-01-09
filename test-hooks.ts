/**
 * Example utility function to test commit hooks
 * This file demonstrates how pre-commit hooks catch issues
 */

export const greet = (name: string): string => {
  // This console.log will trigger an ESLint warning
  console.log('Greeting:', name);

  return `Hello, ${name}!`;
};

// Unused variable - should trigger ESLint warning
const unusedVar = 'test';

// Function with TypeScript error (commented out for now)
// export const badFunction = (x): string => {
//   return x;  // TypeScript error: Parameter 'x' implicitly has an 'any' type
// };
