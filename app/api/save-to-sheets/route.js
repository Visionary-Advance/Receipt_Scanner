import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in with Google.' },
        { status: 401 }
      );
    }

    const receiptData = await request.json();

    // Validate required fields
    if (!receiptData) {
      return NextResponse.json(
        { error: 'No receipt data provided' },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEET_ID environment variable is not set' },
        { status: 500 }
      );
    }

    // Create OAuth2 client with the user's access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    // Create Sheets client
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Prepare the row data in the order: date, vendor, category, description, amount, payment method, receipt
    const rowData = [
      receiptData.date || '',
      receiptData.vendor || '',
      receiptData.category || '',
      receiptData.description || '',
      receiptData.amount || '',
      receiptData.paymentMethod || '',
      receiptData.receipt || '',
    ];

    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:G`, // Columns A through G
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Receipt data saved to Google Sheets',
      updatedRange: response.data.updates.updatedRange,
      updatedRows: response.data.updates.updatedRows,
    });

  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to save to Google Sheets', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to verify sheet connection and get headers
export async function GET(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in with Google.' },
        { status: 401 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEET_ID environment variable is not set' },
        { status: 500 }
      );
    }

    // Create OAuth2 client with the user's access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    // Create Sheets client
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Get the first row (headers) to verify connection
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:G1`,
    });

    return NextResponse.json({
      success: true,
      message: 'Connected to Google Sheets',
      headers: response.data.values?.[0] || [],
    });

  } catch (error) {
    console.error('Error connecting to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Google Sheets', details: error.message },
      { status: 500 }
    );
  }
}
