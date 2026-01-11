---
description: Full-Stack Board Manager App - Architecture & Development Guide
globs: '**/*'
alwaysApply: false
---

# Architecture Overview

## Tech Stack

- **Next.js 15.5.9** (App Router) + **React 19** + **TypeScript**
- **GraphQL API** (Apollo Server + Client) at `/api/graphql`
- **PostgreSQL** database with direct `pg` connections
- **Auth0** for authentication (session-based)
- **Chakra UI v3** for components + custom turquoise theme

## Feature-Sliced Design (FSD) Structure

Project follows FSD architecture in `src/`:

- `entities/` - Business entities (board, item, board-share)
- `features/` - User actions (create-item, edit-item, boards, board-sharing)
- `widgets/` - Complex page sections (board-viewer)
- `pages/` - Route pages (home, board)
- `shared/` - Reusable utilities (ui, lib, types, hooks)

**Import Pattern:** Always use FSD barrel exports via `index.ts` files.

## Database Architecture

### Key Tables

- `users` (id: SERIAL, auth0_id: TEXT) - Auth0 integration
- `boards` (id: SERIAL, board_type: TEXT, is_public: BOOLEAN, share_token: TEXT)
- `user_boards` (user_id: INTEGER → users.id, board_id: INTEGER, role: user_role ENUM)
- `board_shares` (board_id: INTEGER, shared_with_user_id: TEXT → auth0_id, permission_level: TEXT)
- `items` (id: SERIAL, board_id: INTEGER, name: TEXT, details: TEXT, category: TEXT, is_checked: BOOLEAN)

**Critical:** `user_boards.user_id` is INTEGER (references users.id), but `board_shares.shared_with_user_id` is TEXT (stores auth0_id directly).

### Running Migrations

```bash
tsx database/migrations/run-migration.ts
```

Requires `dotenv` loaded BEFORE `pool` import (see run-migration.ts).

## GraphQL Layer

### File Structure

- `graphql/schema/index.ts` - Type definitions
- `graphql/resolvers/*.resolver.ts` - Resolvers by domain
- `graphql/resolvers/index.ts` - Merged resolvers
- `graphql/context.ts` - Request context with Auth0 session

### Permission Checking Pattern

```typescript
// Always pass (boardId, userId) - NOT (userId, boardId)!
const hasPermission = await checkBoardEditPermission(boardId, userId);
```

### Test Mode (Development Only)

Set `ENABLE_TEST_MODE=true` in `.env`, then use header:

```
x-test-user-id: google-oauth2|YOUR_AUTH0_ID
```

## Chakra UI v3 Rules

### Component Imports

- **From @chakra-ui/react:** Button, Card, Field, Table, Alert, Avatar
- **From components/ui:** Dialog, Tooltip, Select, ConfirmDialog, CloseButton

### API Changes from v2

- `isOpen → open`, `isDisabled → disabled`
- `colorScheme → colorPalette`
- `useToast() → toaster.create()`
- Modal → Dialog (different props)
- Button icons are children, not props
- **Always use VStack/HStack**, never Stack

### Theme System

Use semantic colors defined in `theme.ts`:

- `colorPalette="appPrimary"` (dark cyan `#219591`)
- `colorPalette="appSecondary"` (tropical teal `#27b2b5`)
- Never hardcode hex colors - use theme tokens or CSS variables

### Select Component Pattern

```tsx
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';

const items = createListCollection({
  items: [{ label: 'Option 1', value: 'opt1' }],
});

<SelectRoot collection={items} value={value} onValueChange={(e) => setValue(e.value)}>
  <SelectTrigger>
    <SelectValueText />
  </SelectTrigger>
  <SelectContent>
    {items.items.map((item) => (
      <SelectItem key={item.value} item={item}>
        {item.label}
      </SelectItem>
    ))}
  </SelectContent>
</SelectRoot>;
```

## Development Workflows

### Essential Commands

```bash
npm run dev              # Start dev server (port 3000)
npm run build           # Production build with Turbopack
npm run seed            # Seed database
npm run codegen         # Generate GraphQL types
tsx <script>.ts         # Run TypeScript scripts directly
```

### GraphQL Development

- Playground: `http://localhost:3000/api/graphql`
- Test queries in `graphql/test-queries/*.graphql`
- Apollo Client uses `cache-only` for reactive updates after mutations

### Database Connection

Direct PostgreSQL via `pg` pool (not Prisma/ORM):

```typescript
import { pool } from '@/lib/db';
await pool.query('SELECT ...', [param1, param2]);
```

## Common Patterns

### Form Modals

Forms are **floating modals** (fixed position) to prevent scroll-away issues:

```tsx
<Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={1000}>
  <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
    {/* Form content */}
  </Box>
</Box>
```

### Confirmation Dialogs

Use `ConfirmDialog` component instead of `window.confirm()`:

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
<ConfirmDialog
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleAction}
  title="Confirm Action"
  message="Are you sure?"
  confirmColorPalette="red"
/>;
```

### Apollo Client Hooks

```tsx
import { useQuery, useMutation } from '@apollo/client/react'; // Note /react path
const { data, loading } = useQuery<TypedData>(QUERY, { variables: { id } });
const [mutate] = useMutation(MUTATION, {
  refetchQueries: [{ query: RELATED_QUERY }], // For cache updates
});
```

## Security Notes

- **Next.js 15.5.9** includes CVE fixes for React2Shell vulnerabilities
- Auth0 session via `@auth0/nextjs-auth0` (no JWT handling needed)
- Test mode requires explicit `ENABLE_TEST_MODE=true` environment variable
- Database passwords must be strings: `String(process.env.PGPASSWORD)`

## Gotchas & Known Issues

1. **Parameter Order:** `checkBoardEditPermission(boardId, userId)` - boardId first!
2. **IconButton:** Use `Button` component instead (IconButton has type issues in v3)
3. **Escape Handlers:** Must check `if (!isOpen) return;` before adding listeners
4. **SQL UNION:** Avoid mixing enum types - use boolean checks instead
5. **Magic Numbers:** Extract to constants (e.g., `HIGHLIGHT_ANIMATION_DURATION`)

## Testing & Debugging

- **GraphQL errors:** Check parameter order and auth0_id vs user.id confusion
- **Build errors:** Run `npm run build` to catch TypeScript issues
- **DB issues:** Verify `dotenv.config()` is called before pool imports
- **Permission denied:** Check both `user_boards` and `board_shares` with correct field types
