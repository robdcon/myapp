# Google Calendar Integration - Implementation Plan

## ✅ Requirements Summary

**Goal**: Read Google Calendar events and display them as board items on "Events" boards

### User Answers:

1. **Location**: New "Events" board type (integrated into existing boards table)
2. **Display**: As board items on the Events board
3. **Date Range**: Next 2 weeks (configurable)
4. **Event Details**: Title + Time (visible), Description (toggle to show/hide)
5. **Scope**: Board-specific (each Events board connects to different calendar)

---

## Database Schema Changes

### Add Google Calendar fields to existing `boards` table

```sql
-- Add new board type 'EVENTS' (update enum or validation)
-- No new table needed!

-- Add Google Calendar fields to boards table
ALTER TABLE boards ADD COLUMN google_calendar_id TEXT; -- Which Google calendar to sync from
ALTER TABLE boards ADD COLUMN google_calendar_name TEXT; -- Display name
ALTER TABLE boards ADD COLUMN google_access_token TEXT; -- Encrypted
ALTER TABLE boards ADD COLUMN google_refresh_token TEXT; -- Encrypted
ALTER TABLE boards ADD COLUMN google_token_expires_at TIMESTAMP;
ALTER TABLE boards ADD COLUMN calendar_sync_range_days INTEGER DEFAULT 14;
ALTER TABLE boards ADD COLUMN calendar_last_sync_at TIMESTAMP;
ALTER TABLE boards ADD COLUMN calendar_connected_by INTEGER REFERENCES users(id); -- Who connected it

-- Add event fields to existing items table
ALTER TABLE items ADD COLUMN google_event_id TEXT UNIQUE;
ALTER TABLE items ADD COLUMN event_start_time TIMESTAMP;
ALTER TABLE items ADD COLUMN event_end_time TIMESTAMP;
ALTER TABLE items ADD COLUMN event_description TEXT;
ALTER TABLE items ADD COLUMN google_calendar_link TEXT;
```

### Benefits of This Approach:

✅ **No new table needed** - Uses existing `boards` table
✅ **Sharing works automatically** - User board permissions apply
✅ **Simpler architecture** - One less table to manage
✅ **Easy to query** - All board data in one place

---

## Implementation Steps

### 1. Prerequisites - Google Cloud Console Setup

- [ ] Create Google Cloud Project
- [ ] Enable Google Calendar API
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Configure OAuth consent screen
- [ ] Add redirect URI: `http://localhost:3000/api/google/auth/callback`
- [ ] Get `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET`

### 2. Environment Variables

Add to `.env`:

```bash
GOOGLE_CALENDAR_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
```

### 3. Database Migration

Create migration: `database/migrations/003_add_google_calendar.sql`

### 4. Add EVENTS Board Type

Update board type enum/validation to include `'EVENTS'`

### 5. Backend - Google Calendar Client

File: `lib/google-calendar.ts`

- [ ] `getAuthUrl(boardId: string)` - Generate OAuth URL with state
- [ ] `exchangeCodeForTokens(code: string)` - Exchange code for tokens
- [ ] `refreshAccessToken(refreshToken: string)` - Auto-refresh expired tokens
- [ ] `listCalendars(accessToken: string)` - Get user's calendars
- [ ] `listEvents(accessToken, calendarId, daysForward)` - Fetch events
- [ ] `encryptToken(token: string)` - Encrypt before storing
- [ ] `decryptToken(encrypted: string)` - Decrypt after retrieving

### 6. Backend - API Routes

- [ ] `/api/google/auth/connect?boardId=123` - Start OAuth (state = boardId)
- [ ] `/api/google/auth/callback` - Handle callback, save tokens to board
- [ ] `/api/google/auth/disconnect?boardId=123` - Remove calendar connection

### 7. Backend - GraphQL Schema

```graphql
type Board {
  # ... existing fields
  googleCalendarId: String
  googleCalendarName: String
  calendarSyncRangeDays: Int
  calendarLastSyncAt: String
  isCalendarConnected: Boolean!
}

type Query {
  availableCalendars(boardId: ID!): [GoogleCalendar!]!
}

type Mutation {
  connectBoardCalendar(boardId: ID!): OAuthUrl!
  selectBoardCalendar(boardId: ID!, calendarId: String!, calendarName: String!): Boolean!
  syncBoardCalendarEvents(boardId: ID!): SyncResult!
  disconnectBoardCalendar(boardId: ID!): Boolean!
  updateCalendarSyncRange(boardId: ID!, days: Int!): Boolean!
}

type GoogleCalendar {
  id: String!
  name: String!
  primary: Boolean!
}

type SyncResult {
  eventsImported: Int!
  eventsUpdated: Int!
  success: Boolean!
  error: String
}

type OAuthUrl {
  url: String!
}
```

### 8. Backend - Sync Logic

File: `lib/calendar-sync.ts`

- [ ] `syncCalendarToBoard(boardId: number)`
  1. Get board with calendar credentials
  2. Decrypt tokens
  3. Check if token expired → refresh if needed
  4. Fetch events from Google (today + N days forward)
  5. For each event:
     - Check if item exists (by `google_event_id`)
     - If exists: UPDATE item
     - If not: CREATE new item
  6. Set: `name`, `event_start_time`, `event_end_time`, `event_description`, `google_calendar_link`
  7. Delete items for events no longer in calendar
  8. Update `calendar_last_sync_at` on board

### 9. Frontend - Board Type Support

- [ ] Update board creation form to include "Events" option
- [ ] Add calendar icon for Events board type

### 10. Frontend - Events Board UI Components

File structure: `src/features/calendar-integration/ui/`

**Components to create:**

- [ ] `ConnectCalendarButton.tsx` - Initiates OAuth popup
- [ ] `CalendarConnectionStatus.tsx` - Shows connection info
  - Connected calendar name
  - "Sync Now" button
  - "Change Calendar" / "Disconnect" buttons
  - Sync range slider (1-90 days)
  - Last sync timestamp
- [ ] `CalendarSelector.tsx` - Modal to choose calendar after OAuth
- [ ] `CalendarEventItem.tsx` - Special item card for events
  - Event title (bold)
  - Date/time badge
  - "Show Description" toggle
  - Link to Google Calendar icon
- [ ] `EventsBoard.tsx` - Board viewer for Events boards
  - Calendar controls at top
  - Events displayed chronologically
  - Optional: Group by date (Today, Tomorrow, This Week, Next Week)

### 11. Frontend - Board Viewer Integration

Update `src/widgets/board-viewer/` to:

- [ ] Detect if `board.board_type === 'EVENTS'`
- [ ] Render calendar controls (connect/status)
- [ ] Display event items with special formatting
- [ ] Sort items by `event_start_time` instead of `created_at`

### 12. Configuration Constants

File: `src/shared/config/calendar.ts`

```typescript
export const DEFAULT_CALENDAR_SYNC_DAYS = 14;
export const MAX_CALENDAR_SYNC_DAYS = 90;
export const MIN_CALENDAR_SYNC_DAYS = 1;

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
];
```

---

## Data Flow

```
User creates "Events" board (board_type = 'EVENTS')
    ↓
Board shows "Connect Google Calendar" button
    ↓
User clicks → OAuth popup opens
    ↓
User authorizes → Callback with auth code
    ↓
Exchange code for tokens → Store encrypted in boards table
    ↓
Show calendar selector modal
    ↓
User selects calendar → Save google_calendar_id to board
    ↓
Auto-trigger first sync: Fetch events (next 14 days)
    ↓
Create board items for each event (with google_event_id)
    ↓
Display items chronologically on board
    ↓
User can:
  - "Sync Now" manually anytime
  - Adjust sync range (1-90 days)
  - Change calendar selection
  - Disconnect calendar
```

---

## Sharing Benefits

Since calendar data is stored in the `boards` table:

- ✅ **Shared board members** can see calendar events as items
- ✅ **Board permissions apply** (owner/editor/viewer)
- ✅ **Only board owner** can connect/disconnect calendar (check permissions in mutations)
- ✅ **All members see synced events** automatically
- ✅ **No complex sharing logic needed** - existing system handles it!

---

## Security Considerations

1. **Token Encryption**: Encrypt `google_access_token` and `google_refresh_token` before storing
2. **Permission Checks**: Only board owners can connect/disconnect calendar
3. **Token Scope**: Request minimal scope (`calendar.readonly`)
4. **Token Storage**: Store encrypted in database, decrypt only when needed
5. **OAuth State**: Include boardId in state parameter to prevent CSRF

---

## Testing Checklist

- [ ] Create Events board as owner
- [ ] Connect Google Calendar (OAuth flow)
- [ ] Select calendar from list
- [ ] Verify events imported as items
- [ ] Check event details (title, time, description toggle)
- [ ] Manual "Sync Now" - new events appear
- [ ] Share board with another user - they see events
- [ ] Non-owner cannot disconnect calendar
- [ ] Update event in Google - sync reflects change
- [ ] Delete event in Google - item removed after sync
- [ ] Change sync range (14 → 7 days) - fewer events
- [ ] Token expiry - auto-refresh works
- [ ] Disconnect calendar - removes connection and items
- [ ] Calendar with no events - no errors
- [ ] Calendar with 100+ events - handles pagination

---

## Implementation Order

1. ✅ Requirements defined
2. **NEXT**: Google Cloud Console setup (get credentials)
3. Database migration (add columns to boards + items tables)
4. Add `EVENTS` board type constant
5. Google Calendar API client (`lib/google-calendar.ts`)
6. OAuth API routes (`/api/google/auth/*`)
7. GraphQL schema updates
8. GraphQL resolvers (connect, sync, disconnect)
9. Sync logic implementation
10. Frontend components
11. Board viewer integration
12. End-to-end testing

---

**STATUS**: 🟢 **READY TO START** - Simplified architecture using existing boards table!
