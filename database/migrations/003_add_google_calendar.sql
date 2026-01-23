-- Migration: Add Google Calendar integration fields
-- Add Google Calendar support to boards and items tables

-- Add Google Calendar fields to boards table
ALTER TABLE boards ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;
ALTER TABLE boards ADD COLUMN IF NOT EXISTS google_calendar_name TEXT;
ALTER TABLE boards ADD COLUMN IF NOT EXISTS google_access_token TEXT; -- Will be encrypted
ALTER TABLE boards ADD COLUMN IF NOT EXISTS google_refresh_token TEXT; -- Will be encrypted
ALTER TABLE boards ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMP;
ALTER TABLE boards ADD COLUMN IF NOT EXISTS calendar_sync_range_days INTEGER DEFAULT 14;
ALTER TABLE boards ADD COLUMN IF NOT EXISTS calendar_last_sync_at TIMESTAMP;
ALTER TABLE boards ADD COLUMN IF NOT EXISTS calendar_connected_by INTEGER REFERENCES users(id);

-- Add event fields to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS event_start_time TIMESTAMP;
ALTER TABLE items ADD COLUMN IF NOT EXISTS event_end_time TIMESTAMP;
ALTER TABLE items ADD COLUMN IF NOT EXISTS event_description TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS google_calendar_link TEXT;

-- Create unique index on google_event_id (to prevent duplicate events)
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_google_event_id ON items(google_event_id) WHERE google_event_id IS NOT NULL;

-- Create index on event_start_time for chronological sorting
CREATE INDEX IF NOT EXISTS idx_items_event_start_time ON items(event_start_time) WHERE event_start_time IS NOT NULL;

-- Create index on board_id and google_calendar_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_boards_google_calendar ON boards(google_calendar_id) WHERE google_calendar_id IS NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'boards' 
    AND column_name LIKE '%calendar%'
    OR column_name LIKE '%google%'
ORDER BY ordinal_position;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'items' 
    AND (column_name LIKE '%event%' OR column_name LIKE '%google%')
ORDER BY ordinal_position;
