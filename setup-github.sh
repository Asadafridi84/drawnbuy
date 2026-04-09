#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# DrawNBuy — GitHub repo setup script
# Run from inside the drawnbuy/ project folder
# Requirements: gh CLI authenticated, git configured
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "🎨 Setting up DrawNBuy GitHub repository..."

# 1. Init git
git init
git add .
git commit -m "🚀 Initial commit: DrawNBuy React app scaffold

- React 19 + Vite 8 frontend
- All 16 sections: Topbar, Navbar, AdStrip, Hero, CategoryBar,
  CollabCanvas (drawing + chat), DragStrip, DealsGrid,
  CategoriesGrid, Sponsors, HowItWorks, Footer, ShareModal
- Zustand stores: UI, Geo, Canvas, Cart
- Socket.IO hook (useSocket.js)
- Express + Socket.IO backend (server/)
- Security: sanitizeInput, validateAffiliateUrl, rate limiting
- Vercel (frontend) + Render (backend) deploy configs
- All data arrays in src/data/index.js (easy to edit)
- Zero build errors ✅"

# 2. Create GitHub repo
gh repo create drawnbuy \
  --public \
  --description "The World's First Social Shopping Canvas — Draw it. Find it. Buy it." \
  --source . \
  --push

echo ""
echo "✅ Repo created and pushed!"
echo ""

# 3. Set up labels
echo "Setting up issue labels..."
gh label create "phase-2a: components" --color "7c3aed" --description "React component work" 2>/dev/null || true
gh label create "phase-2b: socket.io" --color "67e8f9" --description "Real-time sync" 2>/dev/null || true
gh label create "phase-2c: auth" --color "fbbf24" --description "Auth & user accounts" 2>/dev/null || true
gh label create "phase-3: mobile" --color "10b981" --description "React Native app" 2>/dev/null || true
gh label create "bug" --color "f43f5e" --description "Bug report" 2>/dev/null || true
gh label create "security" --color "dc2626" --description "Security issue" 2>/dev/null || true
gh label create "data" --color "6366f1" --description "Data/content update" 2>/dev/null || true

# 4. Create milestone
echo "Creating Phase 2 milestone..."
gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="Phase 2: React Web App" \
  --field description="Complete React migration from HTML prototype" \
  --field due_on="2025-06-01T00:00:00Z" 2>/dev/null || true

# 5. Create initial issues
echo "Creating issues..."

gh issue create \
  --title "Wire up Socket.IO live drawing sync" \
  --label "phase-2b: socket.io" \
  --body "Connect useSocket.js hook to CollabCanvas so draw events sync across clients in real time.

- [ ] Connect on room join
- [ ] Emit draw events from canvas onMouseMove
- [ ] Receive and replay remote draw events
- [ ] Sync canvas-cleared event
- [ ] Sync product-dropped event" 2>/dev/null || true

gh issue create \
  --title "Implement login/signup with JWT" \
  --label "phase-2c: auth" \
  --body "Add real authentication.

- [ ] POST /api/auth/register (bcrypt hash)
- [ ] POST /api/auth/login (JWT issue)
- [ ] Auth middleware for protected routes
- [ ] Frontend login/signup pages
- [ ] Persist JWT in httpOnly cookie" 2>/dev/null || true

gh issue create \
  --title "Register domain on Namecheap + wire Vercel" \
  --label "phase-2a: components" \
  --body "- [ ] Register drawnbuy.com on Namecheap
- [ ] Add domain to Vercel project
- [ ] Set CNAME records
- [ ] Enable HTTPS (auto via Vercel)" 2>/dev/null || true

gh issue create \
  --title "Inject geo-detection (ipapi.co) in Topbar" \
  --label "phase-2a: components" \
  --body "The useGeoStore.detectCountry() function is wired but needs testing.

- [ ] Test ipapi.co call in dev
- [ ] Verify country fallback to SE works
- [ ] Test with VPN in 5 different countries" 2>/dev/null || true

gh issue create \
  --title "Amazon Associates signup + update affiliate links" \
  --label "data" \
  --body "- [ ] Sign up at affiliate-program.amazon.com
- [ ] Get tracking ID
- [ ] Update all Amazon URLs in src/data/index.js with tag parameter
- [ ] Test validateAffiliateUrl still passes" 2>/dev/null || true

echo ""
echo "🎉 DrawNBuy GitHub setup complete!"
echo ""
echo "Next steps:"
echo "  1. cd drawnbuy && npm install && cd server && npm install"
echo "  2. cp .env.example .env && cp server/.env.example server/.env"  
echo "  3. Edit server/.env — set JWT_SECRET"
echo "  4. npm run dev (terminal 1) + npm run dev:server (terminal 2)"
echo "  5. Deploy: vercel --prod (frontend) + Render dashboard (backend)"
echo ""
gh repo view --web 2>/dev/null || echo "View repo: https://github.com/$(gh api user --jq .login)/drawnbuy"

gh issue create \
  --title "Activate Supabase DB (replace JSON adapter)" \
  --label "phase-2a: components" \
  --body "When ready to scale beyond the JSON file DB:

- [ ] Create Supabase project at supabase.com
- [ ] Run server/db/schema.sql in Supabase SQL editor
- [ ] Add SUPABASE_URL + SUPABASE_SERVICE_KEY to Render env
- [ ] cp server/db/supabase.js server/db/index.js
- [ ] git commit + push (Render auto-deploys)" 2>/dev/null || true

gh issue create \
  --title "Canvas thumbnail auto-save" \
  --label "phase-2a: components" \
  --body "Wire useCanvasThumbnail hook into CollabCanvas:

- [ ] Import useCanvasThumbnail in CollabCanvas
- [ ] Call startAutoSave(canvasId) when a saved canvas is open
- [ ] Display thumbnail in My Canvases grid
- [ ] Save thumbnail on canvas close / room leave" 2>/dev/null || true

echo "✅ Additional issues created."
