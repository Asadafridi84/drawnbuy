# 🎨 DrawNBuy — The World's First Social Shopping Canvas

> *Draw it. Find it. Buy it.*

React + Vite + Socket.IO social shopping canvas. Users sketch wishlists, drag real products onto the canvas, and shop together in real time.

## Stack
Frontend: React 19 + Vite 8 + Zustand + React Router  
Backend: Express + Socket.IO + Node.js  
Deploy: Vercel (frontend) + Render (backend)

## Quick Start
```bash
npm install && cd server && npm install && cd ..
cp .env.example .env && cp server/.env.example server/.env
npm run dev          # frontend :5173
npm run dev:server   # backend  :3001
```

## Data lives in src/data/index.js
ADS · HERO_ADS · DEALS · DRAG_PRODUCTS · SPONSORS · CATS · COUNTRIES

## Deploy
- Frontend: `vercel --prod` (set VITE_SERVER_URL)
- Backend: Render → root dir `server` → `node index.js`

See README_FULL.md for full docs.
