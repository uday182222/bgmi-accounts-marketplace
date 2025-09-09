# Google OAuth Setup Instructions

## Issue
The Google Sign-In feature is showing an error: `[GSI_LOGGER]: Missing required parameter: client_id`

## Solution
You need to configure the Google OAuth Client ID for the frontend.

### Steps:

1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized origins: `http://localhost:3000`
   - Copy the Client ID

2. **Configure Frontend Environment:**
   Create a `.env.local` file in the project root with:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```

3. **Configure Backend Environment:**
   Add to your backend `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Restart Development Servers:**
   ```bash
   # Stop both servers (Ctrl+C)
   # Then restart:
   cd backend && npm run dev
   # In another terminal:
   npm run dev
   ```

### Current Status:
- ✅ Backend Google OAuth service is implemented
- ✅ Frontend Google Sign-In UI is implemented  
- ❌ Google Client ID is not configured
- ✅ Error handling is in place (shows user-friendly message)

### Testing:
Once configured, you can test Google Sign-In on the login page at `http://localhost:3000/login`

The Google Sign-In button will work properly and authenticate users through Google OAuth 2.0.
