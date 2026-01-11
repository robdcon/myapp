-- Migration: Fix user auth0_id to match Google OAuth login
-- This updates the test user to use the actual Google OAuth ID

-- Update the user record
UPDATE users 
SET auth0_id = 'google-oauth2|106322462892151967917'
WHERE email = 'robdcon@gmail.com';

-- Verify the change
SELECT id, auth0_id, email, name FROM users WHERE email = 'robdcon@gmail.com';
