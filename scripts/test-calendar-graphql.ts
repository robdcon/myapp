// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/lib/db';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  header: (text: string) =>
    console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`),
  title: (text: string) =>
    console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`),
  success: (text: string) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text: string) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  info: (text: string) => console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`),
  warning: (text: string) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
};

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
    };
  }>;
}

/**
 * Makes a GraphQL request to the API
 */
async function makeGraphQLRequest<T = any>(
  query: string,
  variables: Record<string, any> = {},
  headers: Record<string, string> = {}
): Promise<GraphQLResponse<T>> {
  const response = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
}

/**
 * Get a test user's auth0_id from database (prefer Google OAuth user)
 */
async function getTestUserId(): Promise<string | null> {
  try {
    // Try to get Google OAuth user first
    const googleUserResult = await pool.query(
      `SELECT auth0_id FROM users WHERE auth0_id LIKE 'google-oauth2|%' ORDER BY id LIMIT 1`
    );
    if (googleUserResult.rows.length > 0) {
      return googleUserResult.rows[0].auth0_id;
    }

    // Fallback to any user
    const result = await pool.query('SELECT auth0_id FROM users ORDER BY id LIMIT 1');
    return result.rows[0]?.auth0_id || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get an Events board for testing
 */
async function getEventsBoard(): Promise<{ id: number; name: string } | null> {
  try {
    const result = await pool.query(
      `SELECT id, name FROM boards WHERE board_type = 'EVENTS' LIMIT 1`
    );
    return result.rows[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Test 1: Query calendar status (should be not connected)
 */
async function testCalendarStatus(boardId: number, userId: string): Promise<boolean> {
  log.header('');
  log.title('Test 1: Query Calendar Status');
  log.header('');

  const query = `
    query CalendarSyncStatus($boardId: ID!) {
      calendarSyncStatus(boardId: $boardId) {
        isConnected
        calendarId
        calendarName
        lastSyncAt
        syncRangeDays
      }
    }
  `;

  try {
    const response = await makeGraphQLRequest(
      query,
      { boardId: boardId.toString() },
      {
        'x-test-user-id': userId,
      }
    );

    if (response.errors) {
      log.error(`GraphQL errors: ${response.errors.map((e) => e.message).join(', ')}`);
      return false;
    }

    const status = response.data?.calendarSyncStatus;
    log.info(`Connected: ${status?.isConnected ? 'Yes' : 'No'}`);
    log.info(`Calendar ID: ${status?.calendarId || 'None'}`);
    log.info(`Calendar Name: ${status?.calendarName || 'None'}`);
    log.info(`Sync Range: ${status?.syncRangeDays || 14} days`);

    log.success('Calendar status query successful');
    return true;
  } catch (error) {
    log.error(`Request failed: ${error}`);
    return false;
  }
}

/**
 * Test 2: Query available calendars (requires OAuth token)
 */
async function testAvailableCalendars(boardId: number, userId: string): Promise<boolean> {
  log.header('');
  log.title('Test 2: Query Available Calendars');
  log.header('');

  const query = `
    query AvailableCalendars($boardId: ID!) {
      availableCalendars(boardId: $boardId) {
        id
        name
        description
        primary
      }
    }
  `;

  try {
    const response = await makeGraphQLRequest(
      query,
      { boardId: boardId.toString() },
      {
        'x-test-user-id': userId,
      }
    );

    if (response.errors) {
      const errorMsg = response.errors[0]?.message || 'Unknown error';
      if (
        errorMsg.includes('No Google Calendar connected') ||
        errorMsg.includes('No access token')
      ) {
        log.warning('Board not connected to Google Calendar yet (expected)');
        log.info('This query requires OAuth connection first');
        return true; // This is expected behavior
      }
      log.error(`GraphQL errors: ${errorMsg}`);
      return false;
    }

    const calendars = response.data?.availableCalendars || [];
    log.info(`Found ${calendars.length} calendar(s)`);
    calendars.forEach((cal: any) => {
      log.info(`  - ${cal.name} (${cal.id})${cal.primary ? ' [PRIMARY]' : ''}`);
    });

    log.success('Available calendars query successful');
    return true;
  } catch (error) {
    log.error(`Request failed: ${error}`);
    return false;
  }
}

/**
 * Test 3: Update sync range mutation
 */
async function testUpdateSyncRange(boardId: number, userId: string): Promise<boolean> {
  log.header('');
  log.title('Test 3: Update Sync Range');
  log.header('');

  const mutation = `
    mutation UpdateCalendarSyncRange($boardId: ID!, $days: Int!) {
      updateCalendarSyncRange(boardId: $boardId, days: $days)
    }
  `;

  try {
    // Update to 21 days
    log.info('Updating sync range to 21 days...');
    const response = await makeGraphQLRequest(
      mutation,
      { boardId: boardId.toString(), days: 21 },
      { 'x-test-user-id': userId }
    );

    if (response.errors) {
      log.error(`GraphQL errors: ${response.errors.map((e) => e.message).join(', ')}`);
      return false;
    }

    const success = response.data?.updateCalendarSyncRange;
    log.info(`Update result: ${success ? 'Success' : 'Failed'}`);

    // Verify the change
    const verifyQuery = `
      query CalendarStatus($boardId: ID!) {
        calendarSyncStatus(boardId: $boardId) {
          syncRangeDays
        }
      }
    `;
    const verifyResponse = await makeGraphQLRequest(
      verifyQuery,
      { boardId: boardId.toString() },
      { 'x-test-user-id': userId }
    );

    const newRange = verifyResponse.data?.calendarSyncStatus?.syncRangeDays;
    log.info(`New sync range: ${newRange} days`);

    if (newRange !== 21) {
      log.error(`Expected 21 days, got ${newRange}`);
      return false;
    }

    // Reset to default (14 days)
    log.info('Resetting to default (14 days)...');
    await makeGraphQLRequest(
      mutation,
      { boardId: boardId.toString(), days: 14 },
      { 'x-test-user-id': userId }
    );

    log.success('Sync range update successful');
    return true;
  } catch (error) {
    log.error(`Request failed: ${error}`);
    return false;
  }
}

/**
 * Test 4: Board query with calendar status
 */
async function testBoardWithCalendarStatus(
  boardId: number,
  userId: string
): Promise<boolean> {
  log.header('');
  log.title('Test 4: Board Query with Calendar Status');
  log.header('');

  const query = `
    query Board($id: ID!) {
      board(id: $id) {
        id
        name
        board_type
        calendarStatus {
          isConnected
          calendarId
          calendarName
          lastSyncAt
          syncRangeDays
        }
      }
    }
  `;

  try {
    const response = await makeGraphQLRequest(
      query,
      { id: boardId.toString() },
      {
        'x-test-user-id': userId,
      }
    );

    if (response.errors) {
      log.error(`GraphQL errors: ${response.errors.map((e) => e.message).join(', ')}`);
      return false;
    }

    const board = response.data?.board;
    log.info(`Board: ${board?.name}`);
    log.info(`Type: ${board?.board_type}`);
    log.info(`Calendar Connected: ${board?.calendarStatus?.isConnected ? 'Yes' : 'No'}`);

    if (board?.calendarStatus?.isConnected) {
      log.info(`Calendar: ${board.calendarStatus.calendarName}`);
      log.info(`Last Sync: ${board.calendarStatus.lastSyncAt || 'Never'}`);
    }

    log.success('Board query with calendar status successful');
    return true;
  } catch (error) {
    log.error(`Request failed: ${error}`);
    return false;
  }
}

/**
 * Test 5: Items query with event fields
 */
async function testItemsWithEventFields(
  boardId: number,
  userId: string
): Promise<boolean> {
  log.header('');
  log.title('Test 5: Items Query with Event Fields');
  log.header('');

  const query = `
    query Items($boardId: ID!) {
      items(boardId: $boardId) {
        id
        name
        details
        is_checked
        google_event_id
        event_start_time
        event_end_time
        event_description
        google_calendar_link
      }
    }
  `;

  try {
    const response = await makeGraphQLRequest(
      query,
      { boardId: boardId.toString() },
      {
        'x-test-user-id': userId,
      }
    );

    if (response.errors) {
      log.error(`GraphQL errors: ${response.errors.map((e) => e.message).join(', ')}`);
      return false;
    }

    const items = response.data?.items || [];
    log.info(`Found ${items.length} item(s) on board`);

    const calendarItems = items.filter((item: any) => item.google_event_id);
    if (calendarItems.length > 0) {
      log.info(`${calendarItems.length} calendar event(s):`);
      calendarItems.forEach((item: any) => {
        log.info(`  - ${item.name}`);
        if (item.event_start_time) {
          log.info(`    Starts: ${new Date(item.event_start_time).toLocaleString()}`);
        }
      });
    } else {
      log.info('No calendar events synced yet (expected before OAuth)');
    }

    log.success('Items query with event fields successful');
    return true;
  } catch (error) {
    log.error(`Request failed: ${error}`);
    return false;
  }
}

/**
 * Test 6: Sync mutation (will fail without OAuth - expected)
 */
async function testSyncMutation(boardId: number, userId: string): Promise<boolean> {
  log.header('');
  log.title('Test 6: Sync Calendar Mutation');
  log.header('');

  const mutation = `
    mutation SyncBoardCalendar($boardId: ID!) {
      syncBoardCalendar(boardId: $boardId) {
        success
        message
        itemsCreated
        itemsUpdated
        itemsDeleted
      }
    }
  `;

  try {
    const response = await makeGraphQLRequest(
      mutation,
      { boardId: boardId.toString() },
      { 'x-test-user-id': userId }
    );

    if (response.errors) {
      const errorMsg = response.errors[0]?.message || 'Unknown error';
      if (
        errorMsg.includes('No Google Calendar connected') ||
        errorMsg.includes('No access token')
      ) {
        log.warning('Cannot sync without OAuth connection (expected)');
        log.info('This mutation requires OAuth connection first');
        return true; // This is expected behavior
      }
      log.error(`GraphQL errors: ${errorMsg}`);
      return false;
    }

    const result = response.data?.syncBoardCalendar;
    log.info(`Success: ${result?.success}`);
    log.info(`Message: ${result?.message}`);
    log.info(`Items created: ${result?.itemsCreated || 0}`);
    log.info(`Items updated: ${result?.itemsUpdated || 0}`);
    log.info(`Items deleted: ${result?.itemsDeleted || 0}`);

    log.success('Sync mutation completed');
    return true;
  } catch (error) {
    log.error(`Request failed: ${error}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(
    `\n${colors.bright}${colors.cyan}🧪 Google Calendar Integration - GraphQL API Test Suite${colors.reset}`
  );
  log.header('');

  // Check if dev server is running
  log.info('Checking if dev server is running...');
  try {
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });
    if (!response.ok) {
      throw new Error('Server not responding');
    }
    log.success('Dev server is running on http://localhost:3000');
  } catch (error) {
    log.error('Dev server is not running!');
    log.info('Please start it with: npm run dev');
    process.exit(1);
  }

  // Get test user and board
  const userId = await getTestUserId();
  if (!userId) {
    log.error('No test user found in database');
    process.exit(1);
  }
  log.info(`Test user ID: ${userId}`);

  const board = await getEventsBoard();
  if (!board) {
    log.error('No Events board found in database');
    process.exit(1);
  }
  log.info(`Test board: ${board.name} (ID: ${board.id})`);

  // Run tests
  const results: boolean[] = [];

  results.push(await testCalendarStatus(board.id, userId));
  results.push(await testAvailableCalendars(board.id, userId));
  results.push(await testUpdateSyncRange(board.id, userId));
  results.push(await testBoardWithCalendarStatus(board.id, userId));
  results.push(await testItemsWithEventFields(board.id, userId));
  results.push(await testSyncMutation(board.id, userId));

  // Summary
  log.header('');
  log.title('Test Summary');
  log.header('');

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`Total tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${total - passed}${colors.reset}`);

  if (passed === total) {
    log.success('All GraphQL API tests passed!');
  } else {
    log.warning('Some tests failed. Check output above.');
  }

  log.header('');
  log.title('Next Steps: OAuth Flow Testing');
  log.header('');
  log.info('To test the complete OAuth flow:');
  log.info('');
  log.info(`1. Visit: http://localhost:3000/api/auth/google/connect?boardId=${board.id}`);
  log.info('2. Authorize with your Google account');
  log.info('3. After callback, run this script again');
  log.info('');
  log.info('The following operations will then work:');
  log.info('  ✓ List available calendars');
  log.info('  ✓ Select a calendar');
  log.info('  ✓ Sync events from calendar');
  log.info('  ✓ View synced events as board items');

  await pool.end();
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  log.error(`Fatal error: ${error}`);
  pool.end();
  process.exit(1);
});
