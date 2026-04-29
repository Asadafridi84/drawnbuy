/**
 * S2–S13 section verification
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const OUT  = './s2s13-screenshots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const results = [];
function pass(id, note) { results.push({ status:'✅ PASS', id, note }); console.log(`✅ PASS [${id}] ${note}`); }
function fail(id, note) { results.push({ status:'❌ FAIL', id, note }); console.log(`❌ FAIL [${id}] ${note}`); }
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // ── TEST 1: S7 PSP shows products by default ─────────────────────────────
  console.log('\n─── TEST 1: S7 PSP shows products by default ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);
  const pspCards = await page.$$eval('.psp-card', els => els.length);
  await page.screenshot({ path: `${OUT}/s7-psp-default.png` });
  if (pspCards >= 10) pass('S7-psp-default', `PSP shows ${pspCards} draggable products on load`);
  else               fail('S7-psp-default', `PSP only shows ${pspCards} products — expected 10+`);

  // ── TEST 2: S7 PSP category filter works ─────────────────────────────────
  console.log('\n─── TEST 2: S7 PSP category filter ───');
  await page.evaluate(() => {
    // Click the "👟 Shoes & Sneakers" chip
    const chips = Array.from(document.querySelectorAll('.cat-chip'));
    const shoe = chips.find(c => c.textContent.includes('Shoes'));
    shoe?.click();
  });
  await wait(500);
  const shoeCards = await page.$$eval('.psp-card', els => els.length);
  await page.screenshot({ path: `${OUT}/s7-psp-shoes.png` });
  if (shoeCards >= 1) pass('S7-psp-filter', `PSP shoes filter shows ${shoeCards} products`);
  else               fail('S7-psp-filter', `PSP shoes filter shows 0 products — cat field not working`);

  // ── TEST 3: S2 ShareModal QR code ────────────────────────────────────────
  console.log('\n─── TEST 3: S2 ShareModal QR code ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  // Open share modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const share = btns.find(b => b.textContent.includes('Invite') || b.textContent.includes('Share'));
    share?.click();
  });
  await wait(800);
  // Click QR Code option
  await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('.sopt'));
    const qr = opts.find(o => o.textContent.includes('QR'));
    qr?.click();
  });
  await wait(1200);
  const qrImg = await page.evaluate(() => {
    const img = document.querySelector('img[src*="qrserver"]');
    return img ? img.src : null;
  });
  await page.screenshot({ path: `${OUT}/s2-qr-code.png` });
  if (qrImg) pass('S2-qr', `QR code image rendered: ${qrImg.slice(0, 60)}...`);
  else       fail('S2-qr', 'QR code image not found after clicking QR tile');

  // ── TEST 4: S10 CategoriesGrid navigation ────────────────────────────────
  console.log('\n─── TEST 4: S10 CategoriesGrid navigation ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  await page.evaluate(() => {
    const el = document.getElementById('catsSection');
    if (el) el.scrollIntoView();
  });
  await wait(800);
  const firstCat = await page.evaluate(() => {
    const cards = document.querySelectorAll('.ct');
    return cards[0] ? true : false;
  });
  if (firstCat) {
    await page.evaluate(() => document.querySelectorAll('.ct')[0]?.click());
    await wait(2000);
    const navUrl = page.url();
    await page.screenshot({ path: `${OUT}/s10-cat-nav.png` });
    if (navUrl.includes('/category/')) pass('S10-cat', `CategoriesGrid navigated to: ${navUrl}`);
    else                               fail('S10-cat', `CategoriesGrid did NOT navigate — URL: ${navUrl}`);
  } else {
    fail('S10-cat', 'No .ct cards found in CategoriesGrid');
  }

  // ── TEST 5: S9 Deals Add to Canvas button ────────────────────────────────
  console.log('\n─── TEST 5: S9 Deals Add to Canvas ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  await page.evaluate(() => {
    const el = document.getElementById('dealsAnchor');
    if (el) el.scrollIntoView();
  });
  await wait(800);
  const addbtn = await page.evaluate(() => {
    const btn = document.querySelector('.dc-addbtn');
    return btn ? btn.textContent.trim() : null;
  });
  await page.screenshot({ path: `${OUT}/s9-add-to-canvas.png` });
  if (addbtn && addbtn.includes('Canvas')) pass('S9-add', `Add to Canvas button found: "${addbtn}"`);
  else                                      fail('S9-add', `Add to Canvas button not found or text wrong: "${addbtn}"`);

  // ── TEST 6: S13 Privacy page exists ──────────────────────────────────────
  console.log('\n─── TEST 6: S13 Privacy page ───');
  await page.goto(`${BASE}/privacy`, { waitUntil: 'networkidle' });
  await wait(800);
  const privText = await page.evaluate(() => document.body.innerText.includes('GDPR') || document.body.innerText.includes('Privacy Policy'));
  await page.screenshot({ path: `${OUT}/s13-privacy.png` });
  if (privText) pass('S13-privacy', '/privacy page loads with GDPR content');
  else          fail('S13-privacy', '/privacy page missing or empty');

  // ── TEST 7: S13 Terms page ───────────────────────────────────────────────
  console.log('\n─── TEST 7: S13 Terms page ───');
  await page.goto(`${BASE}/terms`, { waitUntil: 'networkidle' });
  await wait(600);
  const termsText = await page.evaluate(() => document.body.innerText.includes('Terms of Service') || document.body.innerText.includes('Governing Law'));
  await page.screenshot({ path: `${OUT}/s13-terms.png` });
  if (termsText) pass('S13-terms', '/terms page loads with Terms content');
  else           fail('S13-terms', '/terms page missing or empty');

  // ── TEST 8: S13 Cookies page ─────────────────────────────────────────────
  console.log('\n─── TEST 8: S13 Cookies page ───');
  await page.goto(`${BASE}/cookies`, { waitUntil: 'networkidle' });
  await wait(600);
  const cookieText = await page.evaluate(() => document.body.innerText.includes('Cookie') && document.body.innerText.includes('Preferences'));
  await page.screenshot({ path: `${OUT}/s13-cookies.png` });
  if (cookieText) pass('S13-cookies', '/cookies page loads with cookie preferences');
  else            fail('S13-cookies', '/cookies page missing or empty');

  // ── TEST 9: S12 HowItWorks uses real images ───────────────────────────────
  console.log('\n─── TEST 9: S12 HowItWorks real images ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  await page.evaluate(() => document.getElementById('hiwSection')?.scrollIntoView());
  await wait(800);
  const hiwImgs = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.hiw-icon-wrap img'));
    return imgs.length;
  });
  await page.screenshot({ path: `${OUT}/s12-hiw-images.png` });
  if (hiwImgs >= 4) pass('S12-hiw', `HowItWorks shows ${hiwImgs} real images`);
  else              fail('S12-hiw', `HowItWorks only has ${hiwImgs} images — expected 4`);

  // ── TEST 10: S6 Clear All button ─────────────────────────────────────────
  console.log('\n─── TEST 10: S6 Clear All button ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  await page.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(800);
  const clearAllBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.t-chip'));
    const btn = btns.find(b => b.textContent.includes('Clear All'));
    return btn ? btn.textContent.trim() : null;
  });
  await page.screenshot({ path: `${OUT}/s6-clear-all.png` });
  if (clearAllBtn) pass('S6-clear', `Clear All button found: "${clearAllBtn}"`);
  else             fail('S6-clear', 'Clear All button not found in canvas toolbar');

  await browser.close();

  console.log('\n═══════════════════════════════════════');
  console.log('  S2–S13 Verification Report');
  console.log('═══════════════════════════════════════');
  results.forEach(r => console.log(`${r.status} [${r.id}] ${r.note}`));
  const p = results.filter(r => r.status.includes('PASS')).length;
  const f = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`\nResult: ${p}/${results.length} passed, ${f} failed`);
  if (f > 0) process.exit(1);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
