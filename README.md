# Receipt Scanner

A mobile-first Next.js web application for scanning receipts using Google Cloud Vision API OCR and saving the extracted data to Google Sheets.

## Features

- **Mobile-responsive camera interface** - Capture receipt photos directly from your mobile device
- **OCR text extraction** - Uses Google Cloud Vision API to extract text from receipts
- **Intelligent parsing** - Automatically extracts date, vendor, and amount from receipt text
- **Google Sheets integration** - Saves receipt data directly to your Google Sheets spreadsheet
- **PWA support** - Install the app on your mobile device for quick access
- **Clean, modern UI** - Built with Tailwind CSS for a beautiful user experience

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **NextAuth.js** for OAuth authentication
- **Google Cloud Vision API** for OCR
- **Google Sheets API** for data storage
- **Tailwind CSS** for styling
- **PWA capabilities** for mobile installation

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google Cloud Platform account
- A Google Sheets spreadsheet for storing receipt data

## Google Cloud Setup

### 1. Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Cloud Vision API
   - Google Sheets API

### 2. Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to **APIs & Services > Credentials**
2. Click **Create Credentials** and select **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: "Receipt Scanner" (or your preferred name)
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add the following scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `../auth/cloud-vision`
     - `../auth/spreadsheets`
   - Test users: Add your Google account email
4. Back in the Credentials page, create the OAuth client ID:
   - Application type: **Web application**
   - Name: "Receipt Scanner Web"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourapp.vercel.app`)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourapp.vercel.app/api/auth/callback/google` (for production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** - you'll need these for the `.env` file

### 3. Set Up Google Sheets

1. Create a new Google Sheets spreadsheet or use an existing one
2. Add the following headers in the first row:
   - A1: `date`
   - B1: `vendor`
   - C1: `category`
   - D1: `description`
   - E1: `amount`
   - F1: `payment method`
   - G1: `receipt`
3. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part
4. **Note:** With OAuth, users will access their own Google Sheets using their own credentials, so you don't need to share the spreadsheet

## Installation

1. **Clone the repository** (or you're already here!)

```bash
cd receipt_scanner
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your credentials:

```env
# NextAuth Configuration
# Generate a random secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (from step 2)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Your Google Sheets spreadsheet ID (from step 3)
GOOGLE_SHEET_ID=your-spreadsheet-id-here

# The name of the sheet/tab (default is "Sheet1")
GOOGLE_SHEET_NAME=Sheet1

# Base URL for the application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- Generate a strong `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- Use your OAuth Client ID and Client Secret from Google Cloud Console
- For production, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your deployment URL

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Scanning a Receipt

1. **Sign In**
   - Click "Sign in with Google"
   - Authorize the app to access Google Cloud Vision API and Google Sheets
   - You'll be redirected back to the app

2. **Capture or Upload**
   - Click "Open Camera" to use your device's camera
   - Or click "Upload from Gallery" to select an existing photo

3. **Take the Photo**
   - Position the receipt in the frame
   - Click "Capture Photo"

4. **Review & Edit**
   - The app will automatically extract text using OCR
   - Review the extracted data (date, vendor, amount)
   - Fill in additional fields:
     - Category (e.g., Groceries, Dining, Office)
     - Description (optional notes)
     - Payment Method (Cash, Credit Card, etc.)

5. **Save to Google Sheets**
   - Click "Save to Google Sheets"
   - The data will be appended to your spreadsheet
   - After successful save, you can scan another receipt

### Installing as PWA (Mobile)

#### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

#### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home screen"
4. Tap "Install"

## Project Structure

```
receipt_scanner/
├── app/
│   ├── api/
│   │   ├── process-receipt/
│   │   │   └── route.js          # Vision API OCR endpoint
│   │   └── save-to-sheets/
│   │       └── route.js           # Google Sheets integration
│   ├── layout.js                  # Root layout with PWA metadata
│   ├── page.js                    # Main receipt scanning page
│   └── globals.css                # Global styles
├── components/
│   └── CameraCapture.js           # Camera interface component
├── lib/
│   └── parseReceipt.js            # Receipt text parsing logic
├── public/
│   └── manifest.json              # PWA manifest
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## API Endpoints

### POST `/api/process-receipt`

Processes an uploaded receipt image using Google Cloud Vision API.

**Request:** FormData with `image` field
**Response:**
```json
{
  "success": true,
  "text": "Extracted OCR text...",
  "annotations": [...]
}
```

### POST `/api/save-to-sheets`

Saves receipt data to Google Sheets.

**Request:**
```json
{
  "date": "2025-01-15",
  "vendor": "Store Name",
  "category": "Groceries",
  "description": "Weekly shopping",
  "amount": "45.67",
  "paymentMethod": "Credit Card",
  "receipt": "Full OCR text..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt data saved to Google Sheets",
  "updatedRange": "Sheet1!A2:G2",
  "updatedRows": 1
}
```

### GET `/api/save-to-sheets`

Tests connection to Google Sheets and retrieves headers.

**Response:**
```json
{
  "success": true,
  "message": "Connected to Google Sheets",
  "headers": ["date", "vendor", "category", "description", "amount", "payment method", "receipt"]
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL, e.g., `https://yourapp.vercel.app`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_NAME`
   - `NEXT_PUBLIC_APP_URL` (same as NEXTAUTH_URL)
5. **Important:** Update your Google OAuth redirect URIs in Google Cloud Console to include your production URL:
   - Add `https://yourapp.vercel.app` to Authorized JavaScript origins
   - Add `https://yourapp.vercel.app/api/auth/callback/google` to Authorized redirect URIs
6. Deploy

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker

## Troubleshooting

### Camera Access Issues
- **Permission Denied:** Make sure you've granted camera permissions in your browser settings
- **Camera not working:** Try using "Upload from Gallery" instead
- **HTTPS Required:** Camera access requires HTTPS in production (works on localhost)

### Authentication Issues
- **Can't sign in:** Make sure you've added your email to the test users in the OAuth consent screen
- **Redirect URI mismatch:** Verify that your redirect URIs in Google Cloud Console match your app URLs
- **Access token expired:** The app automatically refreshes tokens, but you may need to sign out and sign in again

### Google Cloud Vision API Errors
- **Unauthorized:** Ensure you're signed in and have granted the necessary permissions
- **API not enabled:** Ensure Cloud Vision API is enabled in your Google Cloud project
- **Quota exceeded:** Check your API usage in Google Cloud Console

### Google Sheets API Errors
- **Permission denied:** Make sure you've granted the app access to your Google Sheets
- **Spreadsheet not found:** Verify the `GOOGLE_SHEET_ID` in your `.env` file
- **Invalid range:** Check that your sheet name matches `GOOGLE_SHEET_NAME`
- **No access:** The app accesses sheets using your OAuth credentials, so make sure you own the spreadsheet or have edit access

### OCR Not Accurate
- Take photos in good lighting
- Ensure the receipt is flat and fully visible
- Try to minimize glare and shadows
- Make sure text is in focus

## Security Notes

- **Never commit `.env` files** to version control (already in `.gitignore`)
- **Keep OAuth credentials secure** - treat Client ID and Client Secret like passwords
- **Use strong NEXTAUTH_SECRET** - generate with `openssl rand -base64 32`
- **Use environment variables** for all sensitive data in production
- **OAuth consent screen** - Keep your app in testing mode if it's for personal use, or go through Google's verification process for public apps
- **Review authorized domains** regularly in Google Cloud Console
- **Monitor API usage** to detect unusual activity
- **HTTPS in production** - Always use HTTPS for production deployments to protect OAuth tokens

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
# Receipt_Scanner
