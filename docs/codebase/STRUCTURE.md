# Codebase Structure

## Core Sections (Required)

### 1) Top-Level Map

| Path            | Purpose                                                                  | Evidence                                        |
| --------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| `app/`          | Next.js App Router — pages and API route handlers                        | `app/layout.tsx`, `app/page.tsx`                |
| `src/`          | Application source — Feature-Sliced Design (FSD) layers                  | `src/entities/`, `src/features/`                |
| `graphql/`      | Server-side GraphQL schema, resolvers, and context                       | `graphql/schema/index.ts`, `graphql/resolvers/` |
| `database/`     | SQL migrations and seed scripts                                          | `database/migrations/`, `database/seed.sql`     |
| `components/`   | Chakra UI component overrides and wrappers (`components/ui/`)            | `components/ui/`                                |
| `lib/`          | Root-level shared utilities (auth0 client, Apollo wrapper, db re-export) | `lib/auth0.ts`, `lib/apollo-wrapper.tsx`        |
| `hooks/`        | Root-level React hooks (legacy — prefer `src/shared/hooks/`)             | `hooks/`                                        |
| `types/`        | Root-level TypeScript types (legacy — prefer `src/shared/types/`)        | `types/`                                        |
| `scripts/`      | Standalone utility scripts (seed, codegen, etc.)                         | `scripts/seed.ts`                               |
| `public/`       | Static assets served by Next.js                                          | `public/`                                       |
| `theme.ts`      | Chakra UI custom turquoise theme definition                              | `theme.ts`                                      |
| `middleware.ts` | Next.js middleware — delegates all routes to Auth0 session handler       | `middleware.ts`                                 |
| `.github/`      | GitHub Actions workflows and Copilot agent definitions                   | `.github/workflows/`, `.github/agents/`         |
| `.husky/`       | Git hooks (pre-commit lint-staged)                                       | `.husky/`                                       |
| `docs/`         | Project documentation (this folder)                                      | `docs/codebase/`                                |

### 2) FSD Layer Breakdown (inside `src/`)

Feature-Sliced Design enforces a strict import hierarchy: `pages → widgets → features → entities → shared`.

| FSD Layer  | Path            | Contents                                                                                                                                                                            |
| ---------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entities` | `src/entities/` | `board/`, `board-share/`, `item/` — domain data models + queries                                                                                                                    |
| `features` | `src/features/` | `barcode-scanner/`, `boards/`, `bulk-item-actions/`, `calendar-integration/`, `create-item/`, `delete-item/`, `display-list-summary/`, `edit-item/`, `items/`, `toggle-item-check/` |
| `widgets`  | `src/widgets/`  | `board-viewer/` — composed page section combining multiple features                                                                                                                 |
| `pages`    | `src/pages/`    | Thin page components (note: Next.js routing lives in `app/`, not here)                                                                                                              |
| `shared`   | `src/shared/`   | `api/`, `config/`, `hooks/`, `lib/`, `types/`, `ui/` — reusable cross-cutting code                                                                                                  |

Each layer slice follows the internal structure: `api/`, `model/`, `ui/`, `lib/`, `index.ts` (barrel export).

### 3) Entry Points

- **Main runtime entry**: `app/layout.tsx` (root HTML shell with ApolloWrapper + ChakraProvider)
- **Home page**: `app/page.tsx`
- **Board detail page**: `app/boards/[id]/page.tsx`
- **GraphQL API**: `app/api/graphql/route.ts` (GET + POST handlers)
- **Auth routes**: `app/api/auth/[...auth0]/route.ts` (delegated to Auth0 SDK)
- **Google Calendar**: `app/api/calendar/` (OAuth + sync endpoints)
- **Product lookup**: `app/api/product-lookup/route.ts` (barcode → product info)
- **Auth middleware**: `middleware.ts` (runs on all non-static routes)

### 4) Naming and Organization Rules

- **React component files**: PascalCase (e.g., `BoardViewer.tsx`, `CreateItemForm.tsx`)
- **Feature/entity folder names**: kebab-case (e.g., `board-viewer/`, `create-item/`)
- **Utility/hook files**: camelCase (e.g., `db.ts`, `useDebounce.ts`)
- **GraphQL resolver files**: `[domain].resolver.ts` (e.g., `board.resolver.ts`)
- **Migration files**: `[NNN]_[description].sql` (e.g., `001_add_board_sharing.sql`)
- **Import alias**: `@/*` maps to project root (e.g., `@/lib/db` → `./lib/db`)
- **Barrel exports**: Every FSD slice has `index.ts` — always import from the barrel, not internal files

### 5) Evidence

- `app/layout.tsx` — root layout entry point
- `app/api/graphql/route.ts` — GraphQL API entry
- `middleware.ts` — Auth0 middleware config
- `feature-sliced-architecture.md` — FSD architecture documentation
- `tsconfig.json` (`paths`) — `@/*` alias definition
