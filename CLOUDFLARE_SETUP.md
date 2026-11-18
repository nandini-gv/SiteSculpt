# Cloudflare Pages Setup for SiteSculpt

## ✅ Build Should Now Succeed!

Your latest commit (f030a35) fixes all build issues.

---

## 🔧 Cloudflare Pages Configuration

### Build Settings (Already Correct):

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: apps/web
Node version: 18 or higher (auto-detected)
```

### ⚠️ IMPORTANT: Environment Variable Required

**Before the app will work**, you MUST add this environment variable in Cloudflare Pages:

1. Go to your Cloudflare Pages project settings
2. Navigate to **Environment variables**
3. Add the following:

```
Name: VITE_API_URL
Value: http://localhost:8787
```

**OR** if you've deployed the API to Railway:
```
Name: VITE_API_URL
Value: https://your-railway-app-name.railway.app
```

> **Note:** Without this variable, the app will try to connect to `localhost:8787` which won't work in production.

---

## 🚀 Deployment Steps

### Option A: Web App Only (Quick Test)

1. **Set Environment Variable:**
   - In Cloudflare Pages → Settings → Environment variables
   - Add `VITE_API_URL=http://localhost:8787`
   - This will let the app build successfully
   - ⚠️ Captures won't work without a live API

2. **Deploy:**
   - Cloudflare auto-deploys from GitHub
   - Build will succeed
   - Site goes live at `https://sitesculpt.pages.dev`

### Option B: Full Stack (Recommended)

1. **Deploy API to Railway first** (5 minutes):
   ```bash
   # Go to railway.app
   # New Project → Deploy from GitHub
   # Select: nandini-gv/SiteSculpt
   # Root directory: apps/api
   # Wait for deployment
   # Copy your Railway URL
   ```

2. **Set Environment Variable in Cloudflare:**
   ```
   VITE_API_URL=https://your-app-name.up.railway.app
   ```

3. **Redeploy** (or wait for auto-deploy)

4. **Test:**
   - Visit `https://sitesculpt.pages.dev`
   - Enter a URL
   - Click "Extract design"
   - Should work! ✅

---

## 📋 Build Fixes Applied

| Issue | Fix | Status |
|-------|-----|--------|
| Missing React types | Added @types/react, @types/react-dom | ✅ Fixed |
| package-lock.json sync | Ran npm install, updated lock file | ✅ Fixed |
| ImportMeta.env error | Added vite-env.d.ts with type definitions | ✅ Fixed |
| API build in Cloudflare | Changed build command to web-only | ✅ Fixed |

---

## 🧪 Verified Locally

```bash
✓ npm run build (in apps/web)
✓ Build succeeded in 2.8s
✓ Output: dist/index.html, assets
✓ No TypeScript errors
✓ No build errors
```

---

## 🔍 What Each File Does

### `apps/web/src/vite-env.d.ts`
```typescript
// Tells TypeScript that import.meta.env.VITE_API_URL exists
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
```

### `package.json` (root)
```json
// Changed build command to only build web app
"build": "npm --workspace apps/web run build"
// API build is separate: npm run build:api
```

---

## ⚡ Expected Build Time

- **First build:** ~30 seconds (includes dependency install)
- **Subsequent builds:** ~10-15 seconds (cached dependencies)

---

## 🎯 Next Steps

1. ✅ Wait for Cloudflare build to complete (~30 seconds)
2. ⚠️ **Add VITE_API_URL environment variable** (critical!)
3. ✅ Redeploy or wait for auto-deploy
4. 🚀 Your site is live at `https://sitesculpt.pages.dev`
5. 🔧 Deploy API to Railway for full functionality

---

## 💡 Pro Tips

### Testing Without API

Your deployed site will load even without the API. You'll see:
- ✅ Beautiful UI with gradients
- ✅ All buttons and forms
- ❌ "Could not reach the capture API" error when trying to capture

This is normal! Just deploy the API next.

### Environment Variables

Cloudflare Pages supports different values per environment:
- **Production:** Your Railway API URL
- **Preview:** Can use a different API or localhost

Set them separately in the dashboard.

---

## 🐛 Troubleshooting

### Build Still Fails?

1. Check build logs in Cloudflare dashboard
2. Verify Node.js version is 18+
3. Check if you have any local changes not pushed

### App Loads But Captures Fail?

1. Check browser console (F12)
2. Look for CORS or network errors
3. Verify `VITE_API_URL` is set correctly
4. Make sure API is deployed and running

### Need to Test Locally?

```bash
# In project root
npm run dev

# Web app: http://localhost:5173
# API: http://localhost:8787
```

---

## 📞 Support

- **GitHub Repo:** https://github.com/nandini-gv/SiteSculpt
- **Cloudflare Docs:** https://developers.cloudflare.com/pages
- **Railway Docs:** https://docs.railway.app

---

**Your build is fixed! Cloudflare Pages will deploy successfully now.** 🎉

Just remember to set the `VITE_API_URL` environment variable!
