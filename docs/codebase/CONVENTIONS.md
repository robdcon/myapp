# Coding Conventions

## Core Sections (Required)

### 1) Naming Rules

| Item                   | Rule                      | Example                                            | Evidence                                                |
| ---------------------- | ------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| React component files  | PascalCase                | `BoardViewer.tsx`, `CreateItemForm.tsx`            | `src/features/create-item/ui/CreateItemForm.tsx`        |
| Feature/entity folders | kebab-case                | `board-viewer/`, `create-item/`                    | `src/features/` directory listing                       |
| Utility/hook files     | camelCase                 | `db.ts`, `useDebounce.ts`                          | `src/shared/lib/db/db.ts`                               |
| GraphQL resolver files | `[domain].resolver.ts`    | `board.resolver.ts`, `item.resolver.ts`            | `graphql/resolvers/`                                    |
| TypeScript interfaces  | PascalCase                | `GraphQLContext`, `BoardShare`                     | `graphql/context.ts`, `src/shared/types/common.ts`      |
| TypeScript enums       | PascalCase                | `UserRole`, `BoardType`, `PermissionLevel`         | `src/shared/types/common.ts`, `graphql/schema/index.ts` |
| Constants / env vars   | UPPER_SNAKE_CASE          | `ENABLE_TEST_MODE`, `HIGHLIGHT_ANIMATION_DURATION` | `.env.example`, copilot-instructions.md                 |
| DB migration files     | `[NNN]_[description].sql` | `001_add_board_sharing.sql`                        | `database/migrations/`                                  |
| Functions/methods      | camelCase                 | `checkBoardEditPermission`, `queryOne`             | `graphql/resolvers/permissions.ts`                      |

### 2) Formatting and Linting

- **Formatter**: Prettier 3.7 — config at `.prettierrc`
  - `semi: true` (semicolons required)
  - `singleQuote: true` (single quotes)
  - `tabWidth: 2` (2-space indentation)
  - `trailingComma: "es5"` (trailing commas where valid in ES5)
  - `printWidth: 90` (line wrap at 90 chars)
  - `arrowParens: "always"` (always wrap arrow function params)
- **Linter**: ESLint 9 — config at `.eslintrc.json`
  - Extends `next/core-web-vitals`
  - `@typescript-eslint/no-unused-vars`: warn (ignores `_`-prefixed names)
  - `@typescript-eslint/no-explicit-any`: warn
  - `no-console`: warn (allows `console.warn` and `console.error` only)
- **Auto-run**: Prettier runs on `*.ts`, `*.tsx`, `*.json`, `*.md` via lint-staged on every commit
- **Run commands**:
  ```bash
  npx eslint .          # Lint
  npx prettier --check . # Check formatting
  npx prettier --write . # Fix formatting
  ```

### 3) Import and Module Conventions

- **Path alias**: `@/*` maps to the project root. Always use `@/` for absolute imports — never use relative paths like `../../lib/db`.
  - Example: `import { pool } from '@/lib/db'`
  - Example: `import { BoardViewer } from '@/src/widgets/board-viewer'`
- **Barrel exports**: Every FSD slice has an `index.ts`. Always import from the barrel, never from internal slice files.
  - ✅ `import { CreateItemForm } from '@/src/features/create-item'`
  - ❌ `import { CreateItemForm } from '@/src/features/create-item/ui/CreateItemForm'`
- **Apollo Client hooks**: Import from `@apollo/client/react` (not `@apollo/client` directly)
  - `import { useQuery, useMutation } from '@apollo/client/react'`

### 4) Error and Logging Conventions

- **GraphQL resolvers**: Throw `new Error('message')` for auth/permission failures. Apollo Server catches and serializes these to GraphQL errors.
- **Database layer** (`db.ts`): Catches query errors, logs to `console.error`, then re-throws — preserving stack context.
- **Logging**: `console.log` is disallowed (ESLint warn). Use `console.warn` for recoverable issues and `console.error` for errors. Many `console.log` calls in resolvers are currently commented out.
- **Test mode logging**: Test mode activation is logged via `console.log` (intentional exception in `graphql/context.ts`).
- **Sensitive data**: DB passwords must be wrapped as strings: `String(process.env.PGPASSWORD)` to prevent type errors.

### 5) Testing Conventions

- **No automated test framework** is currently configured (no Jest, Vitest, Playwright, etc. in `package.json`).
- Manual testing via:
  - GraphQL Playground at `http://localhost:3000/api/graphql`
  - Test queries in `graphql/test-queries/*.graphql`
  - Dev-mode header bypass: `x-test-user-id: google-oauth2|...` (requires `ENABLE_TEST_MODE=true`)
- Debug scripts at project root: `test-graphql.bat`, `test-hooks.ts`, `test-github-actions.ts`

### 6) Chakra UI v3 Component Conventions

- Import **primitive components** from `@chakra-ui/react`: `Button`, `Card`, `Field`, `Table`, `Alert`, `Avatar`, `VStack`, `HStack`, `Box`
- Import **composed components** from `@/components/ui/`: `Dialog`, `Tooltip`, `Select` (compound), `ConfirmDialog`, `CloseButton`, `Checkbox`, `Drawer`, `Radio`, `Menu`
- Use `toaster.create()` for toasts — never `useToast()`
- Use `VStack`/`HStack` — never the generic `Stack` component
- Boolean props: `open` (not `isOpen`), `disabled` (not `isDisabled`)
- Colors: `colorPalette="appPrimary"` or `colorPalette="appSecondary"` — never hardcode hex values
- Use `Button` instead of `IconButton` (v3 type issues)

### 7) Git Commit Conventions

- **Format**: Conventional Commits enforced by commitlint
  - `feat:`, `fix:`, `chore:`, `refactor:`, `docs:` prefixes required
  - Example: `feat: add barcode scanner for shopping list items`
- Config: `commitlint.config.js`

### 8) Evidence

- `.prettierrc` — formatter config
- `.eslintrc.json` — linter config
- `commitlint.config.js` — commit message rules
- `src/shared/lib/db/db.ts` — error handling pattern
- `graphql/resolvers/board.resolver.ts` — resolver conventions
- `graphql/context.ts` — logging conventions
