# Google Sheets Integration Guide for Ghar Ka Swaad

This guide provides instructions and the exact code required to set up the Google Apps Script backend for your Enquiry Form.

## 1. Setting up the Google Sheet
1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com).
2. Name it something like "Ghar Ka Swaad Enquiries".
3. In the first row (A1 to J1), create the following headers in exactly this order:
   * Date
   * Time
   * Name
   * Mobile
   * Area
   * Address
   * Contact Detail
   * Plan Interest
   * Start Date
   * Delivery Time

## 2. Setting up Google Apps Script
1. In your Google Sheet, click on **Extensions > Apps Script** in the top menu.
2. Delete any code in the editor (usually `function myFunction() {}`).
3. Paste the following complete code into the editor:

```javascript
// Replace this with your exact Sheet ID from the URL
// Example: https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  // CORS Configuration
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Parse the incoming JSON data from the frontend
    const requestData = JSON.parse(e.postData.contents);
    
    // Format Date and Time in Asia/Kolkata (IST) timezone
    const now = new Date();
    
    const formattedDate = Utilities.formatDate(now, 'Asia/Kolkata', 'dd-MM-yyyy');
    const formattedTime = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm:ss a');

    // Access the correct spreadsheet and sheet
    const doc = SpreadsheetApp.openById(SHEET_ID);
    const sheet = doc.getSheets()[0]; // Assumes you want to save in the first tab

    // Prepare the row data based on the requested column order
    // Date, Time, Name, Mobile, Area, Address, Contact Detail, Plan Interest, Start Date, Delivery Time
    const newRow = [
      formattedDate,
      formattedTime,
      requestData.name || '',
      requestData.phone || '',
      requestData.area || '',
      requestData.address || '',
      requestData.phone || '', // Using phone as contact detail
      requestData.plan || '',
      requestData.startDate || '',
      requestData.deliveryTime || ''
    ];

    // Append the row to the sheet
    sheet.appendRow(newRow);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Lead Saved Successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error saving data: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS requests (Pre-flight CORS requests)
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## 3. Deploying the Apps Script
1. Save the project (click the floppy disk icon or press Ctrl/Cmd+S). Name the project if prompted.
2. In the top right corner, click the blue **Deploy** button and select **New deployment**.
3. In the "Select type" gear icon (⚙️) on the left, check **Web app**.
4. Set the details:
   * **Description**: "Enquiry Form V1"
   * **Execute as**: "Me"
   * **Who has access**: "Anyone" (This is crucial for the public frontend to submit data).
5. Click **Deploy**.
6. You will be prompted to authorize access. Click "Authorize access", choose your Google account, click "Advanced", and then "Go to [Project Name] (unsafe)". Click "Allow".
7. Copy the **Web app URL** generated.

## 4. Update the Frontend
The frontend has already been updated to use the target URL provided:
`https://script.google.com/macros/s/AKfycbwWMunTlrjiS2VJUuKj4TxPj7U9xH34NzkDZjRp6GceZH43Oc70yFBqVImaCLNp5Wuo7Q/exec`

*If you ever need to change it, it's located in `/src/components/ui/EnquiryModal.tsx` on line `34`.*

## 5. Security & Best Practices
*   **CORS**: Browsers send an `OPTIONS` request before a `POST` request to check if cross-origin requests are allowed. Apps Script handles this poorly with `application/json` sometimes. In our React code, we used `Content-Type: text/plain;charset=utf-8` with JSON `body`. This sends the data as a simple request, bypassing the preflight CORS check, making the Apps Script reliable.
*   **Rate Limiting**: If you receive too many spam requests, consider adding a basic Google ReCAPTCHA to your React frontend before calling the script.
