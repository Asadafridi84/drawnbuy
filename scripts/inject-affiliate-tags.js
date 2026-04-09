#!/usr/bin/env node
/**
 * DrawNBuy — Amazon Associates Tag Injector
 *
 * USAGE:
 *   node scripts/inject-affiliate-tags.js --tag YOUR-TRACKING-ID-20
 *
 * This script walks src/data/index.js and appends your Amazon Associates
 * tag parameter to every amazon.com URL found in the file.
 *
 * Example:
 *   node scripts/inject-affiliate-tags.js --tag drawnbuy-20
 *
 * Safe to re-run — it will update existing tags if they differ.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dir, '../src/data/index.js');

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const tagIdx = args.indexOf('--tag');
if (tagIdx === -1 || !args[tagIdx + 1]) {
  console.error('Usage: node scripts/inject-affiliate-tags.js --tag YOUR-TAG-20');
  process.exit(1);
}
const AFFILIATE_TAG = args[tagIdx + 1].trim();
if (!AFFILIATE_TAG.match(/^[a-z0-9][a-z0-9-]*-\d{2}$/i)) {
  console.warn(`Warning: "${AFFILIATE_TAG}" doesn't look like a standard Amazon tag (e.g. drawnbuy-20)`);
}

// ── Process file ──────────────────────────────────────────────────────────────
let source = readFileSync(DATA_FILE, 'utf8');
let count = 0;

source = source.replace(/https:\/\/www\.amazon\.com[^\s"'`)]+/g, (url) => {
  try {
    const parsed = new URL(url);
    // Remove existing tag param if present
    parsed.searchParams.delete('tag');
    parsed.searchParams.set('tag', AFFILIATE_TAG);
    count++;
    return parsed.toString();
  } catch {
    return url;
  }
});

writeFileSync(DATA_FILE, source, 'utf8');
console.log(`✅ Updated ${count} Amazon URLs with tag="${AFFILIATE_TAG}"`);
console.log(`   File: ${DATA_FILE}`);
console.log('');
console.log('Next: run `npm run build` and verify links in browser.');
