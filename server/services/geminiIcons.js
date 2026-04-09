/**
 * DrawNBuy — Gemini SVG Icon Generator
 * Generates animated SVG sponsor icons via Gemini API.
 * Called once at startup (or on-demand) and cached to disk.
 *
 * Model: gemini-2.5-flash-preview-04-17
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const CACHE   = join(__dir, '../data/gemini-icons.json');
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL   = 'gemini-2.5-flash-preview-04-17';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const ICON_PROMPTS = {
  burger: {
    brand: 'Uber Eats',
    color: '#06C167',
    prompt: `Create a single, self-contained animated SVG (48×48px viewBox) of a cute burger icon for Uber Eats. 
Use green (#06C167) as the accent color. Include a subtle CSS bounce animation on the top bun (translateY -3px, 2s infinite ease-in-out).
Draw layered shapes: sesame bun top, lettuce, tomato, patty, cheese, bun bottom. 
Return ONLY the raw SVG code starting with <svg — no markdown, no explanation.`,
  },
  sneaker: {
    brand: 'Nike',
    color: '#000000',
    prompt: `Create a single, self-contained animated SVG (48×48px viewBox) of a Nike sneaker/shoe silhouette.
Use black and white. Include a subtle CSS slide animation (translateX 2px, 2.5s infinite ease-in-out) on the shoe body and a fade on the swoosh.
Draw a profile view: sole, upper, laces, and the iconic Nike swoosh in white.
Return ONLY the raw SVG code starting with <svg — no markdown, no explanation.`,
  },
  sofa: {
    brand: 'IKEA',
    color: '#0058a3',
    prompt: `Create a single, self-contained animated SVG (48×48px viewBox) of a simple modern sofa/couch icon for IKEA.
Use IKEA blue (#0058a3). Include a CSS squish animation on the cushions (scaleY 0.93, 3s infinite ease-in-out).
Draw: two armrests, seat cushions, backrest, and small legs.
Return ONLY the raw SVG code starting with <svg — no markdown, no explanation.`,
  },
  hotel: {
    brand: 'Booking.com',
    color: '#003580',
    prompt: `Create a single, self-contained animated SVG (48×48px viewBox) of a hotel building icon for Booking.com.
Use dark blue (#003580). Include a CSS blink/step animation on 4-5 window rectangles (alternating lit/dark, 2s step-end infinite).
Draw: building body, multiple floors with windows, a rooftop detail, and a small flag or antenna.
Return ONLY the raw SVG code starting with <svg — no markdown, no explanation.`,
  },
};

function loadCache() {
  if (existsSync(CACHE)) {
    try { return JSON.parse(readFileSync(CACHE, 'utf8')); } catch {}
  }
  return {};
}

function saveCache(data) {
  const dir = join(__dir, '../data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CACHE, JSON.stringify(data, null, 2), 'utf8');
}

async function generateIcon(key) {
  const { prompt } = ICON_PROMPTS[key];
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract SVG — strip any markdown fences the model might include
  const match = raw.match(/<svg[\s\S]*<\/svg>/i);
  if (!match) throw new Error(`No SVG found in Gemini response for "${key}"`);
  return match[0];
}

/**
 * Generate all sponsor icons, using disk cache.
 * Set force=true to regenerate even if cached.
 */
export async function generateSponsorIcons(force = false) {
  if (!API_KEY) {
    console.warn('[gemini] GEMINI_API_KEY not set — skipping icon generation');
    return null;
  }

  const cache = loadCache();
  const result = { ...cache };
  const keys   = Object.keys(ICON_PROMPTS);

  let generated = 0;
  for (const key of keys) {
    if (!force && cache[key]) {
      console.log(`[gemini] using cached icon: ${key}`);
      continue;
    }
    try {
      console.log(`[gemini] generating icon: ${key} (${ICON_PROMPTS[key].brand})…`);
      result[key] = await generateIcon(key);
      generated++;
      // Polite rate-limit between calls
      if (generated < keys.length) await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`[gemini] failed for "${key}":`, err.message);
    }
  }

  if (generated > 0) {
    saveCache(result);
    console.log(`[gemini] saved ${generated} new icons to cache`);
  }

  return result;
}

/**
 * Get a single icon from cache (sync, no API call).
 */
export function getCachedIcon(key) {
  const cache = loadCache();
  return cache[key] || null;
}
