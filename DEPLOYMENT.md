# SiteSculpt - Deployment Guide

## 🚨 Important Note About Deployment

**The API uses Playwright (browser automation) which requires a full Node.js environment.** Cloudflare Workers don't support this. Here are your deployment options:

---

## ✅ Recommended: Split Deployment

### **Web App → Cloudflare Pages** (Free, Fast CDN)
### **API → Railway/Render/Vercel** (Need Node.js + Browser support)

---

## Option 1: Cloudflare Pages (Web) + Railway (API) - RECOMMENDED

### Step 1: Deploy API to Railway (Free tier available)

1. **Sign up at [Railway.app](https://railway.app/)**

2. **Create New Project → Deploy from GitHub**
   - Connect your GitHub account
   - Select `nandini-gv/SiteSculpt` repository
   - Railway will auto-detect the Node.js app

3. **Configure Railway:**
   - Root Directory: `apps/api`
   - Build Command: `npm install && npx playwright install chromium`
   - Start Command: `npm start`

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8787
   ```

5. **Get your Railway URL** (e.g., `https://sitesculpt-api-production.up.railway.app`)

### Step 2: Deploy Web App to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages**

2. **Create New Project → Connect to Git**
   - Select your GitHub repository: `nandini-gv/SiteSculpt`
   - Configure build:
     ```
     Framework preset: Vite
     Build command: npm run build
     Build output directory: apps/web/dist
     Root directory: apps/web
     ```

3. **Add Environment Variable:**
   ```
   VITE_API_URL=https://your-railway-api-url.railway.app
   ```
   ⚠️ Replace with your actual Railway API URL from Step 1

4. **Deploy!** Cloudflare will build and deploy your app

5. **Your site will be live at:**
   - `https://sitesculpt.pages.dev`
   - Or your custom domain

---

## Option 2: Full Deployment on Vercel (Easiest)

Vercel supports both web apps and APIs with serverless functions.

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Create `vercel.json` in project root:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "apps/web/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "apps/api/src/server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "apps/api/src/server.ts"
       },
       {
         "src": "/(.*)",
         "dest": "apps/web/dist/$1"
       }
     ]
   }
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## Option 3: Render (All-in-One)

1. **Sign up at [Render.com](https://render.com)**

2. **Deploy API as Web Service:**
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `apps/api`
   - Build Command: `npm install && npx playwright install chromium`
   - Start Command: `npm start`

3. **Deploy Web as Static Site:**
   - New → Static Site
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add env var: `VITE_API_URL=https://your-api-url.onrender.com`

---

## 📝 Pre-Deployment Checklist

- [ ] Update `VITE_API_URL` in `apps/web/.env.production`
- [ ] Test API locally with `npm run dev:api`
- [ ] Test Web locally with `npm run dev:web`
- [ ] Ensure all environment variables are set
- [ ] Test on your own WiFi (not corporate network with Zscaler)

---

## 🔧 Environment Variables Summary

### API (Backend):
```bash
NODE_ENV=production
PORT=8787
```

### Web (Frontend):
```bash
VITE_API_URL=https://your-api-domain.com
```

---

## 🚀 Quick Deploy Commands

### Push to GitHub:
```bash
git add .
git commit -m "Initial commit - SiteSculpt ready for deployment"
git branch -M main
git remote add origin https://github.com/nandini-gv/SiteSculpt.git
git push -u origin main
```

---

## ⚠️ Troubleshooting

### "Zscaler Error" on deployed site:
- This won't happen on your own WiFi/internet
- Only occurs on corporate networks with proxy
- Your deployed site will work fine for public users

### API not responding:
- Check if Playwright/Chromium is installed on your hosting platform
- Railway and Render support this out of the box
- Vercel needs custom configuration

### CORS errors:
- Make sure API URL is correct in `VITE_API_URL`
- API already has `cors()` enabled for all origins

---

## 💡 Best Choice for You

**Recommended:** Railway (API) + Cloudflare Pages (Web)

**Why:**
- ✅ Free tiers for both
- ✅ Railway handles Playwright perfectly
- ✅ Cloudflare Pages is super fast (CDN)
- ✅ Easy setup
- ✅ Good for portfolio/demo

**Cost:** $0/month for moderate usage

---

## 📞 Need Help?

- Railway: https://docs.railway.app
- Cloudflare Pages: https://developers.cloudflare.com/pages
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

Deploy the web app to Cloudflare Pages, and choose Railway/Render for the API!
