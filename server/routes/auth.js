import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import { Users } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const JWT_SECRET    = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[SECURITY] FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Dedicated stricter rate limiter for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function issueToken(id) { return jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: '7d' }); }

// Account lockout — track failed login attempts per email
const loginAttempts = new Map();
const LOCKOUT_MAX  = 5;
const LOCKOUT_MS   = 15 * 60 * 1000; // 15 minutes

function checkLockout(email) {
  const key   = email.toLowerCase();
  const entry = loginAttempts.get(key);
  if (!entry) return;
  if (Date.now() < entry.lockedUntil) {
    const wait = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    throw Object.assign(new Error(`Account locked. Try again in ${wait} minute(s).`), { status: 429 });
  }
}
function recordFailure(email) {
  const key   = email.toLowerCase();
  const entry = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= LOCKOUT_MAX) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
    entry.count = 0;
  }
  loginAttempts.set(key, entry);
}
function clearLockout(email) {
  loginAttempts.delete(email.toLowerCase());
}

// POST /api/auth/register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email = '', password = '', name = '' } = req.body;
    if (!email || !password || !name)   return res.status(400).json({ error: 'Email, password and name are required.' });
    if (!validEmail(email))             return res.status(400).json({ error: 'Invalid email address.' });
    if (password.length < 8)            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (Users.findByEmail(email))       return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = Users.create({ id: randomUUID(), email, name: String(name).slice(0,80).trim(), passwordHash });
    const token = issueToken(user.id);

    console.log(`[auth] register: ${email}`);
    // Return token in cookie only — do NOT expose in response body
    res.cookie('token', token, COOKIE_OPTS).status(201).json({ user: Users.toPublic(user) });
  } catch (err) {
    console.error('[auth] register:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    checkLockout(email);

    const user = Users.findByEmail(email);
    const hash = user?.passwordHash ?? '$2b$12$invalidhashtopreventtiming000000000000000000000000000';
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) {
      recordFailure(email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    clearLockout(email);
    const token = issueToken(user.id);
    console.log(`[auth] login: ${email}`);
    // Return token in cookie only — do NOT expose in response body
    res.cookie('token', token, COOKIE_OPTS).json({ user: Users.toPublic(user) });
  } catch (err) {
    if (err.status === 429) return res.status(429).json({ error: err.message });
    console.error('[auth] login:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = Users.findById(req.userId);
  if (!user) return res.status(401).json({ error: 'User not found.' });
  res.json(Users.toPublic(user));
});

// PATCH /api/auth/profile  (update name, bio)
router.patch('/profile', requireAuth, (req, res) => {
  const { name, bio } = req.body;
  const updated = Users.update(req.userId, { name, bio });
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json(Users.toPublic(updated));
});

// DELETE /api/auth/me  — GDPR right to erasure
router.delete('/me', requireAuth, (req, res) => {
  const deleted = Users.delete(req.userId);
  if (!deleted) return res.status(404).json({ error: 'User not found.' });
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' }).json({ deleted: true });
});

// POST /api/auth/logout
router.post('/logout', (_, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' }).json({ message: 'Logged out.' });
});

export default router;
