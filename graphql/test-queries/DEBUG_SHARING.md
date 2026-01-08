# Debug Board Sharing Setup

## Step 0: Enable Test Mode (If Using x-test-user-id Header)
To use the `x-test-user-id` header for testing, you must explicitly enable test mode:
```bash
# Set this environment variable before starting the server
export ENABLE_TEST_MODE=true
```

⚠️ **Security Note:** This feature is disabled by default for security. Never enable in production!

## Step 1: Check Users Table
```sql
SELECT id, email, auth0_id, name 
FROM users 
ORDER BY created_at DESC;
```

## Step 2: Check Board Shares Table
```sql
SELECT bs.id, bs.board_id, bs.shared_with_user_id, bs.permission_level,
       b.name as board_name,
       u.email as shared_with_email
FROM board_shares bs
LEFT JOIN boards b ON b.id = bs.board_id
LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id;
```

## Step 3: Check User Boards (Ownership)
```sql
SELECT ub.user_id, ub.board_id, ub.role,
       u.email as user_email,
       b.name as board_name
FROM user_boards ub
LEFT JOIN users u ON u.id = ub.user_id
LEFT JOIN boards b ON b.id = ub.board_id;
```

## Step 4: Share Board Correctly
**IMPORTANT:** The `shared_with_user_id` in `board_shares` must be the **auth0_id**, not the database ID!

```sql
-- Example: Share board 1 with jane@example.com
INSERT INTO board_shares (board_id, shared_with_user_id, permission_level)
SELECT 1, u.auth0_id, 'EDIT'
FROM users u
WHERE u.email = 'jane@example.com'
ON CONFLICT (board_id, shared_with_user_id) 
DO UPDATE SET permission_level = 'EDIT';
```

## Step 5: Verify the Share
```sql
SELECT bs.*, u.email, u.auth0_id
FROM board_shares bs
LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
WHERE bs.board_id = 1;
```

## Step 6: Test in GraphQL (as the shared user)
Make sure you're logged in as the user who was granted access (jane@example.com), then run:

```graphql
query GetSharedBoards {
  sharedBoards {
    id
    name
    myPermission
  }
}
```

## Common Issues:

1. **Wrong ID Type**: Did you use the database `users.id` instead of `users.auth0_id`?
   - ❌ Wrong: `shared_with_user_id = '1'` (database ID)
   - ✅ Correct: `shared_with_user_id = 'auth0|123456789'` (Auth0 ID)

2. **Not Logged In**: Make sure you're actually logged in as the shared user
   - Check in your app by clicking your profile/avatar
   - Or use the test mode header (requires `ENABLE_TEST_MODE=true`): `{"x-test-user-id": "auth0|123456789"}`

3. **Auth0 ID Mismatch**: The auth0_id in the database doesn't match the logged-in user
   - Run: `SELECT auth0_id FROM users WHERE email = 'jane@example.com'`
   - Compare with: `context.user.sub` from your session
