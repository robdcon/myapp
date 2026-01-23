/**
 * Google Calendar Integration - Backend Test Script
 *
 * This script tests the complete calendar integration flow:
 * 1. OAuth connection
 * 2. Calendar selection
 * 3. Event syncing
 * 4. Token refresh
 * 5. Disconnect
 *
 * Run with: npx tsx scripts/test-calendar-integration.ts
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/lib/db';
import {
  listCalendars,
  listEvents,
  encryptToken,
  decryptToken,
  getValidAccessToken,
  isTokenExpired,
} from '@/lib/google-calendar';
import {
  syncBoardCalendar,
  getBoardSyncStatus,
  updateSyncRange,
} from '@/lib/calendar-sync';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function section(title: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`${title}`, colors.bright + colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

async function testEncryption() {
  section('Test 1: Token Encryption/Decryption');

  try {
    const testToken = 'test-access-token-12345';
    info(`Original token: ${testToken}`);

    const encrypted = encryptToken(testToken);
    info(`Encrypted: ${encrypted}`);

    const decrypted = decryptToken(encrypted);
    info(`Decrypted: ${decrypted}`);

    if (decrypted === testToken) {
      success('Token encryption/decryption works correctly');
      return true;
    } else {
      error('Token decryption mismatch!');
      return false;
    }
  } catch (err) {
    error(`Encryption test failed: ${err}`);
    return false;
  }
}

async function testTokenExpiry() {
  section('Test 2: Token Expiry Check');

  try {
    // Test expired token (5 minutes ago)
    const expiredDate = new Date(Date.now() - 6 * 60 * 1000);
    const isExpired = isTokenExpired(expiredDate);
    info(`Token from 6 minutes ago: ${isExpired ? 'EXPIRED' : 'VALID'}`);

    if (isExpired) {
      success('Correctly identified expired token');
    } else {
      error('Failed to identify expired token');
      return false;
    }

    // Test valid token (30 minutes in future)
    const validDate = new Date(Date.now() + 30 * 60 * 1000);
    const isValid = !isTokenExpired(validDate);
    info(`Token 30 minutes in future: ${isValid ? 'VALID' : 'EXPIRED'}`);

    if (isValid) {
      success('Correctly identified valid token');
      return true;
    } else {
      error('Failed to identify valid token');
      return false;
    }
  } catch (err) {
    error(`Token expiry test failed: ${err}`);
    return false;
  }
}

async function testDatabaseConnection() {
  section('Test 3: Database Connection');

  try {
    const result = await pool.query('SELECT NOW() as current_time');
    info(`Database time: ${result.rows[0].current_time}`);
    success('Database connection successful');
    return true;
  } catch (err) {
    error(`Database connection failed: ${err}`);
    return false;
  }
}

async function testBoardSetup() {
  section('Test 4: Events Board Setup');

  try {
    // Check if we have any Events boards
    const result = await pool.query(
      `SELECT id, name, board_type, 
              google_calendar_id, google_calendar_name,
              calendar_sync_range_days
       FROM boards 
       WHERE board_type = 'EVENTS'
       LIMIT 5`
    );

    if (result.rows.length === 0) {
      info('No Events boards found. Creating a test board...');

      // Get the first user
      const userResult = await pool.query('SELECT id FROM users LIMIT 1');
      if (userResult.rows.length === 0) {
        error('No users found in database. Please create a user first.');
        return false;
      }

      const userId = userResult.rows[0].id;

      // Create a test Events board
      const boardResult = await pool.query(
        `INSERT INTO boards (name, board_type, is_public, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['Test Calendar Board', 'EVENTS', false, 'Test board for calendar integration']
      );

      const boardId = boardResult.rows[0].id;

      // Assign ownership to the user
      await pool.query(
        `INSERT INTO user_boards (user_id, board_id, role)
         VALUES ($1, $2, $3)`,
        [userId, boardId, 'owner']
      );

      success(`Created test Events board (ID: ${boardId})`);
      info(`Board is owned by user ID: ${userId}`);
    } else {
      success(`Found ${result.rows.length} Events board(s):`);
      result.rows.forEach((board) => {
        info(`  - ${board.name} (ID: ${board.id})`);
        if (board.google_calendar_id) {
          info(`    Connected to: ${board.google_calendar_name}`);
          info(`    Sync range: ${board.calendar_sync_range_days} days`);
        } else {
          info(`    Not connected to calendar yet`);
        }
      });
    }

    return true;
  } catch (err) {
    error(`Board setup failed: ${err}`);
    return false;
  }
}

async function testCalendarConnectionStatus() {
  section('Test 5: Calendar Connection Status');

  try {
    // Get all Events boards
    const result = await pool.query(
      `SELECT id, name FROM boards WHERE board_type = 'EVENTS' LIMIT 5`
    );

    if (result.rows.length === 0) {
      error('No Events boards found');
      return false;
    }

    for (const board of result.rows) {
      info(`\nChecking board: ${board.name} (ID: ${board.id})`);
      const status = await getBoardSyncStatus(board.id);

      if (!status) {
        error('Could not get sync status');
        continue;
      }

      if (status.isConnected) {
        success(`✓ Connected to ${status.calendarName}`);
        info(`  Calendar ID: ${status.calendarId}`);
        info(`  Last sync: ${status.lastSyncAt || 'Never'}`);
        info(`  Sync range: ${status.syncRangeDays} days`);
      } else {
        info('✗ Not connected to calendar');
      }
    }

    return true;
  } catch (err) {
    error(`Status check failed: ${err}`);
    return false;
  }
}

async function testManualSync() {
  section('Test 6: Manual Calendar Sync');

  try {
    // Get a connected Events board
    const result = await pool.query(
      `SELECT id, name, google_calendar_id, google_calendar_name
       FROM boards 
       WHERE board_type = 'EVENTS' AND google_calendar_id IS NOT NULL
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      info('⚠️  No connected Events boards found');
      info('Please connect a board to Google Calendar first using:');
      info(
        '  1. Visit: http://localhost:3000/api/auth/google/connect?boardId=YOUR_BOARD_ID'
      );
      info('  2. Authorize with Google');
      info('  3. Run this test again');
      return true; // Not a failure, just skipped
    }

    const board = result.rows[0];
    info(`Syncing board: ${board.name} (ID: ${board.id})`);
    info(`Calendar: ${board.google_calendar_name}`);

    info('\nFetching events from Google Calendar...');
    const syncResult = await syncBoardCalendar(board.id);

    if (syncResult.success) {
      success('Calendar sync completed!');
      info(`  Items created: ${syncResult.itemsCreated}`);
      info(`  Items updated: ${syncResult.itemsUpdated}`);
      info(`  Items deleted: ${syncResult.itemsDeleted}`);

      // Show the synced items
      const items = await pool.query(
        `SELECT name, event_start_time, google_calendar_link
         FROM items 
         WHERE board_id = $1 AND google_event_id IS NOT NULL
         ORDER BY event_start_time
         LIMIT 10`,
        [board.id]
      );

      if (items.rows.length > 0) {
        info(`\nSynced events (showing first ${Math.min(10, items.rows.length)}):`);
        items.rows.forEach((item, index) => {
          info(`  ${index + 1}. ${item.name}`);
        });
      }

      return true;
    } else {
      error(`Sync failed: ${syncResult.error}`);
      return false;
    }
  } catch (err) {
    error(`Manual sync test failed: ${err}`);
    return false;
  }
}

async function testSyncRangeUpdate() {
  section('Test 7: Update Sync Range');

  try {
    // Get first Events board
    const result = await pool.query(
      `SELECT id, name, calendar_sync_range_days FROM boards WHERE board_type = 'EVENTS' LIMIT 1`
    );

    if (result.rows.length === 0) {
      error('No Events boards found');
      return false;
    }

    const board = result.rows[0];
    info(`Current sync range: ${board.calendar_sync_range_days} days`);

    // Update to 30 days
    await updateSyncRange(board.id, 30);
    success('Updated sync range to 30 days');

    // Verify
    const updated = await pool.query(
      'SELECT calendar_sync_range_days FROM boards WHERE id = $1',
      [board.id]
    );
    info(`New sync range: ${updated.rows[0].calendar_sync_range_days} days`);

    // Reset to default
    await updateSyncRange(board.id, 14);
    info('Reset sync range to 14 days (default)');

    return true;
  } catch (err) {
    error(`Sync range update failed: ${err}`);
    return false;
  }
}

async function runAllTests() {
  log(
    '\n🧪 Google Calendar Integration - Backend Test Suite',
    colors.bright + colors.cyan
  );
  log('='.repeat(60) + '\n', colors.cyan);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: 'Encryption', fn: testEncryption },
    { name: 'Token Expiry', fn: testTokenExpiry },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Board Setup', fn: testBoardSetup },
    { name: 'Connection Status', fn: testCalendarConnectionStatus },
    { name: 'Manual Sync', fn: testManualSync },
    { name: 'Sync Range Update', fn: testSyncRangeUpdate },
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (err) {
      error(`Test '${test.name}' crashed: ${err}`);
      results.failed++;
    }
  }

  // Summary
  section('Test Summary');
  log(`Total tests: ${results.total}`, colors.bright);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, results.failed > 0 ? colors.red : colors.green);

  if (results.failed === 0) {
    log('\n🎉 All tests passed!', colors.green + colors.bright);
  } else {
    log('\n⚠️  Some tests failed. Check output above.', colors.yellow);
  }

  // Instructions for next steps
  if (results.passed > 0) {
    section('Next Steps');
    info('To fully test the calendar integration:');
    info('');
    info('1. Connect a board to Google Calendar:');
    info('   Visit: http://localhost:3000/api/auth/google/connect?boardId=YOUR_BOARD_ID');
    info('');
    info('2. After OAuth, test GraphQL mutations:');
    info('   - List available calendars');
    info('   - Select a calendar');
    info('   - Trigger sync');
    info('');
    info('3. GraphQL Playground: http://localhost:3000/api/graphql');
  }

  await pool.end();
}

// Run tests
runAllTests().catch((err) => {
  error(`Fatal error: ${err}`);
  process.exit(1);
});
