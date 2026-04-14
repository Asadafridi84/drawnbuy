import { Router } from 'express';
import { randomUUID } from 'crypto';
import { Canvases } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All canvas routes require auth
router.use(requireAuth);

// GET /api/canvases  — my canvases
router.get('/', (req, res) => {
  res.json(Canvases.findByOwner(req.userId));
});

// POST /api/canvases  — create a canvas record
router.post('/', (req, res) => {
  const { name = 'My Canvas', roomId, isPublic = false } = req.body;
  const safeRoomId = roomId
    ? String(roomId).replace(/[^A-Z0-9]/gi, '').slice(0, 12).toUpperCase()
    : randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
  const canvas = Canvases.create({
    id: randomUUID(),
    roomId: safeRoomId,
    name,
    ownerId: req.userId,
    isPublic,
  });
  res.status(201).json(canvas);
});

// PATCH /api/canvases/:id  — update name / thumbnail / visibility
router.patch('/:id', (req, res) => {
  const canvas = Canvases.findById(req.params.id);
  if (!canvas) return res.status(404).json({ error: 'Canvas not found.' });
  if (canvas.ownerId !== req.userId) return res.status(403).json({ error: 'Forbidden.' });

  const { name, thumbnail, isPublic } = req.body;

  // Validate thumbnail: must be a data URL or null, max 150kb
  if (thumbnail !== undefined && thumbnail !== null) {
    if (typeof thumbnail !== 'string' || thumbnail.length > 150_000) {
      return res.status(400).json({ error: 'Thumbnail must be a string under 150 KB.' });
    }
    if (!thumbnail.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Thumbnail must be a data: image URL.' });
    }
  }

  const updated = Canvases.update(req.params.id, { name, thumbnail, isPublic });
  res.json(updated);
});

// DELETE /api/canvases/:id
router.delete('/:id', (req, res) => {
  const ok = Canvases.delete(req.params.id, req.userId);
  if (!ok) return res.status(404).json({ error: 'Canvas not found or access denied.' });
  res.json({ deleted: true });
});

export default router;
