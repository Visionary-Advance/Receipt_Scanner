'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import CameraCapture from '../components/CameraCapture';
import { parseReceipt } from '../lib/parseReceipt';

export default function Home() {
  const { data: session, status } = useSession();
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Handle sign in
  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to sign in. Please check your OAuth configuration in the .env file.'
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle image capture from camera component
  const handleImageCapture = async (imageBlob) => {
    setCapturedImage(imageBlob);
    setMessage({ type: '', text: '' });

    // Automatically process the image
    await processImage(imageBlob);
  };

  // Process the image with Google Vision API
  const processImage = async (imageBlob) => {
    setIsProcessing(true);
    setMessage({ type: 'info', text: 'Processing receipt...' });

    try {
      const formData = new FormData();
      formData.append('image', imageBlob);

      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process receipt');
      }

      // Parse the extracted text
      const parsed = parseReceipt(data.text);
      setReceiptData(parsed);
      setMessage({ type: 'success', text: 'Receipt processed successfully!' });

    } catch (error) {
      console.error('Error processing image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to process receipt' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setReceiptData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save receipt data to Google Sheets
  const saveToSheets = async () => {
    setIsSaving(true);
    setMessage({ type: 'info', text: 'Saving to Google Sheets...' });

    try {
      const response = await fetch('/api/save-to-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to Google Sheets');
      }

      setMessage({ type: 'success', text: 'Receipt saved to Google Sheets successfully!' });

      // Reset form after successful save
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error saving to sheets:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save to Google Sheets' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setCapturedImage(null);
    setReceiptData(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-end">
              {session ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Receipt Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Capture, extract, and save receipt data to Google Sheets
          </p>
        </header>

        {/* Sign In Prompt */}
        {!session && status !== 'loading' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 mb-6 text-center">
            <svg
              className="mx-auto h-16 w-16 text-blue-600 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Sign in to get started
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Sign in with your Google account to scan receipts and save data to your Google Sheets.
            </p>
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 mb-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {/* Status Message */}
        {session && message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Main Content */}
        {session && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          {!receiptData ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Capture Receipt
              </h2>
              <CameraCapture onImageCapture={handleImageCapture} />

              {isProcessing && (
                <div className="mt-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Processing receipt...
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Review & Edit Receipt Data
              </h2>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={receiptData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={receiptData.vendor}
                    onChange={(e) => handleFieldChange('vendor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Store name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={receiptData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Groceries, Dining, Office"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={receiptData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={receiptData.amount}
                    onChange={(e) => handleFieldChange('amount', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={receiptData.paymentMethod}
                    onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* OCR Text (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Extracted Text (for reference)
                  </label>
                  <textarea
                    value={receiptData.receipt}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-400 font-mono text-sm"
                    rows={4}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={saveToSheets}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save to Google Sheets'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Powered by Google Cloud Vision API & Google Sheets API</p>
        </footer>
      </div>
    </div>
  );
}
