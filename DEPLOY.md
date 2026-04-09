# DrawNBuy — Deployment Guide

## Prerequisites
- GitHub account + `gh` CLI installed and authenticated
- Node.js 18+ on your machine
- Accounts needed: Vercel, Render, Namecheap, (optional) Supabase

---

## Step 1 — Push to GitHub

```bash
cd drawnbuy
bash setup-github.sh
```

This creates the `drawnbuy` repo, pushes all code, sets up labels, creates a milestone,
and opens 5 starter issues.

---

## Step 2 — Register drawnbuy.com on Namecheap

1. Go to **namecheap.com** → search `drawnbuy.com` → purchase
2. In Namecheap dashboard → **Domain List** → `drawnbuy.com` → **Manage**
3. Under **Nameservers**, select **Custom DNS** and enter Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. Save. DNS propagation takes 10 min–48 hours.

---

## Step 3 — Deploy Frontend to Vercel

```bash
npm install -g vercel
cd drawnbuy        # the project root (not /server)
vercel --prod
```

When prompted:
- Project name: `drawnbuy`
- Framework: Vite
- Root directory: `.`  (the default)

**After deploy**, go to **Vercel Dashboard → Project → Settings → Domains**:
- Add `drawnbuy.com` and `www.drawnbuy.com`
- Vercel auto-provisions HTTPS

**Set environment variables** in Vercel Dashboard → Settings → Environment Variables:
```
VITE_SERVER_URL = https://drawnbuy-server.onrender.com   (fill in after Render step)
```

---

## Step 4 — Deploy Backend to Render

1. Go to **render.com** → New → Web Service
2. Connect your GitHub repo: `drawnbuy`
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free (upgrade to Starter $7/mo for production)

4. Add **Environment Variables** in Render dashboard:
   ```
   NODE_ENV          = production
   PORT              = 3001
   CLIENT_ORIGIN     = https://drawnbuy.com
   JWT_SECRET        = <generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
   BCRYPT_ROUNDS     = 12
   GEMINI_API_KEY    = <your key>
   ADMIN_KEY         = <random secret>
   ```

5. Click **Deploy** → wait ~2 min for first deploy
6. Copy your Render URL (e.g. `https://drawnbuy-server.onrender.com`)
7. Go back to Vercel → update `VITE_SERVER_URL` to your Render URL
8. Trigger a Vercel redeploy

---

## Step 5 — (Optional) Activate Supabase DB

The default JSON file DB works fine for early traction. When you're ready:

1. Create project at **supabase.com** (free tier: 500MB, 50K MAU)
2. Go to SQL Editor → run the contents of `server/db/schema.sql`
3. Copy **Project URL** and **service_role** key from Settings → API
4. Add to Render environment:
   ```
   SUPABASE_URL        = https://your-project.supabase.co
   SUPABASE_SERVICE_KEY = your-service-role-key
   ```
5. On your machine:
   ```bash
   cd server/db
   cp supabase.js index.js    # replaces the JSON adapter
   git add server/db/index.js
   git commit -m "Switch to Supabase DB"
   git push
   ```
Render auto-deploys. Zero downtime — the API is identical.

---

## Step 6 — Amazon Associates

1. Sign up at **affiliate-program.amazon.com** (use Swedish Amazon: affiliate-program.amazon.se)
2. Get your **Tracking ID** (looks like `drawnbuy-20`)
3. Inject into all Amazon URLs in the codebase:
   ```bash
   node scripts/inject-affiliate-tags.js --tag drawnbuy-20
   npm run build
   git add src/data/index.js
   git commit -m "Add Amazon Associates tracking tag"
   git push
   ```

---

## Step 7 — Vercel GitHub Auto-deploy

After the initial deploy, every `git push` to `main` auto-deploys the frontend.
For the backend, Render also auto-deploys on push if you connected via GitHub.

---

## Useful URLs after deployment

| Service | URL |
|---|---|
| Frontend | https://drawnbuy.com |
| Backend health | https://drawnbuy-server.onrender.com/api/health |
| Vercel dashboard | https://vercel.com/dashboard |
| Render dashboard | https://dashboard.render.com |
| Supabase (when active) | https://supabase.com/dashboard |

---

## Quick local dev after setup

```bash
# Terminal 1
npm run dev           # frontend :5173

# Terminal 2  
npm run dev:server    # backend  :3001
```

---

## Troubleshooting

**CORS error in production**: Make sure `CLIENT_ORIGIN` on Render exactly matches your Vercel domain (no trailing slash).

**Render free tier sleeps after 15 min**: Upgrade to Starter ($7/mo) or add a cron job to ping `/api/health` every 10 min.

**Socket.IO not connecting**: Verify Render allows WebSocket connections (it does by default). Check that `VITE_SERVER_URL` uses `https://` not `http://`.
