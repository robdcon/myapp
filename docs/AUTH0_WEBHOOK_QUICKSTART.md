# Auth0 Webhook Setup - Quick Start

Follow these steps to enable automatic user registration:

## ✅ Step 1: Add Webhook Secret to .env

Add this line to your `.env` file:

```bash
AUTH0_WEBHOOK_SECRET=c0a965375b67d9ae3dbac61b18879b9fdee1759d3b5a5804cc942b4120c15345
```

> ⚠️ **Important:** Use the SAME secret in both your `.env` file AND Auth0 Action secrets!

## ✅ Step 2: Test Webhook Locally (Optional)

```bash
# Start dev server
npm run dev

# In another terminal, test the webhook
npx tsx scripts/test-auth0-webhook.ts
```

Expected output:

```
✅ Success! Status: 200
✅ Webhook endpoint is working correctly!
```

## ✅ Step 3: Deploy Your App

Deploy to production (Vercel, etc.) so you have an HTTPS URL:

```
https://your-domain.com
```

Make sure to add `AUTH0_WEBHOOK_SECRET` to your production environment variables!

## ✅ Step 4: Create Auth0 Action

1. Go to [Auth0 Dashboard](https://manage.auth0.com/) → **Actions** → **Flows**
2. Select **Login** flow
3. Click **Custom** → **Build Custom**
4. Name: `Register User in Database`
5. Paste this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  if (event.stats.logins_count === 1) {
    const axios = require('axios');

    try {
      await axios.post(
        event.secrets.WEBHOOK_URL,
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
            Authorization: `Bearer ${event.secrets.WEBHOOK_SECRET}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
      console.log('✅ User registered:', event.user.email);
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
    }
  }
};
```

6. Click **Dependencies** tab → Add: `axios` (latest)

## ✅ Step 5: Add Secrets to Action

Click the **Secrets** icon (🔑) and add:

1. **WEBHOOK_URL**
   - Value: `https://your-domain.com/api/auth/register-user`

2. **WEBHOOK_SECRET**
   - Value: `c0a965375b67d9ae3dbac61b18879b9fdee1759d3b5a5804cc942b4120c15345`

## ✅ Step 6: Deploy Action to Flow

1. Click **Deploy**
2. Go to **Actions** → **Flows** → **Login**
3. Drag `Register User in Database` between **Start** and **Complete**
4. Click **Apply**

## ✅ Step 7: Test with Real Login

1. Log out of your app
2. Sign in with Google OAuth
3. Check database:

```sql
SELECT id, auth0_id, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 1;
```

You should see your new user with `google-oauth2|...` ID!

## 🎉 Done!

New users will now be automatically registered when they first log in.

---

## 📚 Need More Details?

See the full guide: [docs/AUTH0_WEBHOOK_SETUP.md](./AUTH0_WEBHOOK_SETUP.md)

## 🐛 Troubleshooting

### Webhook returns 401 Unauthorized

- Secret mismatch between `.env` and Auth0 Action
- Restart Next.js server after changing `.env`

### Webhook returns 500 Error

- Check Next.js logs for database errors
- Verify database connection
- Check `users` table exists

### User not created

- Check Auth0 Action logs: Actions → Flows → Login → Real-time Logs
- Verify action is in the flow (between Start and Complete)
- Check `logins_count === 1` condition (only runs on first login)

### For Local Testing

Use ngrok to expose localhost:

```bash
ngrok http 3000
# Use the ngrok URL in Auth0 Action: https://xxxx.ngrok.io/api/auth/register-user
```
