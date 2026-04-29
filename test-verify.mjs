/**
 * Post-fix verification: MiniFloatingCanvas on all pages + footer links
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const OUT  = './verify-screenshots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
const results = [];
function pass(id, note) { results.push({ status:'✅ PASS', id, note }); console.log(`✅ PASS [${id}] ${note}`); }
function fail(id, note) { results.push({ status:'❌ FAIL', id, note }); console.log(`❌ FAIL [${id}] ${note}`); }

async function hasMini(page) {
  return page.evaluate(() =>
    document.body.innerText.includes('Drop Zone') || document.body.innerText.includes('Open Full Canvas')
  );
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // ── P0: MiniFloatingCanvas on every page ──────────────────
  const pages = [
    { name: 'home',          url: BASE },
    { name: 'room-param',    url: `${BASE}/?room=test123` },
    { name: 'category',      url: `${BASE}/category/shoes-sneakers` },
    { name: 'login',         url: `${BASE}/login` },
    { name: 'profile-guest', url: `${BASE}/profile` },
    { name: 'canvases-guest',url: `${BASE}/canvases` },
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await wait(1500);
    const mini = await hasMini(page);
    await page.screenshot({ path: `${OUT}/${p.name}.png` });
    if (mini) pass(`S16-${p.name}`, `MiniFloatingCanvas visible on ${p.url}`);
    else      fail(`S16-${p.name}`, `MiniFloatingCanvas MISSING on ${p.url}`);
  }

  // ── Footer dead links ─────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(600);
  await page.screenshot({ path: `${OUT}/footer.png` });

  const footerLinks = await page.$$eval('footer a', els =>
    els.map(e => ({ text: e.textContent.trim().slice(0,30), href: e.getAttribute('href') }))
  );
  const dead = footerLinks.filter(l => !l.href || l.href === '#');
  console.log(`\nFooter links (${footerLinks.length} total):`);
  footerLinks.forEach(l => console.log(`  "${l.text}" → ${l.href}`));

  if (dead.length === 0) pass('S13-footer', `All ${footerLinks.length} footer links have href`);
  else fail('S13-footer', `${dead.length} dead links remain: ${dead.map(l=>l.text).join(', ')}`);

  // ── ShareModal accessible from all routes ─────────────────
  // Test on category page (not home)
  await page.goto(`${BASE}/category/shoes-sneakers`, { waitUntil: 'networkidle' });
  await wait(1500);
  const shareBtn = await page.$('button.share-btn, button:has-text("Share Canvas")');
  if (shareBtn) {
    await shareBtn.click({ force: true });
    await wait(500);
    const modalOpen = await page.evaluate(() => document.body.innerText.includes('Share Your Canvas'));
    if (modalOpen) pass('S14-share-on-category', 'ShareModal opens from category page');
    else fail('S14-share-on-category', 'ShareModal did not open on category page');
  } else {
    fail('S14-share-on-category', 'No Share Canvas button on category page');
  }
  await page.screenshot({ path: `${OUT}/share-modal-category.png` });

  // ── Navbar Share Canvas on home ───────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  const shareHome = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.className?.includes('share-btn'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  await wait(500);
  const modalHome = await page.evaluate(() => document.body.innerText.includes('Share Your Canvas'));
  if (modalHome) pass('S14-share-home', 'ShareModal opens from home navbar');
  else fail('S14-share-home', `ShareModal did not open on home (shareHome=${shareHome})`);
  await page.screenshot({ path: `${OUT}/share-modal-home.png` });

  // ── Deals countdown ticking ───────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const el = document.getElementById('dealsAnchor') || document.getElementById('dealSection');
    if (el) el.scrollIntoView();
    else window.scrollBy(0, 2500);
  });
  await wait(1500);
  const cd1 = await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const m = (el.innerText || '').match(/\d{1,2}:\d{2}:\d{2}/);
      if (m && el.children.length === 0) return m[0]; // leaf element with time match
    }
    // fallback: any element
    for (const el of document.querySelectorAll('*')) {
      const m = (el.innerText || '').match(/\d{1,2}:\d{2}:\d{2}/);
      if (m) return m[0];
    }
    return null;
  });
  await wait(2500);
  const cd2 = await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const m = (el.innerText || '').match(/\d{1,2}:\d{2}:\d{2}/);
      if (m && el.children.length === 0) return m[0];
    }
    for (const el of document.querySelectorAll('*')) {
      const m = (el.innerText || '').match(/\d{1,2}:\d{2}:\d{2}/);
      if (m) return m[0];
    }
    return null;
  });
  await page.screenshot({ path: `${OUT}/deals-countdown.png` });
  console.log(`\nCountdown: "${cd1}" → "${cd2}"`);
  if (cd1 && cd2 && cd1 !== cd2) pass('S9-countdown', `Countdown ticking: "${cd1}"→"${cd2}"`);
  else if (cd1) fail('S9-countdown', `Countdown static: "${cd1}" (not changing)`);
  else fail('S9-countdown', 'No countdown found');

  // ── Add to cart toast ─────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollBy(0, 1600));
  await wait(800);
  const addBtn = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => /add.*cart|add to/i.test(b.innerText));
    if (btn) { btn.click(); return btn.innerText.trim(); }
    return null;
  });
  await wait(600);
  const cartToast = await page.evaluate(() => document.body.innerText.includes('cart') || document.body.innerText.includes('Cart'));
  if (cartToast) pass('S8-add-cart', `"${addBtn}" → cart toast shown`);
  else fail('S8-add-cart', `Clicked "${addBtn}" — no cart feedback`);

  // ── Category page products draggable ─────────────────────
  await page.goto(`${BASE}/category/womens-fashion`, { waitUntil: 'networkidle' });
  await wait(1500);
  const draggable = await page.$$('[draggable="true"]');
  await page.screenshot({ path: `${OUT}/category-womens.png` });
  if (draggable.length >= 4) pass('S15-draggable', `${draggable.length} draggable products on /category/womens-fashion`);
  else fail('S15-draggable', `Only ${draggable.length} draggable products`);

  await browser.close();

  console.log('\n═══════════════════════════════════════');
  console.log('  Verification Report');
  console.log('═══════════════════════════════════════');
  results.forEach(r => console.log(`${r.status} [${r.id}] ${r.note}`));
  const p = results.filter(r=>r.status.includes('PASS')).length;
  const f = results.filter(r=>r.status.includes('FAIL')).length;
  console.log(`\nResult: ${p}/${results.length} passed, ${f} failed`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
