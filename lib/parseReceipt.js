/**
 * Parses OCR text from a receipt and extracts structured data
 * @param {string} text - The raw OCR text from the receipt
 * @returns {Object} Parsed receipt data
 */
export function parseReceipt(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const receiptData = {
    date: extractDate(lines, text),
    vendor: extractVendor(lines),
    category: '', // User will fill this in
    description: '', // User will fill this in
    amount: extractAmount(lines, text),
    paymentMethod: '', // User will fill this in
    receipt: text, // Store the full OCR text
  };

  return receiptData;
}

/**
 * Extracts the date from receipt text
 */
function extractDate(lines, fullText) {
  // Common date patterns
  const datePatterns = [
    // MM/DD/YYYY or MM/DD/YY
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    // DD/MM/YYYY
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
    // Month DD, YYYY
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})/i,
    // YYYY-MM-DD
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      return formatDate(match[1]);
    }
  }

  // Default to today's date if not found
  return formatDate(new Date().toISOString().split('T')[0]);
}

/**
 * Formats a date string to YYYY-MM-DD
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // If parsing fails, return as-is
  }
  return dateString;
}

/**
 * Extracts the vendor/store name from receipt text
 * Usually appears in the first few lines
 */
function extractVendor(lines) {
  if (lines.length === 0) return '';

  // The vendor is often in the first 1-3 lines
  // Look for the longest line in the first few lines that's not a date or number
  const topLines = lines.slice(0, 5);

  for (const line of topLines) {
    // Skip lines that are primarily numbers or dates
    if (/^\d+[\d\s\/\-:]*$/.test(line)) continue;
    // Skip lines with only special characters
    if (/^[^a-zA-Z]+$/.test(line)) continue;
    // Skip very short lines
    if (line.length < 3) continue;

    // This is likely the vendor name
    return line;
  }

  // Fallback to the first line
  return lines[0] || '';
}

/**
 * Extracts the total amount from receipt text
 * Looks for keywords like "total", "amount", etc.
 */
function extractAmount(lines, fullText) {
  // Patterns to match currency amounts
  const amountPattern = /\$?\s*(\d+[,\d]*\.?\d{0,2})/;

  // Keywords that often precede the total amount
  const totalKeywords = [
    'total',
    'amount due',
    'balance',
    'grand total',
    'amount',
    'sum',
  ];

  // Look for lines containing total keywords
  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    for (const keyword of totalKeywords) {
      if (lowerLine.includes(keyword)) {
        const match = line.match(amountPattern);
        if (match) {
          // Clean up the amount (remove commas, spaces)
          const amount = match[1].replace(/[,\s]/g, '');
          return parseFloat(amount).toFixed(2);
        }
      }
    }
  }

  // If no total found with keywords, look for the largest amount
  // (often the total is the biggest number)
  let maxAmount = 0;
  for (const line of lines) {
    const match = line.match(amountPattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/[,\s]/g, ''));
      if (amount > maxAmount && amount < 100000) { // Sanity check
        maxAmount = amount;
      }
    }
  }

  return maxAmount > 0 ? maxAmount.toFixed(2) : '';
}

/**
 * Extracts line items from receipt (optional, more complex)
 */
export function extractLineItems(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const items = [];

  // Pattern to match item lines (text followed by price)
  const itemPattern = /^(.+?)\s+\$?\s*(\d+[,\d]*\.?\d{2})$/;

  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match) {
      const [, description, price] = match;

      // Skip if it looks like a total line
      if (/total|subtotal|tax|amount/i.test(description)) continue;

      items.push({
        description: description.trim(),
        price: parseFloat(price.replace(/[,\s]/g, '')).toFixed(2),
      });
    }
  }

  return items;
}
