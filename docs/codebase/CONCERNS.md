# Codebase Concerns

## Core Sections (Required)

### 1) Top Risks (Prioritized)

| Severity | Concern                                                   | Evidence                                                                                                                                                                           | Impact                                                                               | Suggested action                                                       |
| -------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| High     | **No automated tests**                                    | `package.json` — no test framework                                                                                                                                                 | Any refactor or feature can silently break existing functionality with no safety net | Add Vitest + React Testing Library as a baseline                       |
| High     | **`dbUser` always `null` in GraphQL context**             | `graphql/context.ts` line "dbUser: null"                                                                                                                                           | Resolvers that need the DB user re-query on every request (N+1 per-user lookup)      | Populate `dbUser` in `createContext()` from the session `user.sub`     |
| Medium   | **Raw SQL in resolvers — no abstraction layer**           | `graphql/resolvers/board.resolver.ts`, `item.resolver.ts`                                                                                                                          | Duplicate SQL, no reuse, hard to test, hard to maintain as schema grows              | Extract data access into repository functions in `src/entities/*/api/` |
| Medium   | **`user_boards` vs `board_shares` ID type inconsistency** | `graphql/resolvers/permissions.ts`                                                                                                                                                 | Developer confusion, easy to pass wrong ID type; runtime bugs if types are mixed     | Document clearly (done), consider normalising to one ID type           |
| Medium   | **No error boundaries in React**                          | Absence in `app/` and `src/widgets/`                                                                                                                                               | Uncaught GraphQL or render errors will crash full page with no recovery UI           | Add error boundary components at page and widget level                 |
| Low      | **`console.log` in resolver**                             | `graphql/resolvers/board.resolver.ts` line "console.log('Fetching board with id:'...)"                                                                                             | Log noise in production                                                              | Remove or replace with structured logger                               |
| Low      | **Requirement/debug docs at project root**                | `BOARD_SHARING_TESTING.md`, `DEBUG_PERMISSION_CHECK.md`, `GOOGLE_CALENDAR_REQUIREMENTS.md`, `GOOGLE_CALENDAR_IMPLEMENTATION.md`, `refactor.md`, `requirements.md`, `llms-full.txt` | Clutters the repo root; these should live in `docs/` or be deleted                   | Move to `docs/` or delete resolved items                               |

### 2) Technical Debt

| Debt item                                                | Why it exists                                                                                  | Where                             | Risk if ignored                                                        | Suggested fix                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Root-level `lib/`, `hooks/`, `types/` directories        | Created before FSD was fully adopted; shortcuts during early development                       | `lib/`, `hooks/`, `types/` (root) | Weakens FSD module boundaries; imports bypass the `src/shared/` layer  | Migrate to `src/shared/lib/`, `src/shared/hooks/`, `src/shared/types/` |
| `any` types in GraphQL resolvers                         | Resolver arguments typed as `any` (e.g., `_: any`, `context: GraphQLContext` uses `user: any`) | `graphql/resolvers/*.resolver.ts` | Type safety gaps — runtime errors invisible to the compiler            | Generate resolver types from schema using `graphql-codegen`            |
| `dbUser` never populated in context                      | Placeholder for future implementation                                                          | `graphql/context.ts`              | Each resolver independently re-fetches user from DB; redundant queries | Eagerly fetch DB user from Auth0 session in `createContext()`          |
| `pages/` FSD layer exists but App Router handles routing | FSD convention includes a `pages` layer; Next.js routing lives in `app/`                       | `src/pages/`                      | Confusion about where page-level components live                       | Clarify in docs or consolidate into `app/`                             |

### 3) Security Concerns

| Risk                                     | OWASP category                  | Evidence                                                      | Current mitigation                                                          | Gap                                                                               |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Auth bypass in test mode                 | A07 — Auth Failures             | `graphql/context.ts` — `ENABLE_TEST_MODE=true` bypasses Auth0 | Requires explicit env var (`ENABLE_TEST_MODE=true`); not enabled by default | Ensure `ENABLE_TEST_MODE` is never `true` in production; add runtime assertion    |
| No input validation on GraphQL mutations | A03 — Injection                 | Resolver args passed directly to SQL as parameterized queries | Parameterized queries prevent SQL injection                                 | No application-level validation (length limits, format checks) on input fields    |
| Raw error messages in resolver throws    | A05 — Security Misconfiguration | `throw new Error('Not authenticated')` in resolvers           | Apollo Server strips stack traces in production                             | Verify Apollo is in production mode (no introspection) in prod deployment         |
| `PGPASSWORD` in environment              | A02 — Crypto Failures           | `.env`                                                        | Env vars, not committed to git                                              | No secrets rotation in place; no secrets manager                                  |
| No rate limiting                         | A04 — Insecure Design           | No rate limiting middleware found                             | None                                                                        | GraphQL endpoint could be abused; add rate limiting at Vercel or middleware level |

### 4) Performance and Scaling Concerns

| Concern                           | Evidence                                                                           | Current symptom                                       | Scaling risk                           | Suggested improvement                                        |
| --------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| N+1 user lookup in board resolver | `graphql/resolvers/board.resolver.ts` — fetches user by email, then queries boards | Extra DB roundtrip on every board list fetch          | Adds latency per user under load       | Pre-populate `dbUser` in GraphQL context                     |
| No DB connection pool limits set  | `src/shared/lib/db/db.ts` — Pool created without `max`                             | Unconstrained connections under high load             | Connection exhaustion on the DB server | Set `max: 10` (or appropriate value) in pool config          |
| Apollo Client cache strategy      | Apollo Client set to `cache-only` for reactive updates                             | Manual `refetchQueries` required after every mutation | Stale UI if refetch is missed          | Audit refetch coverage; consider `cache-and-network` default |
| Barcode scanner runs in browser   | `@ericblade/quagga2` — camera + image processing in JS                             | High CPU on mobile/low-end devices during scan        | n/a (client-side only)                 | Consider Web Worker offload for heavy scan processing        |

### 5) Fragile/High-Churn Areas

| Area                                  | Why fragile                                                              | Churn signal                                  | Safe change strategy                                                       |
| ------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------- |
| `src/features/barcode-scanner/`       | Newly added (last 5 commits); large surface area (286-line component)    | 6 new files in latest commit, 1729 insertions | Review for edge cases; add manual test script                              |
| `graphql/resolvers/board.resolver.ts` | Core data resolver; handles items, calendar fields, timestamp conversion | Frequent changes as features are added        | Extract item fetching to `src/entities/item/api/`; write integration tests |
| `graphql/resolvers/permissions.ts`    | Critical security logic; dual ID type gotcha                             | Referenced in all mutation resolvers          | Do not modify without careful review; add inline assertions                |
| `app/api/calendar/`                   | Google Calendar OAuth flow — complex state machine                       | Migration 003 recently added calendar schema  | Document the OAuth flow; add error recovery paths                          |

### 6) `[ASK USER]` Questions

1. **[ASK USER]** Where are Google Calendar OAuth tokens stored per user? In the database, in Auth0 metadata, or elsewhere?
2. **[ASK USER]** What product lookup API is used for the barcode scanner? Is there an API key that needs to be added to `.env.example`?
3. **[ASK USER]** Is `ENABLE_TEST_MODE` ever set to `true` in any non-local environment (staging, preview deployments)?
4. **[ASK USER]** Is there a plan to add automated testing? If so, what framework is preferred (Vitest, Jest, Playwright)?
5. **[ASK USER]** Should the `lib/`, `hooks/`, and `types/` root-level directories be migrated into `src/shared/` as part of a cleanup effort?
6. **[ASK USER]** Are the requirement/debug markdown files at project root (`GOOGLE_CALENDAR_REQUIREMENTS.md`, `refactor.md`, etc.) still active or can they be archived?

### 7) Evidence

- `package.json` — absence of test framework
- `graphql/context.ts` — `dbUser: null` and test mode bypass
- `graphql/resolvers/board.resolver.ts` — N+1 pattern, `console.log`
- `graphql/resolvers/permissions.ts` — dual ID type handling
- `src/shared/lib/db/db.ts` — pool without `max` setting
- Git log (last 5 commits) — barcode scanner as highest recent churn
