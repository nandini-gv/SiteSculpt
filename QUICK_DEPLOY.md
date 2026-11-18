# 🚀 Quick Deploy Guide for SiteSculpt

## ✅ Code Successfully Pushed to GitHub!

Your repository: **https://github.com/nandini-gv/SiteSculpt**

---

## 🎯 Next Steps - Deploy to Production

### Option A: Railway (API) + Cloudflare Pages (Web) - RECOMMENDED ⭐

This is the easiest and FREE option!

#### Step 1: Deploy API to Railway (~5 minutes)

1. **Go to [Railway.app](https://railway.app/)**
   - Sign up with GitHub (free)

2. **Click "New Project"**
   - Select "Deploy from GitHub repo"
   - Choose `nandini-gv/SiteSculpt`

3. **Configure the deployment:**
   ```
   Root Directory: apps/api
   Start Command: npm start
   ```

4. **Railway will auto-detect and install:**
   - Node.js
   - Playwright
   - Chromium browser

5. **Copy your Railway URL** (e.g., `https://sitesculpt-production.up.railway.app`)
   - Railway provides it after deployment
   - Save this for Step 2!

#### Step 2: Deploy Web App to Cloudflare Pages (~3 minutes)

1. **Login to [Cloudflare Dashboard](https://dash.cloudflare.com)**

2. **Go to "Pages" → "Create a project"**

3. **Connect to Git:**
   - Select GitHub
   - Choose `nandini-gv/SiteSculpt`

4. **Configure build settings:**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: apps/web
   ```

5. **Add Environment Variable:**
   ```
   Name: VITE_API_URL
   Value: https://your-railway-url.railway.app
   ```
   ⚠️ **IMPORTANT:** Replace with your actual Railway URL from Step 1!

6. **Click "Save and Deploy"**

7. **Your site will be live at:**
   - `https://sitesculpt.pages.dev`
   - Or add custom domain in Cloudflare settings

---

## 🎉 You're Done! Test Your Deployed App

### 1. Visit Your Site
Go to: `https://sitesculpt.pages.dev`

### 2. Test It Out
- ✅ Use your **own WiFi** (not corporate network)
- ✅ Try a public website like: `https://example.com`
- ✅ Extract design
- ✅ Download HTML+CSS export
- ✅ It should work perfectly!

---

## ⚠️ Important Notes

### About Zscaler/Corporate Networks

**Question:** "Will it work on my own WiFi?"  
**Answer:** **YES! 100%** ✅

The Zscaler error ONLY happens on:
- Corporate networks with authentication proxies
- Networks requiring VPN

Your deployed site works for:
- ✅ Your personal WiFi
- ✅ Home internet
- ✅ Mobile hotspot
- ✅ Public WiFi
- ✅ All regular users on the internet

---

## 💰 Cost Breakdown

**Total Monthly Cost: $0 (FREE!)**

| Service | Cost | What You Get |
|---------|------|--------------|
| **Railway** | Free tier | 500 hours/month, enough for demo/portfolio |
| **Cloudflare Pages** | Free forever | Unlimited bandwidth, auto SSL |
| **GitHub** | Free | Unlimited public repos |

**Upgrade if needed:**
- Railway Pro: $5/month (unlimited usage)
- Cloudflare Pro: $20/month (advanced features)

---

## 🔧 Troubleshooting

### "Build failed" on Railway
```bash
# Railway might need build script in package.json
# It's already there, but check apps/api/package.json:
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

### "Build failed" on Cloudflare Pages
- Make sure `Root directory` is set to `apps/web`
- Make sure `VITE_API_URL` environment variable is set correctly

### CORS Errors
- Check that `VITE_API_URL` doesn't have trailing slash
- Verify API URL is accessible
- API already has CORS enabled for all origins

---

## 📱 Share Your Project!

Once deployed, share your link:
- LinkedIn
- Twitter
- Portfolio
- Resume

**Add to README badge:**
```markdown
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://sitesculpt.pages.dev)
```

---

## 🎓 Alternative Deployment Options

### Option B: Everything on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option C: Render (All-in-One)
1. Create Web Service for API
2. Create Static Site for Web
3. Link them with environment variables

See full guide in [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ✨ What's Next?

- [ ] Test on your own WiFi
- [ ] Add custom domain to Cloudflare
- [ ] Share your project link
- [ ] Add to portfolio
- [ ] Star the repo on GitHub! ⭐

---

## 🤝 Need Help?

- **GitHub Issues:** [Report a bug](https://github.com/nandini-gv/SiteSculpt/issues)
- **Railway Docs:** https://docs.railway.app
- **Cloudflare Docs:** https://developers.cloudflare.com/pages

---

**Congratulations! Your SiteSculpt is now live! 🎉**

Made with ❤️ by [Nandini GV](https://github.com/nandini-gv)
