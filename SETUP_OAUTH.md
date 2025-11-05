# Quick OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Note your project name

## Step 2: Enable Required APIs

1. Go to **APIs & Services > Library**
2. Search for and enable:
   - **Cloud Vision API**
   - **Google Sheets API**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in:
   - App name: `Receipt Scanner`
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. On Scopes page, click **Add or Remove Scopes**
6. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/cloud-vision`
   - `../auth/spreadsheets`
7. Click **Save and Continue**
8. On Test users page, click **Add Users**
9. Add your Google email address
10. Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Receipt Scanner Web`
5. Under **Authorized JavaScript origins**, click **Add URI**:
   - `http://localhost:3000`
6. Under **Authorized redirect URIs**, click **Add URI**:
   - `http://localhost:3000/api/auth/callback/google`
7. Click **Create**
8. Copy the **Client ID** and **Client secret**

## Step 5: Update .env File

Open the `.env` file and update:

```env
GOOGLE_CLIENT_ID=<paste-your-client-id-here>
GOOGLE_CLIENT_SECRET=<paste-your-client-secret-here>
```

## Step 6: Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Add these headers in row 1:
   - A1: `date`
   - B1: `vendor`
   - C1: `category`
   - D1: `description`
   - E1: `amount`
   - F1: `payment method`
   - G1: `receipt`
4. Copy the spreadsheet ID from URL:
   - URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy `YOUR_SHEET_ID`
5. Update `.env`:
   ```env
   GOOGLE_SHEET_ID=<paste-your-sheet-id-here>
   ```

## Step 7: Restart Dev Server

```bash
npm run dev
```

## Testing

1. Visit http://localhost:3000
2. Click "Sign in with Google"
3. You should be redirected to Google's OAuth consent page
4. Grant the requested permissions
5. You'll be redirected back to the app

## Troubleshooting

- **"Access blocked"**: Make sure you added your email to test users in Step 3
- **"Redirect URI mismatch"**: Double-check the redirect URI exactly matches `http://localhost:3000/api/auth/callback/google`
- **Button does nothing**: Check browser console (F12) for errors
- **"Invalid client"**: Verify CLIENT_ID and CLIENT_SECRET are correct in .env
