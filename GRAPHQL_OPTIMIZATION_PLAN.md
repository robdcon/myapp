# GraphQL Architecture & Performance Optimization Plan

## Overview & Educational Purpose
This document provides a comprehensive analysis and step-by-step implementation guide for optimizing the GraphQL layer in this application (`graphql/`). 

Designed for both automated agents and human developers, this plan breaks down technical issues into clear phases. For each phase, it explains:
- **The Issue**: What is wrong and how it impacts performance or architecture.
- **Technical Decisions**: The exact engineering fix and why it was chosen.
- **Benefits & Learnings**: Simple, easy-to-understand explanations of concepts to apply in future projects.

---

## Phase 1: N+1 Query Prevention using DataLoader

### 1. The Issue
When requesting a list of boards (e.g. `myBoards`), GraphQL resolves each board's nested fields individually. For a query like:
```graphql
query {
  myBoards {
    id
    name
    items { id name }
    shares { id permission_level }
    isShared
    myPermission
  }
}
```
If `myBoards` returns **10 boards**, GraphQL executes:
- 1 query to fetch the 10 boards
- 10 queries for `items` (1 per board)
- 10 queries for `shares` (1 per board)
- 10 queries for `isShared` (1 per board)
- 20 queries for `myPermission` (2 checks per board)

This totals **51 database roundtrips** for a single HTTP request! This is known as the **N+1 Query Problem**.

### 2. Technical Decisions
- Introduce `DataLoader` (`graphql/dataloaders/index.ts`), a utility from GraphQL's core team that batches and caches database requests within a single tick of the event loop.
- Instead of executing `SELECT * FROM items WHERE board_id = $1` ten times, DataLoader collects all 10 `board_id`s and executes **1 single query**: `SELECT * FROM items WHERE board_id IN ($1, $2, ..., $10)`.
- Attach DataLoader instances to `GraphQLContext` so they are strictly scoped per-request (preventing stale cross-request caching).

### 3. Benefits & Key Learnings (In Simple Terms)
- 💡 **Key Learning (The N+1 Problem)**: In REST APIs, an endpoint fetches all related data in 1 database join. In GraphQL, nested field resolvers execute independently for each array item, causing exponential database load. `DataLoader` coalesces these separate calls into a single `IN (...)` batch query.
- 🚀 **Benefits**: Reduces database queries from **50+ to 4-5 per request**, dramatically cutting response latency and database CPU usage.

---

## Phase 2: Context User Optimization & Query Elimination

### 1. The Issue
In `graphql/context.ts`, `createContext` queries the `users` table on every incoming request (`SELECT * FROM users WHERE auth0_id = $1`) to populate `context.dbUser`.

However, resolvers inside `board.resolver.ts` and `item.resolver.ts` ignore `context.dbUser` and re-query the database again using helper functions like `getUserIdByAuth0Id(context.user.sub)` or `getUserIdByEmail(context.user.email)`.

### 2. Technical Decisions
- Update all resolver handlers to read `context.dbUser.id` directly rather than triggering redundant database queries.
- Ensure `createContext` gracefully handles unauthenticated requests without unnecessary queries.

### 3. Benefits & Key Learnings (In Simple Terms)
- 💡 **Key Learning (Context Reuse)**: The GraphQL `context` object is created once per request before resolvers run. Fetching common data (like the current user record) once in context and passing it to all resolvers prevents duplicate lookups.
- 🚀 **Benefits**: Eliminates 1-3 redundant database queries per mutation or query, reducing API response times by 10-30ms per request.

---

## Phase 3: Architectural Layering & FSD Repository Compliance

### 1. The Issue
This project uses **Feature-Sliced Design (FSD)** architecture. 
- `board.resolver.ts` correctly delegates data operations to `src/entities/board/api/boardRepository.ts`.
- However, `board-share.resolver.ts` and `calendar.resolver.ts` contain raw SQL strings (`pool.query("SELECT ...")`) directly embedded inside GraphQL resolver functions.

This breaks separation of concerns: if database column names change, developers have to edit GraphQL resolvers instead of entity repositories.

### 2. Technical Decisions
- Create dedicated entity repositories:
  - `src/entities/board-share/api/boardShareRepository.ts`
  - `src/entities/calendar/api/calendarRepository.ts`
- Move all raw SQL queries from resolvers into these repositories.
- Resolvers will only validate inputs, check permissions, and invoke repository methods.

### 3. Benefits & Key Learnings (In Simple Terms)
- 💡 **Key Learning (Separation of Concerns)**: GraphQL resolvers are an API delivery transport (like REST controllers). They should never contain raw database queries or complex SQL logic. Repositories handle data access; resolvers handle request routing and permissions.
- 🚀 **Benefits**: Cleaner code, easier unit testing of database queries without mocking GraphQL context, and strict compliance with the project's FSD structure.

---

## Phase 4: Schema Refactoring, Input Types & Type Safety

### 1. The Issue
1. **Type Mismatch Bug**: In `graphql/schema/index.ts`, `User.boards` is typed as `[Board!]!`. In `user.resolver.ts`, `User.boards` returns `board_id` numbers (`[Int!]`). Querying `user { boards { id } }` fails with a runtime GraphQL schema type error.
2. **Verbose Arguments**: Mutations accept many positional primitive arguments (e.g. `createItem(boardId, name, details, category)`).
3. **Manual Resolver Typing**: Resolvers use `any` or loose inline TypeScript interfaces rather than strict generated types from `@graphql-codegen`.

### 2. Technical Decisions
- Fix `User.boards` resolver to fetch and return full `Board` objects using the `boardRepository` / `DataLoader`.
- Define GraphQL `input` types (`CreateBoardInput`, `UpdateBoardInput`, `CreateItemInput`, etc.) in `graphql/schema/index.ts`.
- Run `npm run codegen` to regenerate strict TypeScript types for all resolvers and Apollo client queries.

### 3. Benefits & Key Learnings (In Simple Terms)
- 💡 **Key Learning (GraphQL Input Objects)**: Using Input Objects (`input CreateItemInput { ... }`) makes mutations extensible. Adding new optional fields later won't break existing client function signatures.
- 💡 **Key Learning (End-to-End Type Safety)**: Schema-first GraphQL works best when `@graphql-codegen` generates TypeScript types directly from `.graphql` or `typeDefs`. This eliminates `any` types and catches runtime schema mismatches during `npm run build`.
- 🚀 **Benefits**: Guarantees type safety across backend and frontend, fixes hidden runtime GraphQL execution bugs, and makes API maintenance seamless.

---

## Phase 5: Security Guardrails & Error Standardization

### 1. The Issue
1. **Query Depth Vulnerability**: Apollo Server currently accepts GraphQL queries of arbitrary depth. Malicious clients can submit deeply nested recursive queries (e.g., `board { items { board { items { board { ... } } } } }`), causing CPU exhaustion or crashing the server (Denial of Service).
2. **Inconsistent Error Formats**: Some resolvers throw structured `GraphQLError` with extension codes (`UNAUTHENTICATED`, `FORBIDDEN`), while others throw generic `new Error("Forbidden")`. This makes error handling unpredictable for frontend UI toasts and alerts.
3. **Leftover Debug Logs**: `console.log` statements are left in production resolvers.

### 2. Technical Decisions
- Add `graphql-depth-limit` plugin to Apollo Server in `app/api/graphql/route.ts` to cap max query depth (e.g., maximum depth of 6).
- Standardize all thrown errors to `GraphQLError` with standardized codes:
  - `UNAUTHENTICATED` (401)
  - `FORBIDDEN` (403)
  - `NOT_FOUND` (404)
  - `BAD_REQUEST` (400)
- Remove leftover `console.log` statements.

---

## Action Plan & Execution Checklist for Agents

- [x] **Phase 0**: Create `GRAPHQL_OPTIMIZATION_PLAN.md` in root with technical decisions & educational learnings for handoff.
- [ ] **Phase 1**: Implement DataLoader in `graphql/dataloaders/` & attach to `GraphQLContext`.
- [ ] **Phase 2**: Use `context.dbUser` in `board.resolver.ts`, `item.resolver.ts`, and `board-share.resolver.ts`.
- [ ] **Phase 3**: Extract raw SQL into `src/entities/board-share/api/` and `src/entities/calendar/api/`.
- [ ] **Phase 4**: Fix `User.boards` type mismatch, introduce Input types, run `npm run codegen`.
- [ ] **Phase 5**: Add `graphql-depth-limit` to `route.ts` and convert all errors to `GraphQLError`.
