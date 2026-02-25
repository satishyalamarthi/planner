# Quick Fix for Notion CORS Error

## The Problem
The error you're seeing:
```
Access to fetch at 'https://api.allorigins.win/...' has been blocked by CORS policy: 
Request header field notion-version is not allowed
```

**Root cause**: Notion API requires custom headers (`Notion-Version`, `Authorization`) that public CORS proxies like `api.allorigins.win` and `corsproxy.io` don't support.

## The Solution: Deploy a Cloudflare Worker (5 minutes, FREE)

### Step 1: Create Cloudflare Worker
1. Go to https://workers.cloudflare.com/
2. Sign up with email (free - 100,000 requests/day)
3. Click **"Create a Service"** or **"Create a Worker"**
4. Give it a name (e.g., `notion-proxy`)

### Step 2: Deploy the Code
1. Click **"Quick Edit"** on your new worker
2. Delete all the default code
3. Copy all code from `notion-proxy-worker.js`
4. Paste it into the worker editor
5. Click **"Save and Deploy"**

### Step 3: Copy Your Worker URL
- Your URL will be: `https://notion-proxy.YOUR-USERNAME.workers.dev`
- Copy this URL

### Step 4: Update Planner Settings
1. Open `keerthi-planner.html`
2. Click **🎯 Notion** button
3. In **CORS Proxy URL**, paste your worker URL: `https://notion-proxy.YOUR-USERNAME.workers.dev`
4. Make sure your API Key and Database ID are still there
5. Click **💾 Save & Load**

### Step 5: Test
- Click **🔄 Load from Notion**
- Should now work! ✅

## Why This Works
- Your Cloudflare Worker is YOUR server (free tier)
- It forwards requests with all necessary headers
- Browsers allow requests to your own server
- No third-party restrictions

## Code Changes Made
The HTML file now supports three proxy modes:
1. **Cloudflare Worker** (Recommended) - detects `.workers.dev` in URL
2. **Direct connection** - use `direct` as proxy (rarely works)
3. **Standard proxy** - legacy support (doesn't work with Notion)

## Alternative: Browser Extension
If you can't deploy a worker:
- Install a CORS browser extension (Chrome/Edge/Firefox)
- Use `direct` as proxy URL
- ⚠️ Less secure, not recommended for production
