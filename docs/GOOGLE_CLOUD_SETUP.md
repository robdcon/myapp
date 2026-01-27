# Google Cloud Console Setup for Calendar Integration

Follow these steps to get your OAuth credentials for Google Calendar API.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **Select a project** dropdown (top left, next to "Google Cloud")
4. Click **NEW PROJECT**
5. Enter project details:
   - **Project name**: `MyApp Calendar Integration` (or your app name)
   - **Organization**: Leave as default (or select if you have one)
   - Click **CREATE**
6. Wait for project creation (takes ~10 seconds)
7. Make sure your new project is selected in the dropdown

---

## Step 2: Enable Google Calendar API

1. In the left sidebar, go to **APIs & Services** > **Library**
   - Or use this direct link: https://console.cloud.google.com/apis/library
2. In the search bar, type: `Google Calendar API`
3. Click on **Google Calendar API** from results
4. Click **ENABLE** button
5. Wait for it to enable (~5 seconds)

---

## Step 3: Configure OAuth Consent Screen

Before creating credentials, you need to set up the consent screen (what users see when authorizing).

1. Go to **APIs & Services** > **OAuth consent screen**
   - Or direct link: https://console.cloud.google.com/apis/credentials/consent
2. Select **User Type**:
   - Choose **External** (allows anyone with Google account)
   - Click **CREATE**

### OAuth Consent Screen - Page 1 (App Information)

Fill in these required fields:

- **App name**: `MyApp` (or your app name)
- **User support email**: Your email address (dropdown)
- **App logo**: (Optional - skip for now)
- **App domain**: (Skip for local development)
- **Authorized domains**: (Skip for local development)
- **Developer contact information**: Your email address

Click **SAVE AND CONTINUE**

### OAuth Consent Screen - Page 2 (Scopes)

1. Click **ADD OR REMOVE SCOPES**
2. In the modal, search for: `calendar`
3. Check the box for:
   - ✅ `https://www.googleapis.com/auth/calendar.readonly`
   - Description: "See and download any calendar you can access using your Google Calendar"
4. Click **UPDATE** at bottom of modal
5. Verify the scope appears in the list
6. Click **SAVE AND CONTINUE**

### OAuth Consent Screen - Page 3 (Test Users)

For development, add yourself as a test user:

1. Click **ADD USERS**
2. Enter your Gmail address (the one you'll use for testing)
3. Click **ADD**
4. Click **SAVE AND CONTINUE**

### OAuth Consent Screen - Page 4 (Summary)

1. Review the information
2. Click **BACK TO DASHBOARD**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
   - Or direct link: https://console.cloud.google.com/apis/credentials
2. Click **+ CREATE CREDENTIALS** (top of page)
3. Select **OAuth client ID**

### Configure OAuth Client

1. **Application type**: Select **Web application**
2. **Name**: `MyApp Web Client` (or any name you want)

3. **Authorized JavaScript origins**: (Optional for now)
   - Click **+ ADD URI**
   - Enter: `http://localhost:3000`

4. **Authorized redirect URIs**: ⚠️ **IMPORTANT**
   - Click **+ ADD URI**
   - Enter EXACTLY: `http://localhost:3000/api/auth/google/callback`
   - Make sure there's no trailing slash!

5. Click **CREATE**

---

## Step 5: Get Your Credentials

After clicking CREATE, a modal appears with your credentials:

### ✅ Copy These Values:

1. **Client ID**:
   - Looks like: `123456789-abc123xyz.apps.googleusercontent.com`
   - Copy this value

2. **Client secret**:
   - Looks like: `GOCSPX-abc123xyz789`
   - Copy this value

3. Click **DOWNLOAD JSON** (optional - saves credentials file)
4. Click **OK** to close the modal

---

## Step 6: Add Credentials to Your .env File

1. Open your `.env` file in the project root
2. Add these lines (replace with YOUR actual values):

```bash
# Google Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
```

### Example:

```bash
GOOGLE_CALENDAR_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-abc123xyz789
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
```

3. Save the `.env` file
4. **Restart your Next.js dev server** (if running) to load new env vars

---

## Step 7: Verify Setup

You can verify your credentials are loaded:

```bash
# In your project directory
node -e "require('dotenv').config(); console.log('Client ID:', process.env.GOOGLE_CALENDAR_CLIENT_ID ? '✅ Found' : '❌ Missing'); console.log('Client Secret:', process.env.GOOGLE_CALENDAR_CLIENT_SECRET ? '✅ Found' : '❌ Missing');"
```

Expected output:

```
Client ID: ✅ Found
Client Secret: ✅ Found
```

---

## Common Issues & Solutions

### ❌ "Access blocked: This app's request is invalid"

**Solution**: Make sure you added yourself as a test user in OAuth consent screen (Step 3, Page 3)

### ❌ "Redirect URI mismatch"

**Solution**:

- Check the URI in Google Cloud Console matches EXACTLY: `http://localhost:3000/api/google/auth/callback`
- No trailing slash
- No extra parameters
- Must be http://localhost (not 127.0.0.1) for local dev

### ❌ "The OAuth client was not found"

**Solution**: Make sure you're using the correct Client ID and the project is selected in Google Cloud Console

### ❌ "Error 400: invalid_scope"

**Solution**: Make sure you added the calendar.readonly scope in OAuth consent screen (Step 3, Page 2)

---

## Production Setup (Later)

When you deploy to production:

1. Go back to **OAuth client ID** in Google Cloud Console
2. Click **EDIT** (pencil icon)
3. Add production URIs:
   - **Authorized JavaScript origins**: `https://your-domain.com`
   - **Authorized redirect URIs**: `https://your-domain.com/api/google/auth/callback`
4. Update your production `.env` with:

   ```bash
   GOOGLE_CALENDAR_REDIRECT_URI=https://your-domain.com/api/google/auth/callback
   ```

5. Publish your OAuth consent screen:
   - Go to **OAuth consent screen**
   - Click **PUBLISH APP**
   - This allows any Google user to authorize (not just test users)

---

## ✅ Next Steps

Once you have your credentials in `.env`:

1. ✅ Google Cloud setup complete
2. **NEXT**: I'll create the database migration
3. Then: Implement OAuth flow
4. Then: Build calendar integration features

---

## Quick Reference

**Google Cloud Console**: https://console.cloud.google.com/
**Your Credentials**: APIs & Services > Credentials
**OAuth Consent Screen**: APIs & Services > OAuth consent screen
**API Library**: APIs & Services > Library

---

**Let me know when you have your credentials in the `.env` file and we'll continue!** 🚀
