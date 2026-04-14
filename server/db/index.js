/**
 * DrawNBuy DB Layer
 * Currently: JSON file persistence (good for Render free tier)
 * To upgrade to Postgres: replace the functions below with pg queries.
 * Schema stays the same — callers don't change.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, '../data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const CANVASES_FILE = join(DATA_DIR, 'canvases.json');

// ── Bootstrap ─────────────────────────────────────────────────────────────────
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, fallback = {}) {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  ensureDataDir();
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const Users = {
  _load() { return readJSON(USERS_FILE, {}); },
  _save(data) { writeJSON(USERS_FILE, data); },

  findByEmail(email) {
    return this._load()[email.toLowerCase()] || null;
  },

  findById(id) {
    const all = this._load();
    return Object.values(all).find(u => u.id === id) || null;
  },

  create({ id, email, name, passwordHash }) {
    const all = this._load();
    const user = {
      id,
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: new Date().toISOString(),
      avatar: null,
      bio: '',
    };
    all[email.toLowerCase()] = user;
    this._save(all);
    return user;
  },

  update(id, fields) {
    const all = this._load();
    const key = Object.keys(all).find(k => all[k].id === id);
    if (!key) return null;
    const safe = {};
    if (fields.name !== undefined) safe.name = String(fields.name).slice(0, 80);
    if (fields.bio  !== undefined) safe.bio  = String(fields.bio).slice(0, 300);
    if (fields.avatar !== undefined) safe.avatar = fields.avatar;
    all[key] = { ...all[key], ...safe, updatedAt: new Date().toISOString() };
    this._save(all);
    return all[key];
  },

  delete(id) {
    const all = this._load();
    const key = Object.keys(all).find(k => all[k].id === id);
    if (!key) return false;
    delete all[key];
    this._save(all);
    return true;
  },

  toPublic(user) {
    const { passwordHash, ...pub } = user;
    return pub;
  },
};

// ── Canvases ──────────────────────────────────────────────────────────────────
export const Canvases = {
  _load() { return readJSON(CANVASES_FILE, {}); },
  _save(data) { writeJSON(CANVASES_FILE, data); },

  findById(id) {
    return this._load()[id] || null;
  },

  findByOwner(userId) {
    return Object.values(this._load())
      .filter(c => c.ownerId === userId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  create({ id, roomId, name, ownerId, isPublic = false }) {
    const all = this._load();
    const canvas = {
      id,
      roomId,
      name: String(name).slice(0, 80) || 'My Canvas',
      ownerId,
      isPublic,
      thumbnail: null,
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all[id] = canvas;
    this._save(all);
    return canvas;
  },

  update(id, fields) {
    const all = this._load();
    if (!all[id]) return null;
    const safe = {};
    if (fields.name      !== undefined) safe.name      = String(fields.name).slice(0, 80);
    if (fields.thumbnail !== undefined) safe.thumbnail = fields.thumbnail;
    if (fields.isPublic  !== undefined) safe.isPublic  = Boolean(fields.isPublic);
    all[id] = { ...all[id], ...safe, updatedAt: new Date().toISOString() };
    this._save(all);
    return all[id];
  },

  delete(id, userId) {
    const all = this._load();
    if (!all[id] || all[id].ownerId !== userId) return false;
    delete all[id];
    this._save(all);
    return true;
  },
};
