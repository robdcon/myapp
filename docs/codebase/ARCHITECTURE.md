# Architecture

## Core Sections (Required)

### 1) Architectural Style

- **Primary style**: Feature-Sliced Design (FSD) for the frontend layer, over a GraphQL + Direct-DB backend
- **Why this classification**: Source code is explicitly divided into FSD layers (`entities`, `features`, `widgets`, `pages`, `shared`) with enforced one-directional import rules. The backend is a thin GraphQL-over-SQL architecture with no service/repository abstraction layer.
- **Primary constraints**:
  1. FSD import rule — lower layers must never import from higher layers (e.g., `shared` cannot import from `features`)
  2. All data access goes through GraphQL resolvers on the server — React components never call the database directly
  3. Auth0 middleware intercepts every HTTP request before it reaches app code

### 2) System Flow

```text
Browser Request
  → middleware.ts (Auth0 session check on all routes)
  → app/ (Next.js App Router)
      ├── Page routes → FSD widgets/features/entities render UI
      │     └── Apollo Client → POST /api/graphql (GraphQL queries/mutations)
      │                              → ApolloServer (app/api/graphql/route.ts)
      │                                    → graphql/context.ts (build context: user session)
      │                                    → graphql/resolvers/*.resolver.ts
      │                                          → src/shared/lib/db/db.ts (pg Pool queries)
      │                                                → PostgreSQL database
      └── API routes (auth, calendar, product-lookup)
            → External APIs (Auth0, Google Calendar, product lookup service)
```

### 3) Layer/Module Responsibilities

| Layer or module                    | Owns                                                           | Must not own                     | Evidence                                 |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| `middleware.ts`                    | Auth0 session validation for all routes                        | Business logic                   | `middleware.ts`                          |
| `app/api/graphql/route.ts`         | Apollo Server instantiation and routing                        | Resolver logic                   | `app/api/graphql/route.ts`               |
| `graphql/context.ts`               | Build GraphQL context (user session, test mode)                | Data queries                     | `graphql/context.ts`                     |
| `graphql/resolvers/`               | Resolve GraphQL operations, auth guards, permission checks     | SQL query construction (ideally) | `graphql/resolvers/board.resolver.ts`    |
| `graphql/resolvers/permissions.ts` | Board permission checks (edit/view)                            | Other domain logic               | `graphql/resolvers/permissions.ts`       |
| `src/entities/`                    | Domain types, GraphQL queries for a single entity              | UI rendering, mutations          | `src/entities/board/model/`              |
| `src/features/`                    | User-facing actions (create, edit, delete items/boards)        | Cross-feature business rules     | `src/features/create-item/`              |
| `src/widgets/`                     | Composed page sections assembling multiple features            | Page routing                     | `src/widgets/board-viewer/`              |
| `src/shared/`                      | Reusable UI, hooks, types, and utilities                       | Domain-specific logic            | `src/shared/lib/db/`, `src/shared/ui/`   |
| `src/shared/lib/db/db.ts`          | PostgreSQL connection pool, query helpers, transaction support | Schema ownership                 | `src/shared/lib/db/db.ts`                |
| `lib/` (root)                      | Auth0 client singleton, Apollo Client wrapper factory          | Page logic                       | `lib/auth0.ts`, `lib/apollo-wrapper.tsx` |

### 4) Reused Patterns

| Pattern                      | Where found                                      | Why it exists                                                                           |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Barrel exports (`index.ts`)  | Every FSD slice                                  | Enforces module boundaries — consumers import from the slice, not internals             |
| Permission guard in resolver | `graphql/resolvers/permissions.ts`               | Boards can be owned or shared; two-path permission check needed                         |
| Context injection            | `graphql/context.ts` → all resolvers             | Pass Auth0 session user into every resolver without repeated `auth0.getSession()` calls |
| pg Pool singleton            | `src/shared/lib/db/db.ts`                        | Avoid connection exhaustion — one pool shared across all server requests                |
| Fixed-position modal         | `src/features/create-item/ui/CreateItemForm.tsx` | Prevents modal scrolling away with page content                                         |
| `toaster.create()`           | Feature UI files                                 | Chakra UI v3 toast API — replaces deprecated `useToast()`                               |
| `ConfirmDialog` component    | Feature UI files                                 | Replaces `window.confirm()` for accessible, theme-consistent confirmations              |

### 5) Known Architectural Risks

- **No repository/service layer in resolvers**: Resolvers write raw SQL directly. As the schema grows, this leads to duplicated SQL and makes testing harder.
- **`dbUser` always `null` in context**: `graphql/context.ts` declares `dbUser` but never populates it. Resolvers that need the DB user re-fetch it themselves (e.g., `board.resolver.ts` re-queries by email), causing repeated DB lookups per request.
- **FSD boundary at root level**: `lib/`, `hooks/`, and `types/` at project root duplicate what should live in `src/shared/`. This weakens the FSD boundary.
- **No error boundaries**: React error boundaries are not evident in the widget/page layer — unhandled resolver errors will surface as uncaught exceptions.

### 6) Evidence

- `app/api/graphql/route.ts` — Apollo Server entry
- `graphql/context.ts` — context construction
- `graphql/resolvers/board.resolver.ts` — representative resolver with DB access
- `graphql/resolvers/permissions.ts` — permission pattern
- `src/shared/lib/db/db.ts` — pool singleton and query helpers
- `middleware.ts` — Auth0 middleware
- `feature-sliced-architecture.md` — FSD documentation
