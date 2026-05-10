# Google Calendar Integration - Requirements & Tasks

## Overview

Add Google Calendar integration to allow users to sync board items (especially date-based items) with their Google Calendar.

## Tasks to Refine

### 1. Define Scope & Use Cases

- [ ] What types of board items should sync to calendar?
  - All items?
  - Only items with due dates?
  - Only specific board types?
  - Only items marked for calendar sync?
- [ ] What actions trigger calendar sync?
  - Manual "Add to Calendar" button per item?
  - Automatic sync on item creation/update?
  - Batch sync for entire board?
- [ ] What calendar operations are needed?
  - Create calendar events
  - Update calendar events
  - Delete calendar events
  - Two-way sync (calendar changes update board)?
  - One-way sync (board → calendar only)?
- [ ] Which calendar should items sync to?
  - User's primary calendar?
  - User selects calendar from list?
  - Create dedicated "Board Items" calendar?

### 2. Data Model Changes

- [ ] Do we need to add new fields to `items` table?
  - `google_calendar_event_id` (TEXT) - Store event ID for updates/deletes
  - `due_date` (TIMESTAMP) - When is the item due?
  - `sync_to_calendar` (BOOLEAN) - Flag to enable/disable sync per item
  - `calendar_id` (TEXT) - Which calendar to sync to
- [ ] Do we need a new `calendar_integrations` table?
  - Store user's Google Calendar tokens/refresh tokens
  - Store calendar preferences
  - Track sync status/errors
- [ ] Do we need to track sync history/logs?

### 3. Authentication & Authorization

- [ ] How to authenticate with Google Calendar API?
  - Use Google OAuth 2.0 (separate from Auth0?)
  - Add Google Calendar scope to existing Auth0 Google connection?
  - Use service account?
- [ ] Where to store Google OAuth tokens?
  - Database table: `user_google_tokens`?
  - Encrypted in users table?
- [ ] Token refresh strategy?
  - Automatic refresh on expiry?
  - Manual re-authentication flow?
- [ ] Permissions model?
  - All board owners can sync to their calendar?
  - Shared board items - whose calendar gets the event?

### 4. API Integration

- [ ] Which Google Calendar API endpoints needed?
  - `calendar.events.insert` - Create event
  - `calendar.events.update` - Update event
  - `calendar.events.delete` - Delete event
  - `calendar.calendarList.list` - Get user's calendars
  - `calendar.events.watch` - Set up webhooks for two-way sync?
- [ ] Error handling strategy?
  - What if API call fails?
  - Retry logic?
  - User notification?
- [ ] Rate limiting considerations?
  - Google Calendar API quotas
  - Batch operations vs individual calls?

### 5. UI/UX Design

- [ ] Where does user connect Google Calendar?
  - Settings page?
  - Board settings?
  - First-time setup wizard?
- [ ] How to trigger sync for individual items?
  - "Add to Calendar" button on item card?
  - Checkbox in item edit form?
  - Automatic based on due date field?
- [ ] Visual indicators?
  - Icon showing item is synced to calendar?
  - Show sync status (synced, pending, failed)?
  - Link to view event in Google Calendar?
- [ ] Bulk operations?
  - "Sync all items to calendar" button?
  - "Remove all from calendar" option?

### 6. Backend Implementation

- [ ] Create GraphQL mutations
  - `connectGoogleCalendar` - OAuth flow
  - `disconnectGoogleCalendar` - Revoke access
  - `syncItemToCalendar` - Manual sync single item
  - `syncBoardToCalendar` - Sync entire board
  - `removeItemFromCalendar` - Delete event
- [ ] Create GraphQL queries
  - `googleCalendarStatus` - Check if connected
  - `userCalendars` - List available calendars
  - `itemCalendarEvent` - Get event details for item
- [ ] Create API routes
  - `/api/google/auth/callback` - OAuth callback
  - `/api/google/calendar/webhook` - Receive updates from Google
- [ ] Background jobs needed?
  - Periodic sync to ensure consistency?
  - Token refresh job?

### 7. Database Schema

```sql
-- Proposed schema (to be refined)

-- Store Google OAuth tokens
CREATE TABLE user_google_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Add to items table
ALTER TABLE items ADD COLUMN google_calendar_event_id TEXT;
ALTER TABLE items ADD COLUMN due_date TIMESTAMP;
ALTER TABLE items ADD COLUMN sync_to_calendar BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN calendar_id TEXT;
```

### 8. Testing Strategy

- [ ] Unit tests
  - Google API client wrapper
  - Token refresh logic
  - Event creation/update/delete
- [ ] Integration tests
  - OAuth flow
  - Calendar sync end-to-end
  - Error scenarios
- [ ] Manual testing checklist
  - Connect Google Calendar
  - Create item with due date
  - Sync to calendar
  - Update item, verify calendar updates
  - Delete item, verify calendar event deleted
  - Disconnect calendar, verify cleanup

### 9. Security Considerations

- [ ] Token storage
  - Encrypt access_token and refresh_token in database?
  - Use environment variables for OAuth client secret
- [ ] Scopes
  - Request minimum required scopes
  - `https://www.googleapis.com/auth/calendar.events` (read/write events)
  - Or just `https://www.googleapis.com/auth/calendar.readonly`?
- [ ] Webhook verification
  - Verify webhook requests from Google
  - Implement HMAC signature validation
- [ ] Data privacy
  - GDPR compliance for storing tokens
  - User can disconnect and delete all data

### 10. Documentation

- [ ] User guide
  - How to connect Google Calendar
  - How to sync items
  - How to disconnect
- [ ] Developer guide
  - Architecture overview
  - API documentation
  - How to test locally
- [ ] Deployment guide
  - Environment variables needed
  - Google Cloud Console setup
  - OAuth consent screen configuration

### 11. Configuration & Setup

- [ ] Google Cloud Console setup
  - Create project
  - Enable Google Calendar API
  - Create OAuth 2.0 credentials
  - Configure OAuth consent screen
  - Add authorized redirect URIs
- [ ] Environment variables
  - `GOOGLE_CALENDAR_CLIENT_ID`
  - `GOOGLE_CALENDAR_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_REDIRECT_URI`
- [ ] Database migrations
  - Create user_google_tokens table
  - Add columns to items table

### 12. Edge Cases & Error Handling

- [ ] What if user revokes access from Google side?
- [ ] What if calendar is deleted?
- [ ] What if event is deleted from Google Calendar directly?
- [ ] Conflict resolution for two-way sync?
- [ ] What if user doesn't have due_date on item?
- [ ] What if board has hundreds of items to sync?
- [ ] Network failures during sync?
- [ ] Token expired during operation?

---

## ✅ REFINED SCOPE - Phase 1: Read Calendar Events

### Primary Use Case

"As a user, I want to view events from my Google Calendar within the app"

### Decided Scope

- **Direction**: Calendar → App (read-only, one-way)
- **Authentication**: Separate OAuth flow after login (not integrated with Auth0)
- **Scope Required**: `https://www.googleapis.com/auth/calendar.readonly`
- **Calendar Selection**: User selects a specific calendar to read from
- **Display**: Show calendar events in the app UI

### Implementation Tasks - Phase 1

#### 1. ✅ Google Cloud Setup (Prerequisites)

- [ ] Create Google Cloud Project
- [ ] Enable Google Calendar API
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Configure OAuth consent screen
- [ ] Add authorized redirect URI: `http://localhost:3000/api/google/auth/callback` (dev)
- [ ] Add production redirect URI when deploying
- [ ] Get `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET`

#### 2. Database Schema

```sql
-- Store Google OAuth tokens
CREATE TABLE user_google_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  scope TEXT NOT NULL,
  selected_calendar_id TEXT, -- Which calendar user wants to read
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

#### 3. Environment Variables

Add to `.env`:

```bash
GOOGLE_CALENDAR_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
```

#### 4. Backend Implementation

- [ ] Create `/api/google/auth/connect` - Initiate OAuth flow
- [ ] Create `/api/google/auth/callback` - Handle OAuth callback
- [ ] Create `/api/google/auth/disconnect` - Revoke access & delete tokens
- [ ] Create Google Calendar API client wrapper (`lib/google-calendar.ts`)
  - `getAuthUrl()` - Generate OAuth URL
  - `exchangeCode()` - Exchange code for tokens
  - `refreshAccessToken()` - Refresh expired token
  - `listCalendars()` - Get user's calendar list
  - `listEvents()` - Get events from specific calendar
- [ ] Create GraphQL query: `googleCalendarEvents(calendarId: String!, startDate: String, endDate: String)`
- [ ] Create GraphQL query: `googleCalendarStatus` - Check if connected
- [ ] Create GraphQL query: `googleCalendars` - List available calendars
- [ ] Create GraphQL mutation: `connectGoogleCalendar` - Start OAuth
- [ ] Create GraphQL mutation: `selectCalendar(calendarId: String!)` - Set selected calendar
- [ ] Create GraphQL mutation: `disconnectGoogleCalendar` - Disconnect

#### 5. Frontend Implementation

- [ ] Create "Connect Google Calendar" button (settings or board page?)
- [ ] Create OAuth popup/redirect flow
- [ ] Create calendar selector dropdown (after connection)
- [ ] Create calendar events display component
  - Show event title, date/time, description
  - Link to open in Google Calendar
- [ ] Add "Disconnect" button
- [ ] Show connection status indicator

#### 6. Testing

- [ ] Test OAuth flow (connect → callback → tokens stored)
- [ ] Test listing calendars
- [ ] Test reading events from selected calendar
- [ ] Test token refresh when expired
- [ ] Test disconnect flow
- [ ] Test with no events
- [ ] Test with large number of events (pagination)

---

## Questions to Answer for Phase 1

**Before I start implementing, please answer:**

1. **Where should the "Connect Google Calendar" button be?**
   - Settings page?
   - On a specific board?
   - Global app header/navigation?

2. **How should calendar events be displayed?**
   - In a sidebar on board view?
   - Separate "Calendar" page?
   - Modal/popup?
   - Inline with board items?

3. **Date range for events?**
   - Show events from today forward?
   - Last 7 days + next 30 days?
   - User selects date range?

4. **What event details to show?**
   - Title only?
   - Title + time?
   - Title + time + description?
   - Include attendees?

5. **Should this be board-specific or user-wide?**
   - One calendar connection per user (shows in all boards)?
   - Each board can have different calendar?

---

## Next Steps (After Questions Answered)

1. Set up Google Cloud Project & get credentials
2. Create database migration for `user_google_tokens` table
3. Implement OAuth flow (connect → callback → store tokens)
4. Implement calendar listing
5. Implement event reading
6. Create UI components
7. Test end-to-end

---

**STATUS**: � **READY TO START** - Please answer the 5 questions above, then I can begin implementation!
