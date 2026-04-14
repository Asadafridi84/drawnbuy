import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter    from './routes/auth.js';
import canvasRouter  from './routes/canvases.js';
import iconsRouter   from './routes/icons.js';
import { generateSponsorIcons } from './services/geminiIcons.js';

dotenv.config();

const app        = express();
const httpServer = createServer(app);
const PORT          = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'"],
      imgSrc:         ["'self'", "data:", "blob:"],
      connectSrc:     ["'self'", CLIENT_ORIGIN, 'https://drawnbuy.vercel.app'],
      fontSrc:        ["'self'"],
      objectSrc:      ["'none'"],
      mediaSrc:       ["'none'"],
      frameSrc:       ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: true,
  xDnsPrefetchControl: { allow: false },
}));

// Additional headers not covered by helmet
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

app.use(cors({ origin: [CLIENT_ORIGIN, 'https://drawnbuy.vercel.app'], credentials: true }));
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use('/api/', rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// ── REST Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter);
app.use('/api/canvases', canvasRouter);
app.use('/api/icons',    iconsRouter);
app.get('/api/health', (_, res) => res.json({ status: 'ok', rooms: rooms.size, uptime: Math.floor(process.uptime()) }));

// ── Socket.IO ──────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: [CLIENT_ORIGIN, 'https://drawnbuy.vercel.app'], credentials: true },
  maxHttpBufferSize: 1e6,
});

const rooms = new Map();

function getRoom(id) {
  if (!rooms.has(id)) rooms.set(id, { users: new Map(), canvas: [], messages: [] });
  return rooms.get(id);
}
function sanitize(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>&"'/]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#x27;','/':'&#x2F;'}[c])).slice(0,500);
}
function randColor() {
  return ['#7c3aed','#f43f5e','#10b981','#3b82f6','#f59e0b','#06b6d4','#8b5cf6'][Math.floor(Math.random()*7)];
}

io.on('connection', (socket) => {
  let room = null, user = null;

  socket.on('join-room', ({ roomId, username }) => {
    if (!roomId) return;
    room = String(roomId).slice(0,12).toUpperCase();
    user = { id: socket.id, name: sanitize(username || 'Guest'), color: randColor() };
    socket.join(room);
    const r = getRoom(room);
    r.users.set(socket.id, user);
    socket.emit('canvas-state', r.canvas);
    socket.emit('chat-history', r.messages.slice(-50));
    socket.to(room).emit('user-joined', user);
    io.to(room).emit('participants', [...r.users.values()]);
  });

  socket.on('draw', (d) => {
    if (!room) return;
    const clamp = (v, min, max) => Math.min(Math.max(+v || 0, min), max);
    const e = { type:'draw', userId:socket.id,
      x1:clamp(d.x1,-10000,10000), y1:clamp(d.y1,-10000,10000),
      x2:clamp(d.x2,-10000,10000), y2:clamp(d.y2,-10000,10000),
      color: sanitize(d.color||'#000'), width: Math.min(Math.max(+d.width||2,1),64) };
    const r = getRoom(room);
    r.canvas.push(e);
    if (r.canvas.length > 10000) r.canvas = r.canvas.slice(-5000);
    socket.to(room).emit('draw', e);
  });

  socket.on('clear-canvas', () => {
    if (!room) return;
    getRoom(room).canvas = [];
    io.to(room).emit('canvas-cleared');
  });

  socket.on('chat-message', ({ text }) => {
    if (!room || !user) return;
    const msg = { id:Date.now(), text:sanitize(text), sender:user.name, senderId:socket.id, time:new Date().toISOString() };
    getRoom(room).messages.push(msg);
    io.to(room).emit('chat-message', msg);
  });

  socket.on('emoji-reaction', ({ emoji }) => {
    if (!room) return;
    io.to(room).emit('emoji-reaction', { emoji: sanitize(emoji), sender: user?.name });
  });

  socket.on('product-dropped', (d) => {
    if (!room) return;
    socket.to(room).emit('product-dropped', {
      productId: sanitize(String(d.productId||'')), name: sanitize(String(d.name||'')),
      emoji: sanitize(String(d.emoji||'')), x:+d.x||0, y:+d.y||0, droppedBy: user?.name,
    });
  });

  socket.on('disconnect', () => {
    if (!room || !user) return;
    const r = getRoom(room);
    r.users.delete(socket.id);
    io.to(room).emit('user-left', user);
    io.to(room).emit('participants', [...r.users.values()]);
    if (r.users.size === 0) setTimeout(() => { if (rooms.get(room)?.users.size===0) rooms.delete(room); }, 300_000);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 DrawNBuy :${PORT}  ← ${CLIENT_ORIGIN}`);
  // Generate sponsor icons on first boot (cached after that)
  generateSponsorIcons().catch(e => console.warn('[gemini] startup:', e.message));
});
