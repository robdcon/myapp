/**
 * Commitlint Configuration
 *
 * This enforces the Conventional Commits specification for commit messages.
 * Format: <type>(<scope>): <subject>
 *
 * Valid types:
 * - feat: A new feature
 * - fix: A bug fix
 * - docs: Documentation only changes
 * - style: Changes that don't affect code meaning (formatting, etc)
 * - refactor: Code change that neither fixes a bug nor adds a feature
 * - perf: Performance improvement
 * - test: Adding or updating tests
 * - build: Changes to build system or dependencies
 * - ci: Changes to CI configuration
 * - chore: Other changes that don't modify src or test files
 *
 * Examples:
 * ✅ feat: add board sharing feature
 * ✅ fix(auth): resolve login redirect issue
 * ✅ docs: update README with setup instructions
 * ❌ Added new feature (missing type prefix)
 * ❌ feat add board sharing (missing colon)
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce lowercase type
    'type-case': [2, 'always', 'lower-case'],
    // Require type to be one of the valid types
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Header max length (type + scope + subject)
    'header-max-length': [2, 'always', 100],
  },
};
