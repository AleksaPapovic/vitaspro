# Google Drive Products Setup Guide

This guide explains how to store and load your products.json file from Google Drive.

## Setup Instructions

### Step 1: Upload products.json to Google Drive

1. **Create or export your products.json file**:
   - Go to `/admin` page
   - Add some products (or they'll be downloaded when you save)
   - A `products.json` file will be downloaded

2. **Upload to Google Drive**:
   - Go to [Google Drive](https://drive.google.com)
   - Upload the `products.json` file
   - Right-click on the file → "Get link" or "Share"
   - Set permission to **"Anyone with the link can view"**
   - Copy the share link

### Step 2: Configure in Admin Panel

1. Go to `/admin` page
2. Click **"Show Google Drive Settings"**
3. Paste your Google Drive share link in the field
4. Click **"Save Configuration"**
5. Products will now load from Google Drive!

### Step 3: Update Products

When you add or delete products:

1. The updated `products.json` file will be automatically downloaded
2. **Upload the new file to Google Drive** (replace the old one)
3. Make sure it's set to "Anyone with the link can view"
4. Products will update for all users immediately!

## Alternative: Environment Variable

You can also set the Google Drive file ID using an environment variable:

1. Create a `.env` file in your project root:
   ```
   VITE_GOOGLE_DRIVE_PRODUCTS_FILE_ID=your_file_id_here
   ```

2. Extract the file ID from your Google Drive URL:
   - URL: `https://drive.google.com/file/d/1-ZWT4D_5bxCT4Rr0FUeei_lZCVWyaDib/view`
   - File ID: `1-ZWT4D_5bxCT4Rr0FUeei_lZCVWyaDib`

3. For Netlify deployment:
   - Go to Site settings → Environment variables
   - Add `VITE_GOOGLE_DRIVE_PRODUCTS_FILE_ID` with your file ID
   - Redeploy your site

## Benefits

✅ **Centralized storage** - All users see the same products  
✅ **Easy updates** - Just replace the file in Google Drive  
✅ **No code deployment needed** - Update products without redeploying  
✅ **Free** - Uses your existing Google Drive storage  

## Troubleshooting

**Products not loading?**
- Make sure the file is set to "Anyone with the link can view"
- Check the file ID/URL is correct
- Verify the file is valid JSON format
- Check browser console for errors

**File not updating?**
- Clear browser cache
- Make sure you replaced the file in Google Drive (not just uploaded a new one)
- Verify the file sharing permissions

**CORS errors?**
- Google Drive files should work, but if you see CORS errors, try:
  - Using the file ID directly instead of the full URL
  - Making sure the file is publicly accessible

