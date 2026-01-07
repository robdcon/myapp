# Testing Board Sharing Permissions

## Setup Instructions

### 1. Get User Auth0 IDs
Run this SQL to get the auth0_id for both users:
```sql
SELECT id, email, auth0_id FROM users;
```

### 2. Share a Board
As the board owner, share the board with another user:
```graphql
mutation ShareBoard {
  shareBoard(
    boardId: "1"
    email: "jane@example.com"
    permission: EDIT
  ) {
    id
    shared_with_user_email
    permission_level
  }
}
```

---

## Test as Shared User with EDIT Permission

### HTTP HEADERS (Set this in Apollo Playground)
```json
{
  "x-test-user-id": "auth0|shared-user-id-here"
}
```

### Test 1: View Shared Boards
```graphql
query GetSharedBoards {
  sharedBoards {
    id
    name
    my_permission
  }
}
```
**Expected:** Should see the shared board with `my_permission: "EDIT"`

---

### Test 2: View Board Items
```graphql
query GetBoardItems {
  items(boardId: "1") {
    id
    name
    category
    is_checked
  }
}
```
**Expected:** Should see all items on the board

---

### Test 3: Create an Item ✅ SHOULD WORK
```graphql
mutation CreateItemAsSharedUser {
  createItem(
    boardId: "1"
    name: "Item created by shared user"
    category: "Test"
  ) {
    id
    name
    category
    created_at
  }
}
```
**Expected:** Success! Item should be created

---

### Test 4: Toggle Item Check ✅ SHOULD WORK
```graphql
mutation ToggleItemAsSharedUser {
  toggleItemCheck(itemId: "ITEM_ID_HERE") {
    id
    is_checked
  }
}
```
**Expected:** Success! Item check status should toggle

---

### Test 5: Update an Item ✅ SHOULD WORK
```graphql
mutation UpdateItemAsSharedUser {
  updateItem(
    itemId: "ITEM_ID_HERE"
    name: "Updated by shared user"
  ) {
    id
    name
    updated_at
  }
}
```
**Expected:** Success! Item should be updated

---

### Test 6: Delete an Item ✅ SHOULD WORK
```graphql
mutation DeleteItemAsSharedUser {
  deleteItem(itemId: "ITEM_ID_HERE")
}
```
**Expected:** Success! Item should be soft-deleted

---

### Test 7: Share the Board ❌ SHOULD FAIL (needs ADMIN)
```graphql
mutation ShareBoardAsSharedUser {
  shareBoard(
    boardId: "1"
    email: "another@example.com"
    permission: VIEW
  ) {
    id
  }
}
```
**Expected:** Error - "You do not have permission to share this board"

---

## Test as Shared User with VIEW Permission

### 1. Change Permission to VIEW
As the board owner, update the share permission:
```graphql
mutation ChangeToViewPermission {
  updateBoardShare(
    shareId: "SHARE_ID_HERE"
    permission: VIEW
  ) {
    id
    permission_level
  }
}
```

### 2. Test Creating Item ❌ SHOULD FAIL
```graphql
mutation CreateItemAsViewUser {
  createItem(
    boardId: "1"
    name: "Should fail"
    category: "Test"
  ) {
    id
    name
  }
}
```
**Expected:** Error - "You do not have permission to add items to this board"

---

## Test as Shared User with ADMIN Permission

### 1. Change Permission to ADMIN
```graphql
mutation ChangeToAdminPermission {
  updateBoardShare(
    shareId: "SHARE_ID_HERE"
    permission: ADMIN
  ) {
    id
    permission_level
  }
}
```

### 2. Test Sharing the Board ✅ SHOULD WORK
```graphql
mutation ShareBoardAsAdmin {
  shareBoard(
    boardId: "1"
    email: "another@example.com"
    permission: VIEW
  ) {
    id
    shared_with_user_email
    permission_level
  }
}
```
**Expected:** Success! Admin can share the board

---

## Verify Database State

### Check Board Shares
```sql
SELECT bs.*, u.email, u.auth0_id, b.name as board_name
FROM board_shares bs
LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
LEFT JOIN boards b ON b.id = bs.board_id;
```

### Check Items Created by Shared User
```sql
SELECT i.name, i.category, u.email as created_by_email
FROM items i
LEFT JOIN users u ON u.id = i.created_by
WHERE i.board_id = 1;
```

---

## Permission Matrix

| Action | VIEW | EDIT | ADMIN | OWNER |
|--------|------|------|-------|-------|
| View board | ✅ | ✅ | ✅ | ✅ |
| View items | ✅ | ✅ | ✅ | ✅ |
| Create items | ❌ | ✅ | ✅ | ✅ |
| Update items | ❌ | ✅ | ✅ | ✅ |
| Delete items | ❌ | ✅ | ✅ | ✅ |
| Toggle check | ❌ | ✅ | ✅ | ✅ |
| Share board | ❌ | ❌ | ✅ | ✅ |
| Update shares | ❌ | ❌ | ✅ | ✅ |
| Remove shares | ❌ | ❌ | ✅ | ✅ |
| Delete board | ❌ | ❌ | ❌ | ✅ |
