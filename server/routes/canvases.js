import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Canvases } from '../db/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-min-32-chars!!';

function getUser(req) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function genId() { return Math.random().toString(36).substring(2, 14); }

// GET /api/canvases  — my canvases
router.get('/', (req, res) => {
  const auth = getUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated.' });
  const canvases = Canvases.findByOwner(auth.sub);
  res.json(canvases);
});

// POST /api/canvases  — create a canvas record
router.post('/', (req, res) => {
  const auth = getUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated.' });
  const { name = 'My Canvas', roomId, isPublic = false } = req.body;
  const canvas = Canvases.create({
    id: genId(),
    roomId: String(roomId || genId()).slice(0, 12).toUpperCase(),
    name,
    ownerId: auth.sub,
    isPublic,
  });
  res.status(201).json(canvas);
});

// PATCH /api/canvases/:id  — update name / thumbnail / visibility
router.patch('/:id', (req, res) => {
  const auth = getUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated.' });
  const canvas = Canvases.findById(req.params.id);
  if (!canvas) return res.status(404).json({ error: 'Canvas not found.' });
  if (canvas.ownerId !== auth.sub) return res.status(403).json({ error: 'Forbidden.' });
  const { name, thumbnail, isPublic } = req.body;
  const updated = Canvases.update(req.params.id, { name, thumbnail, isPublic });
  res.json(updated);
});

// DELETE /api/canvases/:id
router.delete('/:id', (req, res) => {
  const auth = getUser(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated.' });
  const ok = Canvases.delete(req.params.id, auth.sub);
  if (!ok) return res.status(404).json({ error: 'Canvas not found or access denied.' });
  res.json({ deleted: true });
});

export default router;
