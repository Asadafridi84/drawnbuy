import { Router } from 'express';
import { timingSafeEqual } from 'crypto';
import { getCachedIcon, generateSponsorIcons } from '../services/geminiIcons.js';

const router = Router();

// GET /api/icons/sponsors — returns all cached sponsor icons
router.get('/sponsors', (req, res) => {
  const icons = {};
  for (const key of ['burger', 'sneaker', 'sofa', 'hotel']) {
    const svg = getCachedIcon(key);
    if (svg) icons[key] = svg;
  }
  res.json(icons);
});

// POST /api/icons/sponsors/regenerate — admin-only regeneration
router.post('/sponsors/regenerate', async (req, res) => {
  const adminKey = req.headers['x-admin-key'] || '';
  const expected = process.env.ADMIN_KEY || '';
  const safe = adminKey.length === expected.length && expected.length > 0 &&
    timingSafeEqual(Buffer.from(adminKey), Buffer.from(expected));
  if (!safe) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  try {
    const icons = await generateSponsorIcons(true);
    res.json({ generated: Object.keys(icons || {}).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
