# Netlify Deployment Guide

This guide will help you deploy your Vitas Pro site to Netlify.

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `vitaspro`)
   - Don't initialize with README (you already have one)

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/vitaspro.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect to Netlify

1. **Sign up/Login to Netlify**:
   - Go to https://app.netlify.com
   - Sign up or log in (you can use GitHub to sign in)

2. **Add New Site**:
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your `vitaspro` repository

3. **Configure Build Settings**:
   Netlify should auto-detect these settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or latest)

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your site automatically!

### Step 3: Configure Environment Variables (Optional)

If you're using JSONBin.io API:

1. Go to **Site settings** → **Environment variables**
2. Click "Add variable"
3. Add:
   - `VITE_JSONBIN_BIN_ID` = your bin ID
   - `VITE_JSONBIN_API_KEY` = your API key
4. Click "Save"
5. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Deploy

```bash
# Build your site first
npm run build

# Deploy to Netlify
netlify deploy --prod
```

Follow the prompts to:
- Link to existing site or create new site
- Confirm build settings

## Method 3: Drag & Drop (Quick Test)

1. **Build your site**:
   ```bash
   npm run build
   ```

2. **Go to Netlify**:
   - Visit https://app.netlify.com/drop
   - Drag and drop the `dist` folder
   - Your site will be live instantly!

   ⚠️ **Note**: This method doesn't auto-update. Use Method 1 for production.

## Build Configuration

Your `netlify.toml` is already configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures:
- ✅ React Router works correctly (all routes redirect to index.html)
- ✅ Correct Node.js version is used
- ✅ Build output goes to `dist` folder

## Updating Products After Deployment

### If using JSONBin.io:
- Products update automatically in real-time!

### If using manual JSON file:
1. Go to `/admin` on your live site
2. Add/edit products
3. Download the `products.json` file
4. Replace `public/products.json` in your repository
5. Commit and push:
   ```bash
   git add public/products.json
   git commit -m "Update products"
   git push
   ```
6. Netlify will automatically redeploy!

## Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Netlify will handle SSL certificates automatically!

## Troubleshooting

### Build Fails?

1. **Check build logs** in Netlify dashboard
2. **Common issues**:
   - Missing dependencies: Make sure `package.json` has all dependencies
   - Node version: Ensure Node 18+ is used
   - Build errors: Check console for specific errors

### Products Not Showing?

1. **Check `public/products.json`**:
   - Make sure it's committed to your repository
   - Verify it's valid JSON format
   - Check file path is correct

2. **Check browser console**:
   - Open DevTools (F12)
   - Look for errors loading `/products.json`

### Images Not Loading?

1. **Verify Google Drive sharing**:
   - Files must be set to "Anyone with the link can view"
   - Test the image URL directly in browser

2. **Check CORS errors**:
   - Google Drive images should work, but check console for errors

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify site created and connected
- [ ] Build settings verified (auto-detected from netlify.toml)
- [ ] Environment variables set (if using JSONBin)
- [ ] Initial deploy successful
- [ ] Test admin page at `yoursite.netlify.app/admin`
- [ ] Test adding a product
- [ ] Verify products show on home page

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify all files are committed to repository
4. Ensure `netlify.toml` is in the root directory

Your site should now be live! 🎉

