# Vitas Pro - Cosmetics E-Commerce Site

A beautiful React application for showcasing and selling cosmetics products. Built with React, Vite, and React Router.

## Features

- 🎨 Beautiful, modern UI design
- 📱 Fully responsive layout
- 🛍️ Product showcase with image gallery
- 🔐 Hidden admin page for product management
- ☁️ Google Drive image integration
- 📄 JSON file-based product storage (shared across all users)
- 🔄 Automatic product sync

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Product Storage

Products are stored in `public/products.json` and are shared across all users. When you add or edit products in the admin panel:

1. **Without JSONBin API (Default)**: A `products.json` file will be automatically downloaded. You need to:
   - Replace the `public/products.json` file with the downloaded file
   - Commit and push to your repository
   - Netlify will automatically redeploy with the new products

2. **With JSONBin API (Optional)**: For real-time updates without manual file uploads:
   - Sign up for a free account at [JSONBin.io](https://jsonbin.io/)
   - Create a new bin
   - Copy your Bin ID and API Key
   - Create a `.env` file with:
     ```
     VITE_JSONBIN_BIN_ID=your_bin_id
     VITE_JSONBIN_API_KEY=your_api_key
     ```
   - Products will update in real-time for all users!

## Usage

### Viewing Products

Visit the home page to see all available products. Products are loaded from `public/products.json`.

### Admin Page

Access the admin page at `/admin` to:
- Add new products
- View all products
- Delete products

When you add/delete products:
- If JSONBin is configured: Changes sync immediately
- If not: A JSON file downloads - upload it to replace `public/products.json`

### Google Drive Image Setup

1. Upload your product images to Google Drive
2. Right-click on the image file
3. Select "Get link" or "Share"
4. Set the sharing permission to "Anyone with the link can view"
5. Copy the share link
6. Paste it in the admin form's "Google Drive Image URL" field

The app will automatically convert Google Drive share links to direct image URLs.

## Deployment to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Your site will be live!

### Updating Products on Netlify

**Method 1: Manual File Upload (Recommended for beginners)**
1. Add/edit products in admin panel
2. Download the `products.json` file when prompted
3. Replace `public/products.json` in your repository
4. Commit and push - Netlify auto-deploys

**Method 2: JSONBin API (Recommended for real-time updates)**
1. Set up JSONBin API (see Product Storage section)
2. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add `VITE_JSONBIN_BIN_ID` and `VITE_JSONBIN_API_KEY`
3. Products update in real-time!

## Project Structure

```
src/
  ├── pages/
  │   ├── Home.jsx       # Main product showcase page
  │   └── Admin.jsx      # Admin page for product management
  ├── utils/
  │   ├── storage.js      # Product storage utilities (JSON file + API)
  │   └── imageHelper.js # Google Drive image URL converter
  ├── App.jsx            # Main app component with routing
  └── main.jsx           # Entry point
public/
  └── products.json      # Product data (shared across all users)
```

## Technologies Used

- React 19
- React Router DOM
- Vite
- CSS3 (Custom styling)
- JSONBin.io (Optional, for real-time updates)
