import { TRUSTED_DOMAINS } from '../data';

/** Strips HTML/script injection from user input */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 500);
}

/** Validates that an affiliate URL belongs to a trusted domain */
export function validateAffiliateUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');
    return TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

/** Simple rate limiter using localStorage counters */
const rateLimits = new Map();
export function checkRateLimit(key, maxCalls = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimits.get(key) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    rateLimits.set(key, { count: 1, start: now });
    return true;
  }
  if (entry.count >= maxCalls) return false;
  entry.count++;
  rateLimits.set(key, entry);
  return true;
}

/** Detect clickjacking */
export function detectClickjacking() {
  try {
    if (window.self !== window.top) {
      document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">DrawNBuy cannot be embedded in iframes for security reasons.</p>';
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

/** Generate a random room ID */
export function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/** Format price with currency */
export function formatPrice(amount, currency = 'SEK') {
  return `${amount.toLocaleString('sv-SE')} ${currency}`;
}

/** Truncate text */
export function truncate(str, n = 40) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}

/** Format countdown timer */
export function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
