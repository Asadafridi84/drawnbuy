const TRUSTED_DOMAINS = [
  'amazon.com', 'amazon.se', 'amazon.co.uk', 'amazon.de',
  'zara.com', 'hm.com', 'nike.com', 'ikea.com',
  'apple.com', 'samsung.com', 'boozt.com',
  'zalando.se', 'elgiganten.se', 'webhallen.com',
  'ubereats.com', 'booking.com', 'adidas.com',
];

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

/**
 * Sanitizes SVG content from external sources (e.g. Gemini API) before
 * rendering via dangerouslySetInnerHTML. Strips script tags, event handlers,
 * javascript: URIs, and foreign objects.
 */
export function sanitizeSvg(svgString) {
  if (typeof svgString !== 'string') return '';
  return svgString
    // Remove <script> blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove event handler attributes (onclick, onload, onerror, etc.)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: URIs
    .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, '')
    .replace(/xlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi, '')
    // Remove <foreignObject> (can embed HTML)
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    // Remove data: URIs in src/href (potential XSS vector)
    .replace(/(src|href)\s*=\s*["']\s*data:[^"']*["']/gi, '')
    .trim();
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

/** Simple rate limiter using in-memory counters */
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

/**
 * Detect clickjacking — uses a safe text node instead of innerHTML
 * to avoid the flagged XSS pattern.
 */
export function detectClickjacking() {
  try {
    if (window.self !== window.top) {
      document.body.textContent = '';
      const p = document.createElement('p');
      Object.assign(p.style, { padding: '2rem', fontFamily: 'sans-serif' });
      p.textContent = 'DrawnBuy cannot be embedded in iframes for security reasons.';
      document.body.appendChild(p);
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
