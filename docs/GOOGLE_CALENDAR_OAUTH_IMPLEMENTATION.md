# Google Calendar OAuth Implementation - Complete ✅

## What We Built

### 1. **Google Calendar API Client** (`lib/google-calendar.ts`)

A comprehensive client for Google Calendar integration with:

- **OAuth Functions:**
  - `getAuthUrl(boardId)` - Generate OAuth URL with board state
  - `exchangeCodeForTokens(code)` - Exchange auth code for tokens
  - `refreshAccessToken(refreshToken)` - Auto-refresh expired tokens
  - `getValidAccessToken()` - Smart auto-refresh wrapper

- **Calendar API Functions:**
  - `listCalendars(accessToken)` - Fetch user's calendars
  - `listEvents(accessToken, calendarId, daysForward)` - Fetch events with configurable range

- **Security Functions:**
  - `encryptToken(text)` - AES-256-CBC encryption for database storage
  - `decryptToken(encryptedText)` - Decrypt tokens for API calls
  - `isTokenExpired(expiresAt)` - Check validity with 5-min buffer

### 2. **OAuth API Routes**

#### **Connect Route** (`/api/auth/google/connect`)

- **Endpoint:** `GET /api/auth/google/connect?boardId=123`
- **What it does:**
  1. Verifies user is authenticated
  2. Checks user has edit permission on the board
  3. Verifies board is type EVENTS
  4. Generates OAuth URL with boardId in state parameter
  5. Redirects to Google OAuth consent screen

#### **Callback Route** (`/api/auth/google/callback`)

- **Endpoint:** `GET /api/auth/google/callback?code=...&state=...`
- **What it does:**
  1. Handles OAuth callback from Google
  2. Decodes state parameter to get boardId
  3. Verifies user still has permission
  4. Exchanges code for access + refresh tokens
  5. Encrypts tokens and stores in database
  6. Redirects back to board with success message

#### **Calendars Route** (`/api/auth/google/calendars`)

- **GET:** `GET /api/auth/google/calendars?boardId=123`
  - Fetches list of user's Google Calendars
  - Auto-refreshes token if expired
  - Returns: `{ calendars: [{ id, name, description, primary, ... }] }`

- **POST:** `POST /api/auth/google/calendars`
  - Body: `{ boardId, calendarId, calendarName }`
  - Saves selected calendar to board
  - Sets `google_calendar_id` and `google_calendar_name` on board

#### **Disconnect Route** (`/api/auth/google/disconnect`)

- **Endpoint:** `POST /api/auth/google/disconnect`
- **Body:** `{ boardId: string }`
- **What it does:**
  1. Verifies user has edit permission
  2. Clears all Google Calendar fields from board
  3. Does NOT delete synced items (keeps history)

### 3. **Environment Configuration** (`.env`)

Added secure token encryption:

```env
TOKEN_ENCRYPTION_KEY="bff2e072162f07ded46e2eeefa199040"
```

## OAuth Flow Diagram

```
1. User clicks "Connect Calendar" on Events board
   ↓
2. Frontend calls: GET /api/auth/google/connect?boardId=123
   ↓
3. Backend verifies permissions & redirects to Google OAuth
   ↓
4. User grants permission on Google's consent screen
   ↓
5. Google redirects to: /api/auth/google/callback?code=...&state=...
   ↓
6. Backend exchanges code for tokens, encrypts, stores in DB
   ↓
7. User redirected back to board: /boards/123?calendar_connected=true
   ↓
8. Frontend calls: GET /api/auth/google/calendars?boardId=123
   ↓
9. User selects which calendar to sync
   ↓
10. Frontend calls: POST /api/auth/google/calendars { boardId, calendarId, calendarName }
    ↓
11. Backend saves calendar selection, ready to sync!
```

## Security Features ✅

1. **AES-256-CBC Encryption** for tokens in database
2. **Automatic token refresh** with 5-minute expiry buffer
3. **State parameter** in OAuth to prevent CSRF attacks
4. **Permission checks** on every API call
5. **Board-type validation** (only EVENTS boards can connect)
6. **Encrypted storage** prevents token theft if database is compromised

## Database Schema (Already Applied)

The migration `003_add_google_calendar.sql` added:

**boards table:**

- `google_calendar_id` - Calendar ID being synced
- `google_calendar_name` - Display name
- `google_access_token` - Encrypted access token
- `google_refresh_token` - Encrypted refresh token
- `google_token_expires_at` - Token expiry timestamp
- `calendar_sync_range_days` - Days forward to sync (default: 14)
- `calendar_last_sync_at` - Last sync timestamp
- `calendar_connected_by` - User who connected (INTEGER → users.id)

**items table:**

- `google_event_id` - Unique event ID (for updates)
- `event_start_time` - Event start
- `event_end_time` - Event end
- `event_description` - Full event description
- `google_calendar_link` - Link to event in Google Calendar

## Build Status ✅

```bash
npm run build
# ✓ Compiled successfully in 29.1s
# All OAuth routes built successfully:
# ├ ƒ /api/auth/google/calendars
# ├ ƒ /api/auth/google/callback
# ├ ƒ /api/auth/google/connect
# └ ƒ /api/auth/google/disconnect
```

## Next Steps

1. **Update Google Cloud Console Redirect URI:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit OAuth 2.0 Client
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
   - ⚠️ **IMPORTANT:** Ensure the authorized redirect URI matches `/api/auth/google/callback`

2. **Build Calendar Sync Logic** (`lib/calendar-sync.ts`)
   - Function to sync events from Google Calendar to board items
   - Handle create/update/delete events
   - Convert event data to board item format

3. **Add GraphQL Schema & Resolvers**
   - Mutations: `connectBoardCalendar`, `selectBoardCalendar`, `syncBoardCalendarEvents`, `disconnectBoardCalendar`
   - Queries: `boardCalendarStatus`, `availableCalendars`

4. **Build UI Components**
   - `ConnectCalendarButton` - Start OAuth flow
   - `CalendarConnectionStatus` - Show connection state
   - `CalendarSelectorModal` - Pick which calendar to sync
   - `CalendarEventItem` - Special item display for events
   - `SyncCalendarButton` - Trigger manual sync

## Testing Checklist

- [ ] Update redirect URI in Google Cloud Console
- [ ] Test OAuth flow: click connect → authorize → callback
- [ ] Test calendar selection: list calendars → select one
- [ ] Test token refresh: wait for expiry → auto-refresh
- [ ] Test disconnect: remove calendar connection
- [ ] Test permissions: verify only editors/owners can connect
- [ ] Test board type: verify only EVENTS boards allowed

## Dependencies Added

```bash
npm install googleapis  # ✅ Installed
```

---

**Status:** OAuth infrastructure complete! Ready for sync logic implementation.
