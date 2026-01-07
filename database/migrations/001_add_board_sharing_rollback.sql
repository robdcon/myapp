-- Rollback Migration: Remove Board Sharing Support
-- Date: 2026-01-05

-- Drop trigger
DROP TRIGGER IF EXISTS update_board_shares_updated_at ON board_shares;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_boards_share_token;
DROP INDEX IF EXISTS idx_board_shares_shared_by;
DROP INDEX IF EXISTS idx_board_shares_shared_with;
DROP INDEX IF EXISTS idx_board_shares_board_id;

-- Remove columns from boards table
ALTER TABLE boards 
  DROP COLUMN IF EXISTS share_token,
  DROP COLUMN IF EXISTS is_public;

-- Drop board_shares table
DROP TABLE IF EXISTS board_shares;
