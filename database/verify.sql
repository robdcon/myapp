-- Verification queries for database/install.sql.

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'boards', 'user_boards', 'items', 'board_shares')
ORDER BY table_name;

SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname IN ('board_type', 'user_role')
ORDER BY t.typname, e.enumsortorder;

SELECT
  table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'boards', 'user_boards', 'items', 'board_shares')
ORDER BY table_name, ordinal_position;

SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'boards', 'user_boards', 'items', 'board_shares')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'boards', 'user_boards', 'items', 'board_shares')
ORDER BY tablename, indexname;

SELECT
  event_object_table AS table_name,
  trigger_name,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'boards', 'items', 'board_shares')
ORDER BY event_object_table, trigger_name;

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'boards', 'user_boards', 'items', 'board_shares')
ORDER BY tablename;

-- Empty-state smoke queries used by the application.
SELECT id FROM users WHERE auth0_id = 'verification-user' LIMIT 1;
SELECT id FROM users WHERE email = 'verification@example.com' LIMIT 1;
SELECT * FROM boards WHERE id = -1;
SELECT * FROM user_boards WHERE user_id = -1;
SELECT * FROM items WHERE board_id = -1 AND deleted_at IS NULL;
SELECT * FROM board_shares
WHERE board_id = -1 AND shared_with_user_id = 'verification-user';
SELECT * FROM items WHERE google_event_id = 'verification-event';
