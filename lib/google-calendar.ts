import { google } from 'googleapis';
import crypto from 'crypto';

// Encryption key for storing tokens (use environment variable in production)
// Key must be exactly 32 characters for AES-256
const ENCRYPTION_KEY = (
  process.env.TOKEN_ENCRYPTION_KEY || 'your-32-char-encryption-key!!'
)
  .padEnd(32, '0')
  .slice(0, 32);
const ALGORITHM = 'aes-256-cbc';

/**
 * Google Calendar API Client
 * Handles OAuth flow, token management, and calendar operations
 */

// OAuth Configuration
const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI!,
};

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

/**
 * Create OAuth2 client
 */
function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_OAUTH_CONFIG.clientId,
    GOOGLE_OAUTH_CONFIG.clientSecret,
    GOOGLE_OAUTH_CONFIG.redirectUri
  );
}

/**
 * Generate OAuth authorization URL
 * @param boardId - Board ID to include in state parameter (for callback)
 * @returns Authorization URL for user to visit
 */
export function getAuthUrl(boardId: string): string {
  const oauth2Client = createOAuth2Client();

  const state = Buffer.from(JSON.stringify({ boardId })).toString('base64');

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: SCOPES,
    state: state,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param code - Authorization code from OAuth callback
 * @returns Tokens and expiry information
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain tokens from Google');
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
    scope: tokens.scope || SCOPES.join(' '),
  };
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - The refresh token
 * @returns New access token and expiry
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return {
    accessToken: credentials.access_token,
    expiresAt: new Date(Date.now() + (credentials.expiry_date || 3600 * 1000)),
  };
}

/**
 * List user's calendars
 * @param accessToken - Valid access token
 * @returns List of calendars
 */
export async function listCalendars(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.calendarList.list();

  return (
    response.data.items?.map((cal) => ({
      id: cal.id!,
      name: cal.summary!,
      description: cal.description || undefined,
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor,
    })) || []
  );
}

/**
 * List events from a specific calendar
 * @param accessToken - Valid access token
 * @param calendarId - Calendar ID to fetch events from
 * @param daysForward - How many days forward to fetch (default: 14)
 * @returns List of events
 */
export async function listEvents(
  accessToken: string,
  calendarId: string,
  daysForward: number = 14
) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + daysForward);

  const response = await calendar.events.list({
    calendarId: calendarId,
    timeMin: now.toISOString(),
    timeMax: futureDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250, // Max allowed by API
  });

  return (
    response.data.items?.map((event) => ({
      id: event.id!,
      summary: event.summary || '(No title)',
      description: event.description || undefined,
      startTime: event.start?.dateTime || event.start?.date!,
      endTime: event.end?.dateTime || event.end?.date!,
      location: event.location || undefined,
      htmlLink: event.htmlLink!,
      status: event.status,
      isAllDay: !event.start?.dateTime, // All-day events only have date, not dateTime
    })) || []
  );
}

/**
 * Encrypt token for database storage
 * @param text - Plain text token
 * @returns Encrypted token
 */
export function encryptToken(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted text (IV needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt token from database
 * @param encryptedText - Encrypted token (format: iv:encryptedData)
 * @returns Decrypted token
 */
export function decryptToken(encryptedText: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Check if access token is expired
 * @param expiresAt - Token expiry date
 * @returns True if token is expired or will expire in next 5 minutes
 */
export function isTokenExpired(expiresAt: Date): boolean {
  const now = new Date();
  const expiryWithBuffer = new Date(expiresAt.getTime() - 5 * 60 * 1000); // 5 min buffer
  return now >= expiryWithBuffer;
}

/**
 * Get valid access token, refreshing if necessary
 * @param currentToken - Current access token
 * @param refreshToken - Refresh token
 * @param expiresAt - Current token expiry
 * @returns Valid access token and new expiry (if refreshed)
 */
export async function getValidAccessToken(
  currentToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<{ accessToken: string; expiresAt: Date; wasRefreshed: boolean }> {
  if (!isTokenExpired(expiresAt)) {
    return { accessToken: currentToken, expiresAt, wasRefreshed: false };
  }

  // Token expired, refresh it
  const refreshed = await refreshAccessToken(refreshToken);
  return {
    accessToken: refreshed.accessToken,
    expiresAt: refreshed.expiresAt,
    wasRefreshed: true,
  };
}
