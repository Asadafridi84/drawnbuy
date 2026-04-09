import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Users } from '../db/index.js';

const router = Router();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const JWT_SECRET    = process.env.JWT_SECRET || 'change-me-in-production-min-32-chars!!';
const COOKIE_OPTS   = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function genId()     { return Math.random().toString(36).substring(2, 18); }
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function issueToken(id) { return jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: '7d' }); }

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email = '', password = '', name = '' } = req.body;
    if (!email || !password || !name)   return res.status(400).json({ error: 'Email, password and name are required.' });
    if (!validEmail(email))             return res.status(400).json({ error: 'Invalid email address.' });
    if (password.length < 8)            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (Users.findByEmail(email))       return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = Users.create({ id: genId(), email, name: String(name).slice(0,80).trim(), passwordHash });
    const token = issueToken(user.id);

    console.log(`[auth] register: ${email}`);
    res.cookie('token', token, COOKIE_OPTS).status(201).json({ user: Users.toPublic(user), token });
  } catch (err) {
    console.error('[auth] register:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = Users.findByEmail(email);
    const hash = user?.passwordHash ?? '$2b$12$invalidhashtopreventtiming000000000000000000000000000';
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = issueToken(user.id);
    console.log(`[auth] login: ${email}`);
    res.cookie('token', token, COOKIE_OPTS).json({ user: Users.toPublic(user), token });
  } catch (err) {
    console.error('[auth] login:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    const { sub } = jwt.verify(token, JWT_SECRET);
    const user = Users.findById(sub);
    if (!user) return res.status(401).json({ error: 'User not found.' });
    res.json(Users.toPublic(user));
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// PATCH /api/auth/profile  (update name, bio)
router.patch('/profile', (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    const { sub } = jwt.verify(token, JWT_SECRET);
    const { name, bio } = req.body;
    const updated = Users.update(sub, { name, bio });
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    res.json(Users.toPublic(updated));
  } catch {
    res.status(401).json({ error: 'Unauthorized.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' }).json({ message: 'Logged out.' });
});

export default router;
