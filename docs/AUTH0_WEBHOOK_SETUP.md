# Auth0 User Registration Webhook Setup

This guide walks you through setting up an Auth0 Action to automatically register users in your database when they first log in.

## Overview

When users log in via Google OAuth (or any Auth0 connection), we need to:

1. Capture their Auth0 ID (`google-oauth2|...`)
2. Store it in our `users` table
3. Associate them with their boards

Without this webhook, users will get permission errors because they don't exist in the database.

## Step 1: Add Webhook Secret to Environment Variables

Add this to your `.env` file:

```bash
# Auth0 Webhook Secret (generate a random string)
AUTH0_WEBHOOK_SECRET=your-random-secret-here-use-strong-password
```

**Generate a strong secret:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

## Step 2: Deploy Your Application

Make sure your Next.js app is deployed and accessible via HTTPS:

- Production URL: `https://your-domain.com`
- Webhook endpoint: `https://your-domain.com/api/auth/register-user`

**Important:** The webhook endpoint MUST be HTTPS. Auth0 won't call HTTP endpoints.

## Step 3: Create Auth0 Action

1. Go to **Auth0 Dashboard** → **Actions** → **Flows**
2. Select **Login** flow
3. Click **Custom** (sidebar) → **Build Custom**
4. Name: `Register User in Database`
5. Add this code:

```javascript
/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  // Only register user on first login
  if (event.stats.logins_count === 1) {
    const axios = require('axios');

    const webhookUrl = event.secrets.WEBHOOK_URL;
    const webhookSecret = event.secrets.WEBHOOK_SECRET;

    try {
      const response = await axios.post(
        webhookUrl,
        {
          user: {
            user_id: event.user.user_id,
            email: event.user.email,
            name: event.user.name,
            picture: event.user.picture,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${webhookSecret}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5 second timeout
        }
      );

      console.log('✅ User registered in database:', event.user.email);
    } catch (error) {
      console.error('❌ Failed to register user:', error.message);
      // Don't block login if webhook fails
      // User can still log in, but won't have database record yet
    }
  }
};
```

6. Click **Dependencies** tab
7. Add dependency: `axios` (latest version)

## Step 4: Add Secrets to Action

1. In the Action editor, click the **Secrets** icon (🔑) in the left sidebar
2. Add two secrets:

   **Secret 1:**
   - Key: `WEBHOOK_URL`
   - Value: `https://your-domain.com/api/auth/register-user`

   **Secret 2:**
   - Key: `WEBHOOK_SECRET`
   - Value: (paste the same secret from your `.env` file)

3. Click **Save**

## Step 5: Deploy and Add to Flow

1. Click **Deploy** (top right)
2. Go back to **Actions** → **Flows** → **Login**
3. Drag your custom action `Register User in Database` from the sidebar
4. Drop it between **Start** and **Complete** nodes
5. Click **Apply**

## Step 6: Test the Webhook

### Test in Auth0

1. Go to **Actions** → **Flows** → **Login**
2. Click your action, then click **Test**
3. Use the test runner to simulate a login

### Test Locally (Development)

For local testing, you'll need to expose your local server via ngrok:

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Start your Next.js dev server
npm run dev

# In another terminal, expose it
ngrok http 3000
```

Then use the ngrok URL in your Auth0 Action secrets:

- `WEBHOOK_URL`: `https://xxxx.ngrok.io/api/auth/register-user`

### Test with Real Login

1. Log out of your application
2. Create a new test Google account (or use incognito mode)
3. Log in via Google OAuth
4. Check your database:

```sql
SELECT id, auth0_id, email, name, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

You should see the new user with their `google-oauth2|...` ID.

## Step 7: Update Existing Users (One-Time)

If you already have users with wrong Auth0 IDs, run the migration script:

```bash
npx tsx scripts/fix-user-auth0-id.ts
```

Or manually update them in the database:

```sql
-- Get user's actual Auth0 ID from their session logs
-- Then update:
UPDATE users
SET auth0_id = 'google-oauth2|YOUR_ACTUAL_ID'
WHERE email = 'user@example.com';
```

## Troubleshooting

### Webhook Not Being Called

1. **Check Action is in Flow:**
   - Actions → Flows → Login
   - Verify your action is between Start and Complete
   - Click Apply

2. **Check Secrets:**
   - Make sure `WEBHOOK_URL` uses HTTPS
   - Verify `WEBHOOK_SECRET` matches your `.env`

3. **Check Action Logs:**
   - Actions → Flows → Login → Real-time Logs
   - Look for errors when someone logs in

### 401 Unauthorized Error

The webhook secret doesn't match:

- Check `.env` has `AUTH0_WEBHOOK_SECRET`
- Check Auth0 Action secret `WEBHOOK_SECRET` matches
- Restart your Next.js server after changing `.env`

### 500 Server Error

1. Check your Next.js logs
2. Verify database connection
3. Check the `users` table exists:

```sql
\d users
```

### User Not Being Created

1. **Check Action Condition:**
   - Action only runs on `logins_count === 1` (first login)
   - For existing users, manually create their record

2. **Check Database Constraints:**
   - Email might already exist
   - Auth0 ID might already exist
   - Check for constraint violations in logs

3. **Check ON CONFLICT Clause:**
   - The INSERT uses `ON CONFLICT (auth0_id) DO NOTHING`
   - If user exists, no error is thrown (by design)

## Security Notes

- **Always use HTTPS** for webhook URL in production
- **Keep webhook secret strong** (32+ character random string)
- **Don't expose webhook secret** in logs or client code
- **Webhook doesn't block login** - if it fails, user can still log in
- **Consider rate limiting** if you have high traffic

## Alternative: Manual User Creation

If you don't want to set up the webhook, you can manually create users:

```typescript
// In graphql/context.ts
export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const session = await auth0.getSession();

  if (session?.user) {
    // Auto-create user if they don't exist
    await pool.query(
      `INSERT INTO users (auth0_id, email, name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (auth0_id) DO NOTHING`,
      [session.user.sub, session.user.email, session.user.name, session.user.picture]
    );
  }

  return {
    req,
    user: session?.user || null,
    dbUser: null,
  };
}
```

But this approach has drawbacks:

- Creates user on EVERY request (performance impact)
- No separation of concerns
- Harder to debug

## Summary

✅ **After setup, new users will be automatically registered in your database when they first log in.**

The flow:

1. User clicks "Log in with Google"
2. Auth0 authenticates with Google
3. Auth0 Action calls your webhook
4. Your webhook creates user in database
5. User is redirected to your app
6. User has full permissions on their boards

Any questions? Check the Auth0 Action logs for detailed debugging information.
