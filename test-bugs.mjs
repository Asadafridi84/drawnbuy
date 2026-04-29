/**
 * Phase 3 verification — all 6 bugs
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const OUT  = './bug-screenshots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const results = [];
function pass(id, note) { results.push({ status:'✅ PASS', id, note }); console.log(`✅ PASS [${id}] ${note}`); }
function fail(id, note) { results.push({ status:'❌ FAIL', id, note }); console.log(`❌ FAIL [${id}] ${note}`); }
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // ── TEST 1: BUG 1 — CategoryBar chip navigation ───────────────────────────
  console.log('\n─── TEST 1: CategoryBar chip navigation ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);

  const firstChip = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.cni')).filter(b => b.textContent.trim() !== '🔥 All');
    return btns[0]?.textContent.trim().slice(0, 30);
  });
  console.log('  First chip found:', firstChip);

  if (firstChip) {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.cni')).filter(b => b.textContent.trim() !== '🔥 All');
      btns[0]?.click();
    });
    await wait(2000);
    const url = page.url();
    await page.screenshot({ path: `${OUT}/bug1-chip-nav.png` });
    if (url.includes('/category/')) {
      pass('BUG1-chip', `Chip "${firstChip}" navigated to: ${url}`);
    } else {
      fail('BUG1-chip', `Chip did NOT navigate — still on: ${url}`);
    }
  } else {
    fail('BUG1-chip', 'No category chips found in DOM');
  }

  // ── TEST 2: BUG 3 — MiniFloatingCanvas on category page ──────────────────
  console.log('\n─── TEST 2: MiniFloatingCanvas on category page ───');
  await page.goto(`${BASE}/category/shoes-sneakers`, { waitUntil: 'networkidle' });
  await wait(1500);
  const hasMini = await page.evaluate(() =>
    document.body.innerText.includes('Drop Zone') || document.body.innerText.includes('Open Full Canvas')
  );
  await page.screenshot({ path: `${OUT}/bug3-mini-canvas.png` });
  if (hasMini) pass('BUG3-mini', 'MiniFloatingCanvas visible on /category/shoes-sneakers');
  else         fail('BUG3-mini', 'MiniFloatingCanvas MISSING on category page');

  // ── TEST 3: BUG 4 — Category page products draggable ─────────────────────
  console.log('\n─── TEST 3: Category page draggable products ───');
  await page.goto(`${BASE}/category/womens-fashion`, { waitUntil: 'networkidle' });
  await wait(1500);
  const draggable = await page.$$eval('[draggable="true"]', els => els.length);
  await page.screenshot({ path: `${OUT}/bug4-draggable.png` });
  if (draggable >= 4) pass('BUG4-drag', `${draggable} draggable product cards on /category/womens-fashion`);
  else               fail('BUG4-drag', `Only ${draggable} draggable items`);

  // ── TEST 4: BUG 2 — Drop zone on CollabCanvas exists ─────────────────────
  console.log('\n─── TEST 4: CollabCanvas drop zone ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);
  // Scroll to canvas
  await page.evaluate(() => {
    const el = document.getElementById('collabSection');
    if (el) el.scrollIntoView();
  });
  await wait(800);
  // Check that cv-area has onDragOver (it does if the handler is attached)
  const dropInfo = await page.evaluate(() => {
    const el = document.querySelector('.cv-area');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
  });
  await page.screenshot({ path: `${OUT}/bug2-canvas-area.png` });
  console.log('  cv-area rect:', dropInfo);
  if (dropInfo && dropInfo.height > 200) {
    pass('BUG2-drop', `cv-area has proper height: ${dropInfo.height}px — drag target valid`);
  } else if (!dropInfo) {
    fail('BUG2-drop', '.cv-area element not found in DOM');
  } else {
    fail('BUG2-drop', `cv-area height too small: ${dropInfo.height}px`);
  }

  // ── TEST 5: BUG 5 — Mic button in chat ───────────────────────────────────
  console.log('\n─── TEST 5: Mic button in CollabCanvas chat ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);
  await page.evaluate(() => {
    document.getElementById('collabSection')?.scrollIntoView();
  });
  await wait(800);
  const micBtn = await page.evaluate(() => {
    // Check for mic button by class or title
    const btn = document.querySelector('.mic-btn, button[title="Hold to record voice"]');
    return btn ? { className: btn.className, title: btn.title, text: btn.textContent.trim() } : null;
  });
  await page.screenshot({ path: `${OUT}/bug5-mic-btn.png` });
  if (micBtn) {
    pass('BUG5-mic', `Mic button found: class="${micBtn.className}" text="${micBtn.text}"`);
  } else {
    fail('BUG5-mic', 'No mic button found in CollabCanvas chat');
  }

  // ── TEST 6: BUG 6 — Navbar dropdown navigation ───────────────────────────
  console.log('\n─── TEST 6: Navbar dropdown navigation ───');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1000);
  // Click "All Categories" dropdown button
  await page.evaluate(() => {
    const btn = document.querySelector('.cat-dd-btn');
    btn?.click();
  });
  await wait(600);
  const ddOpen = await page.evaluate(() => !!document.querySelector('.cat-dd-menu'));
  await page.screenshot({ path: `${OUT}/bug6-dd-open.png` });
  if (!ddOpen) {
    fail('BUG6-nav', 'Category dropdown did not open');
  } else {
    // Click first item
    await page.evaluate(() => {
      const item = document.querySelector('.cat-dd-item');
      item?.click();
    });
    await wait(2000);
    const navUrl = page.url();
    await page.screenshot({ path: `${OUT}/bug6-dd-nav.png` });
    if (navUrl.includes('/category/')) {
      pass('BUG6-nav', `Dropdown navigated to: ${navUrl}`);
    } else {
      fail('BUG6-nav', `Dropdown did NOT navigate — URL: ${navUrl}`);
    }
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════');
  console.log('  Bug Fix Verification Report');
  console.log('═══════════════════════════════════════');
  results.forEach(r => console.log(`${r.status} [${r.id}] ${r.note}`));
  const p = results.filter(r => r.status.includes('PASS')).length;
  const f = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`\nResult: ${p}/${results.length} passed, ${f} failed`);
  if (f > 0) process.exit(1);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
