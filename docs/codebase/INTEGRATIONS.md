# External Integrations

## Core Sections (Required)

### 1) Integration Inventory

| System              | Type            | Purpose                                                            | Auth model                                      | Criticality | Evidence                                                                                    |
| ------------------- | --------------- | ------------------------------------------------------------------ | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Auth0               | Auth SaaS       | User authentication, session management, user registration webhook | OAuth2/OIDC session via `@auth0/nextjs-auth0`   | High        | `middleware.ts`, `graphql/context.ts`, `.env.example`                                       |
| PostgreSQL          | Database        | Primary data store (boards, items, users, shares)                  | Connection string (host/user/pass) via env vars | High        | `src/shared/lib/db/db.ts`, `.env.example`                                                   |
| Google Calendar API | REST API        | Sync board items with Google Calendar events                       | OAuth2 (user-delegated, stored per-board)       | Medium      | `graphql/resolvers/calendar.resolver.ts`, `database/migrations/003_add_google_calendar.sql` |
| Product Lookup API  | HTTP API        | Resolve barcode → product name/category                            | [ASK USER — API key, provider unknown]          | Low         | `app/api/product-lookup/route.ts`, `src/features/barcode-scanner/api/product-lookup.ts`     |
| Vercel              | Deployment PaaS | Production hosting, deploy via webhook                             | Webhook token in deploy URL                     | High        | `package.json` `deploy-develop` script                                                      |
| GitHub Actions      | CI/CD           | Auto-request Copilot code review on PRs                            | `GITHUB_TOKEN` (built-in)                       | Low         | `.github/workflows/auto-copilot-review.yml`                                                 |
| Renovate            | Dependency bot  | Automated dependency update PRs                                    | GitHub App                                      | Low         | `renovate.json`                                                                             |

### 2) Data Stores

| Store            | Role                                                               | Access layer                                | Key risk                                                                            | Evidence                             |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| PostgreSQL       | Primary database — all boards, items, users, shares, calendar data | `src/shared/lib/db/db.ts` (pg Pool)         | No ORM means no migration validation — raw SQL only                                 | `src/shared/lib/db/db.ts`            |
| Auth0 User Store | Identity provider — login, registration, tokens                    | `@auth0/nextjs-auth0` SDK (session cookies) | `users` table mirrors Auth0 users via webhook; divergence possible if webhook fails | `graphql/resolvers/user.resolver.ts` |

### 3) Database Schema Summary

| Table          | Key columns                                                                                                 | Notes                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `users`        | `id SERIAL`, `auth0_id TEXT`, `email TEXT`                                                                  | `id` is internal integer; `auth0_id` is the Auth0 `sub` claim               |
| `boards`       | `id SERIAL`, `board_type TEXT`, `is_public BOOLEAN`, `share_token TEXT`                                     | `board_type`: `NOTICE_BOARD`, `CHECKLIST`, `EVENTS`                         |
| `user_boards`  | `user_id INTEGER → users.id`, `board_id INTEGER`, `role user_role ENUM`                                     | Ownership table — `user_id` is INTEGER (NOT auth0_id)                       |
| `board_shares` | `board_id INTEGER`, `shared_with_user_id TEXT → auth0_id`, `permission_level TEXT`                          | Sharing table — `shared_with_user_id` is TEXT (auth0_id, NOT integer)       |
| `items`        | `id SERIAL`, `board_id INTEGER`, `name TEXT`, `is_checked BOOLEAN`, `category TEXT`, `deleted_at TIMESTAMP` | Soft-deletes via `deleted_at`; calendar event fields added in migration 003 |

> ⚠️ **Critical gotcha**: `user_boards.user_id` is INTEGER but `board_shares.shared_with_user_id` is TEXT. Permission checks must handle both — see `graphql/resolvers/permissions.ts`.

### 4) Secrets and Credentials Handling

- All credentials stored in `.env` (local dev) or Vercel environment variables (production)
- `.env` is in `.gitignore` — never committed
- `.env.example` documents all required variables with placeholder values
- DB password must be cast to string: `String(process.env.PGPASSWORD)` due to TypeScript strictness
- Auth0 session secret (`AUTH0_SECRET`) is a long random hex string
- Google Calendar OAuth tokens: [ASK USER — where are per-user tokens stored? DB or Auth0?]
- No secrets manager in use — relies on environment variables only

### 5) Reliability and Failure Behavior

- **Retry/backoff**: None implemented. Failed GraphQL mutations surface as Apollo errors in the UI.
- **Timeout policy**: Not explicitly configured — relies on pg pool defaults and Next.js request timeouts.
- **Circuit breaker**: None.
- **Soft deletes**: Items use `deleted_at` column — no hard deletes, allows recovery.
- **Database transactions**: `transaction()` helper available in `db.ts` but usage is not widespread.

### 6) Observability for Integrations

- **Logging around DB calls**: Query errors are logged to `console.error` in `db.ts`. Query success/duration is commented out.
- **Logging around Auth0**: Test mode activation is logged to `console.log`.
- **No APM/tracing**: No Datadog, Sentry, OpenTelemetry, or equivalent in production.
- **Missing visibility**: Google Calendar sync failures, product lookup API errors, and Auth0 webhook failures have no alerting.

### 7) Evidence

- `src/shared/lib/db/db.ts` — pg pool config and query helpers
- `graphql/context.ts` — Auth0 session extraction
- `middleware.ts` — Auth0 middleware
- `graphql/resolvers/permissions.ts` — dual-path permission check (user_boards + board_shares)
- `graphql/resolvers/calendar.resolver.ts` — Google Calendar integration
- `app/api/product-lookup/route.ts` — product lookup API proxy
- `.env.example` — all required credentials
- `database/migrations/003_add_google_calendar.sql` — calendar data schema
