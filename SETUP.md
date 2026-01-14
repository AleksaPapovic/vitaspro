# Setup Guide - JSON File Storage

## How Product Storage Works

Your products are now stored in `public/products.json` instead of localStorage. This means:
- ✅ All users see the same products
- ✅ Products persist across browser sessions
- ✅ Products are part of your codebase

## Adding/Editing Products

### Option 1: Manual File Upload (Simple, No API needed)

1. Go to `/admin` page
2. Add or delete products
3. When you save, a `products.json` file will automatically download
4. Replace `public/products.json` in your project with the downloaded file
5. Commit and push to GitHub
6. Netlify will automatically redeploy with new products

### Option 2: JSONBin.io API (Real-time updates)

For automatic, real-time updates without manual file uploads:

1. **Sign up for JSONBin.io** (free):
   - Visit https://jsonbin.io/
   - Create a free account
   - Create a new "Bin"

2. **Get your credentials**:
   - Copy your Bin ID (from the bin URL)
   - Copy your API Key (from account settings)

3. **Set up environment variables**:
   - Create a `.env` file in the project root:
     ```
     VITE_JSONBIN_BIN_ID=your_bin_id_here
     VITE_JSONBIN_API_KEY=your_api_key_here
     ```
   - For Netlify: Go to Site settings → Environment variables and add the same variables

4. **Test it**:
   - Add a product in admin panel
   - It should save to JSONBin automatically
   - All users will see the update immediately!

## Initial Setup

1. The `public/products.json` file starts empty: `[]`
2. Add your first product via the admin panel
3. Download the JSON file and replace `public/products.json`
4. Commit and push to deploy

## Troubleshooting

**Products not showing?**
- Check browser console for errors
- Verify `public/products.json` exists and is valid JSON
- Make sure the file is committed to your repository

**Admin changes not saving?**
- Check browser console for errors
- If using JSONBin: Verify API keys are correct
- If not using JSONBin: Check that the JSON file downloaded successfully

**Images not loading?**
- Make sure Google Drive files are set to "Anyone with the link can view"
- Check the image URL in the product data

