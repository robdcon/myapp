# Debug Permission Check

Run this in GraphQL Playground to see what's happening:

```graphql
query DebugBoardPermissions($boardId: ID!) {
  board(id: $boardId) {
    id
    board_type
    myPermission {
      canEdit
      canShare
      role
    }
  }
}
```

Variables:

```json
{
  "boardId": "YOUR_BOARD_ID"
}
```

Also check the database directly:

```sql
-- Check user_boards
SELECT ub.*, u.auth0_id, u.email
FROM user_boards ub
JOIN users u ON ub.user_id = u.id
WHERE ub.board_id = YOUR_BOARD_ID;

-- Check board_shares
SELECT bs.*, u.email as shared_with_email
FROM board_shares bs
LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
WHERE bs.board_id = YOUR_BOARD_ID;

-- Check if user exists
SELECT * FROM users WHERE auth0_id = 'YOUR_AUTH0_ID';
```

## Quick Fix to Test

Add console logging to debug:

In `graphql/resolvers/item.resolver.ts`, add this after the permission check:

```typescript
const hasPermission = await checkBoardEditPermission(boardId, userId);
console.log('Permission check:', { boardId, userId, hasPermission });
if (!hasPermission) {
  throw new GraphQLError('You do not have permission to add items to this board', {
    extensions: { code: 'FORBIDDEN' },
  });
}
```
