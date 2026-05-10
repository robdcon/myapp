# Testing Patterns

## Core Sections (Required)

### 1) Test Stack and Commands

- **Primary test framework**: ❌ None configured — no Jest, Vitest, Playwright, or Cypress in `package.json`
- **Assertion/mocking tools**: None
- **Commands**: No `npm test` script defined

```bash
# No automated test commands available.
# Manual testing approaches:
npm run dev                   # Start dev server, then test manually
# Open GraphQL Playground at: http://localhost:3000/api/graphql
```

### 2) Test Layout

- No test files exist in the codebase (no `*.test.ts`, `*.spec.ts`, `__tests__/` directories found)
- Manual test artifacts at project root:
  - `test-graphql.bat` — batch script for manual GraphQL endpoint testing
  - `test-hooks.ts` — manual hook testing script (run with `tsx test-hooks.ts`)
  - `test-github-actions.ts` — manual GitHub Actions testing script
- GraphQL test queries: `graphql/test-queries/*.graphql` — used in the Apollo Playground

### 3) Test Scope Matrix

| Scope          | Covered?         | Typical target    | Notes                                               |
| -------------- | ---------------- | ----------------- | --------------------------------------------------- |
| Unit           | ❌ No            | —                 | No test framework configured                        |
| Integration    | ❌ No            | —                 | Manual only via GraphQL Playground                  |
| E2E            | ❌ No            | —                 | Manual only via browser                             |
| GraphQL Schema | Partial (manual) | Queries/mutations | Via Apollo Playground + `.graphql` test query files |

### 4) Mocking and Isolation Strategy

- **Dev test mode**: Set `ENABLE_TEST_MODE=true` in `.env`, then pass header `x-test-user-id: <auth0_id>` to bypass Auth0 session — enables testing authenticated GraphQL operations without a real login flow.
- **No mocking framework**: Database and external API calls are not mocked.
- **Isolation**: None — manual testing hits the real development database.

### 5) Coverage and Quality Signals

- **Coverage tool**: None
- **Current coverage**: 0% automated coverage
- **Known gaps**: The entire application has no automated test coverage. This is the most significant quality risk in the codebase.
- **CI quality gate**: GitHub Actions only runs Copilot code review on PRs — no test runner, no coverage threshold.

### 6) Evidence

- `package.json` — no test script, no test framework in dependencies
- `test-graphql.bat` — manual test script
- `graphql/test-queries/` — manual GraphQL test query files
- `graphql/context.ts` — test mode bypass implementation
- `.github/workflows/auto-copilot-review.yml` — CI workflow (no test step)
