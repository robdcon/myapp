-- Migration: Add Board Sharing Support
-- Date: 2026-01-05

-- Create board_shares table with INTEGER foreign keys to match existing schema
CREATE TABLE IF NOT EXISTS board_shares (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  shared_with_user_id TEXT NOT NULL,  -- Auth0 user ID
  shared_by_user_id TEXT NOT NULL,    -- Auth0 user ID
  permission_level TEXT NOT NULL CHECK (permission_level IN ('VIEW', 'EDIT', 'ADMIN')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(board_id, shared_with_user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_board_shares_board_id ON board_shares(board_id);
CREATE INDEX IF NOT EXISTS idx_board_shares_shared_with ON board_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_board_shares_shared_by ON board_shares(shared_by_user_id);

-- Add columns to boards table for public sharing
ALTER TABLE boards 
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Create index for share token lookups
CREATE INDEX IF NOT EXISTS idx_boards_share_token ON boards(share_token) WHERE share_token IS NOT NULL;

-- Add updated_at trigger for board_shares
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_board_shares_updated_at
    BEFORE UPDATE ON board_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE board_shares IS 'Stores board sharing permissions between users';
COMMENT ON COLUMN board_shares.permission_level IS 'Permission level: VIEW (read-only), EDIT (can modify items), ADMIN (can share and modify board settings)';
COMMENT ON COLUMN boards.is_public IS 'Whether the board can be accessed via public share link';
COMMENT ON COLUMN boards.share_token IS 'Unique token for public sharing link';
