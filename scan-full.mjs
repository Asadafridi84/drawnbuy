/**
 * DrawNBuy Full 16-Section Scan + Dual-Context Sync Tests
 * Outputs screenshots to ./scan-out/  and a summary report
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const ROOM = 'scanroom1';
const OUT  = './scan-out';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const results = [];
const bugs    = [];
function pass(id, note)   { results.push({ status:'✅ PASS',    id, note }); console.log(`✅ PASS    [${id}] ${note}`); }
function partial(id, note){ results.push({ status:'⚠️  PARTIAL', id, note }); console.log(`⚠️  PARTIAL [${id}] ${note}`); bugs.push({ id, note }); }
function fail(id, note)   { results.push({ status:'❌ FAIL',    id, note }); console.log(`❌ FAIL    [${id}] ${note}`); bugs.push({ id, note }); }
async function wait(ms)   { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  // ── Launch two separate browser contexts ─────────────────────────────────
  const browser  = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctxA     = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ctxB     = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pageA    = await ctxA.newPage();
  const pageB    = await ctxB.newPage();

  // Collect console errors
  const consoleErrors = [];
  pageA.on('console', m => { if (m.type() === 'error') consoleErrors.push('[CTX-A] ' + m.text()); });
  pageB.on('console', m => { if (m.type() === 'error') consoleErrors.push('[CTX-B] ' + m.text()); });
  pageA.on('pageerror', e => consoleErrors.push('[CTX-A PAGE-ERR] ' + e.message));
  pageB.on('pageerror', e => consoleErrors.push('[CTX-B PAGE-ERR] ' + e.message));

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  PHASE 1 — Opening both contexts');
  console.log('═══════════════════════════════════════════════════');

  await Promise.all([
    pageA.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' }),
    pageB.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' }),
  ]);
  await wait(2000);
  await pageA.screenshot({ path: `${OUT}/00-ctxA-initial.png`, fullPage: false });
  await pageB.screenshot({ path: `${OUT}/00-ctxB-initial.png`, fullPage: false });
  console.log('  ✓ Both contexts open — screenshots saved');

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2 — SECTION SCANS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  PHASE 2 — Section Scans');
  console.log('═══════════════════════════════════════════════════');

  // ── S1: TOPBAR ─────────────────────────────────────────────────────────────
  console.log('\n─── S1: TOPBAR ───');
  await pageA.screenshot({ path: `${OUT}/s1-topbar.png` });
  const topbarText = await pageA.evaluate(() => {
    const tb = document.querySelector('.topbar-inner, [class*="topbar"]');
    return tb ? tb.textContent.trim().slice(0, 60) : null;
  });
  // Country selector
  const hasCurrencySelector = await pageA.evaluate(() => {
    const sel = document.querySelector('.geo-btn, [class*="geo"], [class*="country"], select');
    return !!sel;
  });
  console.log(`  Topbar text: ${topbarText}`);
  if (topbarText) pass('S1-topbar', `Topbar renders: "${topbarText.slice(0,50)}"...`);
  else            fail('S1-topbar', 'Topbar element not found');
  if (hasCurrencySelector) pass('S1-currency', 'Currency/country selector present');
  else                     partial('S1-currency', 'No country selector found in topbar');

  // ── S2: NAVBAR ─────────────────────────────────────────────────────────────
  console.log('\n─── S2: NAVBAR ───');
  await pageA.screenshot({ path: `${OUT}/s2-navbar.png` });
  const navbarExists = await pageA.evaluate(() => !!document.querySelector('nav, .navbar, [class*="navbar"]'));
  const shareBtn = await pageA.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Share') || b.textContent.includes('Invite') || b.className.includes('share'));
  });

  if (navbarExists) pass('S2-navbar', 'Navbar renders');
  else             fail('S2-navbar', 'Navbar not found');

  // Open share modal
  await pageA.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sb = btns.find(b => b.textContent.includes('Share') || b.textContent.includes('share'));
    sb?.click();
  });
  await wait(1000);
  const shareModalOpen = await pageA.evaluate(() => !!document.querySelector('.sopt, [class*="ShareModal"]'));
  await pageA.screenshot({ path: `${OUT}/s2-share-modal.png` });
  if (shareModalOpen) {
    pass('S2-sharemodal', 'ShareModal opens from navbar');
    // Check QR Code
    await pageA.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('.sopt'));
      const qr = opts.find(o => o.textContent.includes('QR'));
      qr?.click();
    });
    await wait(1000);
    const qrImg = await pageA.evaluate(() => !!document.querySelector('img[src*="qrserver"]'));
    await pageA.screenshot({ path: `${OUT}/s2-share-qr.png` });
    if (qrImg) pass('S2-qr', 'QR Code renders in ShareModal');
    else       fail('S2-qr', 'QR Code image missing in ShareModal');
    // Close modal
    await pageA.evaluate(() => {
      const closeBtn = document.querySelector('button[style*="position: absolute"]');
      closeBtn?.click();
    });
    await wait(500);
  } else {
    fail('S2-sharemodal', 'ShareModal did NOT open');
  }

  // Category dropdown
  await pageA.evaluate(() => {
    const ddBtn = document.querySelector('.cat-dd-btn');
    ddBtn?.click();
  });
  await wait(600);
  const ddOpen = await pageA.evaluate(() => !!document.querySelector('.cat-dd-menu'));
  await pageA.screenshot({ path: `${OUT}/s2-navbar-dropdown.png` });
  if (ddOpen) pass('S2-dropdown', 'Category dropdown opens');
  else        fail('S2-dropdown', 'Category dropdown does not open');

  // Close dropdown by pressing Escape
  await pageA.keyboard.press('Escape');
  await wait(300);

  // ── S3: AD STRIP ───────────────────────────────────────────────────────────
  console.log('\n─── S3: AD STRIP ───');
  await pageA.screenshot({ path: `${OUT}/s3-adstrip.png` });
  const adStripText = await pageA.evaluate(() => {
    const el = document.querySelector('.nano-banner, .adstrip, [class*="AdStrip"], [class*="ad-strip"]');
    if (!el) {
      // try finding by content
      const all = Array.from(document.querySelectorAll('div'));
      const ad = all.find(d => d.textContent.includes('Amazon') || d.textContent.includes('Nike') || d.textContent.includes('Samsung'));
      return ad ? ad.textContent.trim().slice(0, 80) : null;
    }
    return el.textContent.trim().slice(0, 80);
  });
  if (adStripText) pass('S3-adstrip', `Ad strip renders: "${adStripText.slice(0,50)}"...`);
  else             partial('S3-adstrip', 'Ad strip not found by class — may still render visually');

  // ── S4: HERO ───────────────────────────────────────────────────────────────
  console.log('\n─── S4: HERO ───');
  await pageA.screenshot({ path: `${OUT}/s4-hero.png` });
  const heroExists = await pageA.evaluate(() => {
    const h = document.querySelector('#heroSection, [id*="hero"], .hero');
    return !!h;
  });
  const heroText = await pageA.evaluate(() => {
    const h = document.querySelector('h1');
    return h ? h.textContent.trim().slice(0, 80) : null;
  });
  console.log(`  Hero h1: ${heroText}`);
  if (heroText) pass('S4-hero', `Hero renders — h1: "${heroText.slice(0,50)}"`);
  else          partial('S4-hero', 'Hero h1 not found');

  // Check mini canvas in hero
  const miniCanvas = await pageA.evaluate(() => {
    const el = document.querySelector('canvas, [class*="mini"], [class*="Mini"]');
    return !!el;
  });
  if (miniCanvas) pass('S4-minicanvas', 'Mini canvas element found in hero');
  else            partial('S4-minicanvas', 'Mini canvas element not found');

  // Check for draggable product cards in hero
  const heroDraggable = await pageA.evaluate(() => {
    return document.querySelectorAll('[draggable="true"]').length;
  });
  if (heroDraggable > 0) pass('S4-draggable', `${heroDraggable} draggable elements found on page`);
  else                   fail('S4-draggable', 'No draggable elements found');

  // ── S5: CATEGORY BAR ───────────────────────────────────────────────────────
  console.log('\n─── S5: CATEGORY BAR ───');
  await pageA.screenshot({ path: `${OUT}/s5-catbar.png` });
  const catChips = await pageA.evaluate(() => document.querySelectorAll('.cni').length);
  console.log(`  Category chips: ${catChips}`);
  if (catChips >= 5) {
    pass('S5-catbar', `Category bar shows ${catChips} chips`);
    // Click first non-All chip
    const chipName = await pageA.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.cni')).filter(b => !b.textContent.includes('All'));
      if (btns[0]) { btns[0].click(); return btns[0].textContent.trim().slice(0,30); }
      return null;
    });
    await wait(2000);
    const catUrl = pageA.url();
    await pageA.screenshot({ path: `${OUT}/s5-catbar-nav.png` });
    if (catUrl.includes('/category/')) pass('S5-catnav', `Chip "${chipName}" navigated → ${catUrl}`);
    else                               fail('S5-catnav', `Chip did NOT navigate — URL: ${catUrl}`);
    // Return to home
    await pageA.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' });
    await wait(1500);
  } else {
    fail('S5-catbar', `Only ${catChips} category chips found`);
  }

  // ── S6: COLLAB CANVAS ──────────────────────────────────────────────────────
  console.log('\n─── S6: COLLAB CANVAS ───');
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(1000);
  await pageA.screenshot({ path: `${OUT}/s6-canvas-ctxA.png` });
  await pageB.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(500);

  // cv-area dimensions
  const cvRect = await pageA.evaluate(() => {
    const el = document.querySelector('.cv-area');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  if (cvRect && cvRect.h >= 400) pass('S6-cvarea', `cv-area size: ${cvRect.w}×${cvRect.h}px`);
  else                           fail('S6-cvarea', `cv-area bad size: ${JSON.stringify(cvRect)}`);

  // ── TEST 6A: Draw sync ──────────────────────────────────────────────────────
  console.log('\n  TEST 6A: Drawing sync A→B');
  const canvas = await pageA.evaluate(() => {
    const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  });
  if (canvas) {
    await pageA.mouse.move(canvas.x, canvas.y);
    await pageA.mouse.down();
    await pageA.mouse.move(canvas.x + 80, canvas.y + 40);
    await pageA.mouse.move(canvas.x + 160, canvas.y + 80);
    await pageA.mouse.up();
    await wait(1500);
    await pageA.screenshot({ path: `${OUT}/s6a-draw-ctxA.png` });
    await pageB.screenshot({ path: `${OUT}/s6a-draw-ctxB.png` });
    // Check if canvas in B has pixels (non-white)
    const bHasPixels = await pageB.evaluate(() => {
      const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
      if (!c) return false;
      const ctx = c.getContext('2d');
      const img = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i] !== 0 || img.data[i+1] !== 0 || img.data[i+2] !== 0) {
          if (img.data[i+3] > 0) return true;
        }
      }
      return false;
    });
    if (bHasPixels) pass('S6A-drawsync', 'Drawing synced from Context A to Context B ✓');
    else            partial('S6A-drawsync', 'Canvas in B may be empty — socket may not be connected yet');
  } else {
    fail('S6A-drawsync', 'Canvas element not found for drawing test');
  }

  // ── TEST 6B: Product drop onto canvas ────────────────────────────────────────
  // Strategy: fire a drop event directly on cv-area with crafted product data
  // (avoids off-screen coordinate issues when canvas and DragStrip are far apart)
  console.log('\n  TEST 6B: Product drop onto canvas');
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(800);
  const dropResult = await pageA.evaluate(() => {
    const cvArea = document.querySelector('.cv-area');
    if (!cvArea) return false;
    const r = cvArea.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + 150;
    const dt = new DataTransfer();
    dt.setData('application/drawnbuy-product', JSON.stringify({
      name: 'Scan Test Product', price: '499 kr',
      img: 'https://placehold.co/300x300/7c3aed/white?text=Scan', url: ''
    }));
    cvArea.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    cvArea.dispatchEvent(new DragEvent('drop',     { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    return true;
  });
  await wait(1800);
  await pageA.screenshot({ path: `${OUT}/s6b-drop-ctxA.png` });
  await pageB.screenshot({ path: `${OUT}/s6b-drop-ctxB.png` });
  const productOnA = await pageA.evaluate(() => document.querySelectorAll('.cv-card').length);
  const productOnB = await pageB.evaluate(() => document.querySelectorAll('.cv-card').length);
  console.log(`  Products on A: ${productOnA}, Products on B: ${productOnB}, drop fired: ${dropResult}`);
  if (productOnA > 0) pass('S6B-drop-A', `Product card on canvas A (${productOnA} cards)`);
  else                fail('S6B-drop-A', `Product card not on canvas A after drop — drop fired: ${dropResult}`);
  if (productOnB > 0) pass('S6B-drop-B', `Product card synced to Context B (${productOnB} cards)`);
  else                partial('S6B-drop-B', 'Product card not synced to B yet (socket may need time)');

  // ── TEST 6C: Product duplication when moving ─────────────────────────────
  console.log('\n  TEST 6C: Product duplication check');
  // Try dragging existing canvas card
  const existingCard = await pageA.evaluate(() => {
    const card = document.querySelector('.card-wrap, [class*="product-card"], .cv-card');
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  });
  const cvArea2 = await pageA.evaluate(() => {
    const el = document.querySelector('.cv-area');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { cx: Math.round(r.left + 60), cy: Math.round(r.top + 60) };
  });
  if (existingCard && cvArea2) {
    const cardsBefore = await pageA.evaluate(() => document.querySelectorAll('.card-wrap, [class*="product-card"], .cv-card').length);
    await pageA.evaluate(({ fromX, fromY, toX, toY }) => {
      const src = document.elementFromPoint(fromX, fromY);
      let el = src;
      while (el && el.draggable !== true) el = el.parentElement;
      if (!el) return;
      const dt = new DataTransfer();
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt, clientX: fromX, clientY: fromY }));
      const target = document.elementFromPoint(toX, toY);
      target?.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: toX, clientY: toY }));
      target?.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt, clientX: toX, clientY: toY }));
      el.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    }, { fromX: existingCard.x, fromY: existingCard.y, toX: cvArea2.cx, toY: cvArea2.cy });
    await wait(800);
    const cardsAfter = await pageA.evaluate(() => document.querySelectorAll('.card-wrap, [class*="product-card"], .cv-card').length);
    await pageA.screenshot({ path: `${OUT}/s6c-duplication.png` });
    if (cardsAfter > cardsBefore) fail('S6C-dup', `DUPLICATION BUG: cards went from ${cardsBefore} → ${cardsAfter} (move created new card)`);
    else                          pass('S6C-dup', `No duplication: card count stayed at ${cardsAfter}`);
  } else {
    partial('S6C-dup', 'Could not test duplication — no existing card found on canvas yet');
  }

  // ── TEST 6D: X delete button ───────────────────────────────────────────────
  console.log('\n  TEST 6D: X delete button on product card');
  const deleteBtn = await pageA.evaluate(() => {
    const btn = document.querySelector('.card-delete-btn, [class*="delete"], button[title*="Delete"], button[title*="Remove"]');
    return btn ? { found: true, text: btn.textContent.trim() } : { found: false };
  });
  await pageA.screenshot({ path: `${OUT}/s6d-delete-btn.png` });
  if (deleteBtn.found) pass('S6D-delbtn', `Delete button found on card: "${deleteBtn.text}"`);
  else                 fail('S6D-delbtn', 'No delete button (.card-delete-btn) found on product cards');

  // ── TEST 6E: Sticker sync ──────────────────────────────────────────────────
  console.log('\n  TEST 6E: Sticker sync A→B');
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(500);
  await pageA.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const stickerBtn = btns.find(b => b.textContent.includes('Sticker') || b.textContent.includes('sticker'));
    stickerBtn?.click();
  });
  await wait(600);
  await pageA.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const thumbs = btns.find(b => b.textContent.trim() === '👍' || b.textContent.includes('👍'));
    if (thumbs) thumbs.click();
    else {
      // Click first sticker option
      const firstSticker = document.querySelector('[style*="fontSize:22"]') ||
                           document.querySelector('button[style*="font-size:22"]');
      firstSticker?.click();
    }
  });
  await wait(1500);
  await pageA.screenshot({ path: `${OUT}/s6e-sticker-ctxA.png` });
  await pageB.screenshot({ path: `${OUT}/s6e-sticker-ctxB.png` });
  const stickerOnA = await pageA.evaluate(() => document.querySelectorAll('.emoji-sticker').length);
  const stickerOnB = await pageB.evaluate(() => document.querySelectorAll('.emoji-sticker').length);
  if (stickerOnA > 0) pass('S6E-sticker-A', `Sticker visible on Context A (${stickerOnA})`);
  else                partial('S6E-sticker-A', 'Sticker DOM selector not matching on A');
  if (stickerOnB > 0) pass('S6E-sticker-B', `Sticker synced to Context B (${stickerOnB})`);
  else                partial('S6E-sticker-B', 'Sticker not detected on Context B');

  // ── TEST 6F: Chat sync ─────────────────────────────────────────────────────
  console.log('\n  TEST 6F: Chat sync A→B');
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(500);
  const chatInputA = await pageA.evaluate(() => {
    const ta = document.querySelector('.cinp, textarea[class*="cinp"]');
    return ta ? true : false;
  });
  if (chatInputA) {
    await pageA.click('.cinp');
    await pageA.fill('.cinp', 'hello from context A');
    await pageA.keyboard.press('Enter');
    await wait(1500);
    await pageA.screenshot({ path: `${OUT}/s6f-chat-ctxA.png` });
    await pageB.screenshot({ path: `${OUT}/s6f-chat-ctxB.png` });
    const msgOnB = await pageB.evaluate(() => {
      const msgs = document.querySelectorAll('.mbbl');
      return Array.from(msgs).some(m => m.textContent.includes('hello from context A'));
    });
    if (msgOnB) pass('S6F-chat', 'Chat message synced from A to B ✓');
    else        partial('S6F-chat', 'Chat message not found on B — may need socket to be connected');
  } else {
    fail('S6F-chat', 'Chat input (.cinp) not found');
  }

  // ── TEST 6G: Voice mic button ──────────────────────────────────────────────
  console.log('\n  TEST 6G: Voice mic button');
  const micBtn = await pageA.evaluate(() => {
    const btn = document.querySelector('.mic-btn, button[title="Hold to record voice"]');
    return btn ? { found: true, cls: btn.className } : { found: false };
  });
  if (micBtn.found) pass('S6G-mic', `Mic button found: class="${micBtn.cls}"`);
  else              fail('S6G-mic', 'Mic button not found');

  // ── TEST 6H: Invite button opens ShareModal ────────────────────────────────
  console.log('\n  TEST 6H: Invite Friends button');
  const inviteBtn = await pageA.evaluate(() => {
    const btn = document.querySelector('.invite-btn');
    return btn ? btn.textContent.trim().slice(0, 40) : null;
  });
  if (inviteBtn) {
    await pageA.click('.invite-btn');
    await wait(800);
    const shareVisible = await pageA.evaluate(() => !!document.querySelector('.sopt'));
    await pageA.screenshot({ path: `${OUT}/s6h-invite-modal.png` });
    if (shareVisible) pass('S6H-invite', 'ShareModal opens from Invite Friends button');
    else              fail('S6H-invite', 'ShareModal did not open from Invite Friends button');
    // Close
    await pageA.keyboard.press('Escape');
    await wait(300);
  } else {
    fail('S6H-invite', 'Invite Friends button (.invite-btn) not found');
  }

  // ── TEST 6I: New user catch-up ─────────────────────────────────────────────
  console.log('\n  TEST 6I: New user catch-up (Context C)');
  const ctxC = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pageC = await ctxC.newPage();
  await pageC.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' });
  await wait(2500);
  await pageC.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(800);
  await pageC.screenshot({ path: `${OUT}/s6i-catchup-ctxC.png` });
  const cHasPixels = await pageC.evaluate(() => {
    const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
    if (!c) return false;
    const ctx = c.getContext('2d');
    const img = ctx.getImageData(0, 0, Math.min(c.width, 500), Math.min(c.height, 300));
    for (let i = 0; i < img.data.length; i += 4) {
      if (img.data[i+3] > 0 && (img.data[i] !== 255 || img.data[i+1] !== 255 || img.data[i+2] !== 255)) return true;
    }
    return false;
  });
  if (cHasPixels) pass('S6I-catchup', 'New context C sees existing canvas drawing ✓');
  else            partial('S6I-catchup', 'Context C canvas appears empty — drawing may not persist on join');
  await ctxC.close();

  // ── TEST 6J: Room isolation ────────────────────────────────────────────────
  console.log('\n  TEST 6J: Room isolation');
  const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pageD = await ctxD.newPage();
  await pageD.goto(`${BASE}/?room=completelyDifferentRoom999`, { waitUntil: 'networkidle' });
  await wait(2000);
  await pageD.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(600);
  await pageD.screenshot({ path: `${OUT}/s6j-isolation-ctxD.png` });
  const dHasPixels = await pageD.evaluate(() => {
    const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
    if (!c) return false;
    const ctx = c.getContext('2d');
    const img = ctx.getImageData(0, 0, Math.min(c.width, 500), Math.min(c.height, 300));
    for (let i = 0; i < img.data.length; i += 4) {
      if (img.data[i+3] > 0 && (img.data[i] !== 255 || img.data[i+1] !== 255 || img.data[i+2] !== 255)) return true;
    }
    return false;
  });
  if (!dHasPixels) pass('S6J-isolation', 'Different room (D) has empty canvas — rooms are isolated ✓');
  else             fail('S6J-isolation', 'Different room shows drawing — room isolation broken!');
  await ctxD.close();

  // ── TEST 6: Clear All button ───────────────────────────────────────────────
  console.log('\n  TEST 6K: Clear All button');
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(500);
  const clearAllBtn = await pageA.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.t-chip'));
    return btns.find(b => b.textContent.includes('Clear All')) ? true : false;
  });
  if (clearAllBtn) pass('S6K-clearall', 'Clear All button present in toolbar');
  else             fail('S6K-clearall', 'Clear All button missing from toolbar');

  // ── S7: PSP ────────────────────────────────────────────────────────────────
  console.log('\n─── S7: PSP PRODUCT SEARCH PANEL ───');
  await pageA.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' });
  await wait(1500);
  await pageA.evaluate(() => document.getElementById('pspSection')?.scrollIntoView());
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s7-psp.png` });
  const pspCards = await pageA.evaluate(() => document.querySelectorAll('.psp-card').length);
  const allChipActive = await pageA.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.cat-chip.on'));
    return chips.some(c => c.textContent.includes('All'));
  });
  console.log(`  PSP cards: ${pspCards}, All chip active: ${allChipActive}`);
  if (pspCards >= 10) pass('S7-default', `PSP shows ${pspCards} products by default`);
  else                fail('S7-default', `PSP shows only ${pspCards} products`);
  if (allChipActive) pass('S7-allchip', '"All" chip is active by default');
  else               partial('S7-allchip', '"All" chip not found/active by default');

  // Filter test
  await pageA.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.cat-chip'));
    const gamer = chips.find(c => c.textContent.includes('Gaming') || c.textContent.includes('game'));
    gamer?.click();
  });
  await wait(500);
  const gamingCards = await pageA.evaluate(() => document.querySelectorAll('.psp-card').length);
  await pageA.screenshot({ path: `${OUT}/s7-psp-gaming.png` });
  if (gamingCards >= 1) pass('S7-filter', `Gaming filter shows ${gamingCards} products`);
  else                  fail('S7-filter', 'Gaming filter shows 0 products');

  // Search test
  await pageA.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('.cat-chip')).find(c => c.textContent.includes('All'));
    chip?.click();
  });
  await wait(300);
  await pageA.fill('.psp-search-box', 'yoga');
  await wait(500);
  const yogaCards = await pageA.evaluate(() => document.querySelectorAll('.psp-card').length);
  await pageA.screenshot({ path: `${OUT}/s7-psp-search.png` });
  if (yogaCards >= 1) pass('S7-search', `Search "yoga" returns ${yogaCards} results`);
  else                fail('S7-search', 'Search "yoga" returns 0 results');
  // Clear search
  await pageA.fill('.psp-search-box', '');

  // ── S8: DRAG STRIP ─────────────────────────────────────────────────────────
  console.log('\n─── S8: DRAG STRIP ───');
  await pageA.evaluate(() => {
    const el = document.querySelector('.ds-track, [class*="DragStrip"], [id*="drag"]');
    el?.scrollIntoView();
  });
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s8-dragstrip.png` });
  const dsCards = await pageA.evaluate(() => {
    const cards = document.querySelectorAll('.ds-card, [class*="ds-card"]');
    return cards.length;
  });
  const dsImgs = await pageA.evaluate(() => {
    const imgs = document.querySelectorAll('.ds-card img, [class*="ds-card"] img');
    return imgs.length;
  });
  const dsWishBtns = await pageA.evaluate(() => {
    return document.querySelectorAll('.wish-btn, [class*="wish"]').length;
  });
  console.log(`  DragStrip cards: ${dsCards}, images: ${dsImgs}, wish buttons: ${dsWishBtns}`);
  if (dsCards >= 5) pass('S8-dragstrip', `DragStrip shows ${dsCards} cards`);
  else              partial('S8-dragstrip', `DragStrip shows only ${dsCards} cards`);
  if (dsImgs >= 5) pass('S8-images', `DragStrip has ${dsImgs} product images`);
  else             partial('S8-images', `DragStrip has only ${dsImgs} images`);
  if (dsWishBtns >= 1) pass('S8-wish', `Wish buttons present (${dsWishBtns})`);
  else                 partial('S8-wish', 'No wish buttons found on DragStrip');

  // ── S9: DEALS ──────────────────────────────────────────────────────────────
  console.log('\n─── S9: DEALS ───');
  await pageA.evaluate(() => document.getElementById('dealsAnchor')?.scrollIntoView());
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s9-deals.png` });
  const dealCards = await pageA.evaluate(() => document.querySelectorAll('.dc').length);
  const countdownEl = await pageA.evaluate(() => {
    const el = document.querySelector('.dc-countdown');
    return el ? el.textContent.trim().slice(0,20) : null;
  });
  const addToCanvasBtn = await pageA.evaluate(() => !!document.querySelector('.dc-addbtn'));
  const viewAllLink = await pageA.evaluate(() => {
    const a = document.querySelector('a[href*="dealsAnchor"]');
    return a ? a.textContent.trim() : null;
  });
  console.log(`  Deals: ${dealCards} cards, countdown: ${countdownEl}, addBtn: ${addToCanvasBtn}`);
  if (dealCards >= 4) pass('S9-deals', `Deals shows ${dealCards} cards`);
  else                fail('S9-deals', `Only ${dealCards} deal cards`);
  if (countdownEl)    pass('S9-countdown', `Countdown timer: "${countdownEl}"`);
  else                partial('S9-countdown', 'Countdown timer not found');
  if (addToCanvasBtn) pass('S9-addtocv', '"Add to Canvas" button present on deal cards');
  else                fail('S9-addtocv', '"Add to Canvas" button missing');
  if (viewAllLink)    pass('S9-viewall', `"View all deals" link: "${viewAllLink}"`);
  else                partial('S9-viewall', '"View all deals" anchor link not found');

  // ── S10: CATEGORIES GRID ───────────────────────────────────────────────────
  console.log('\n─── S10: CATEGORIES GRID ───');
  await pageA.evaluate(() => document.getElementById('catsSection')?.scrollIntoView());
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s10-catgrid.png` });
  const catCards = await pageA.evaluate(() => document.querySelectorAll('.ct').length);
  const filterBtns = await pageA.evaluate(() => document.querySelectorAll('.fbtn').length);
  console.log(`  Category cards: ${catCards}, filter buttons: ${filterBtns}`);
  if (catCards >= 10) pass('S10-grid', `Categories grid shows ${catCards} categories`);
  else                fail('S10-grid', `Only ${catCards} categories`);
  if (filterBtns >= 5) pass('S10-filters', `${filterBtns} group filter buttons`);
  else                 partial('S10-filters', `Only ${filterBtns} filter buttons`);
  // Click a category card
  await pageA.evaluate(() => document.querySelectorAll('.ct')[0]?.click());
  await wait(2000);
  const catNavUrl = pageA.url();
  await pageA.screenshot({ path: `${OUT}/s10-catgrid-nav.png` });
  if (catNavUrl.includes('/category/')) pass('S10-nav', `Category card navigated → ${catNavUrl}`);
  else                                  fail('S10-nav', `Category card did NOT navigate — URL: ${catNavUrl}`);
  await pageA.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' });
  await wait(1500);

  // ── S11: SPONSORS ──────────────────────────────────────────────────────────
  console.log('\n─── S11: SPONSORS ───');
  await pageA.evaluate(() => {
    const all = Array.from(document.querySelectorAll('section, div'));
    const sp = all.find(d => d.textContent.includes('Uber Eats') || d.textContent.includes('Booking.com'));
    sp?.scrollIntoView();
  });
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s11-sponsors.png` });
  const sponsorText = await pageA.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.find(d => d.textContent.includes('Uber Eats'))?.textContent?.trim().slice(0,30) || null;
  });
  if (sponsorText) pass('S11-sponsors', `Sponsors section found: "${sponsorText}"`);
  else             partial('S11-sponsors', 'Sponsors section not found by text');

  // ── S12: HOW IT WORKS ──────────────────────────────────────────────────────
  console.log('\n─── S12: HOW IT WORKS ───');
  await pageA.evaluate(() => document.getElementById('hiwSection')?.scrollIntoView());
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s12-hiw.png` });
  const hiwImgs = await pageA.evaluate(() => document.querySelectorAll('.hiw-icon-wrap img').length);
  const hiwCtaBtn = await pageA.evaluate(() => !!document.querySelector('.hiw-cta-btn'));
  console.log(`  HIW images: ${hiwImgs}, CTA button: ${hiwCtaBtn}`);
  if (hiwImgs >= 4) pass('S12-hiw-images', `HIW shows ${hiwImgs} real images (not emoji)`);
  else              fail('S12-hiw-images', `HIW only has ${hiwImgs} images — expected 4`);
  if (hiwCtaBtn) pass('S12-cta', 'HIW CTA button present');
  else           partial('S12-cta', 'HIW CTA button not found');

  // ── S13: FOOTER ────────────────────────────────────────────────────────────
  console.log('\n─── S13: FOOTER ───');
  await pageA.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(600);
  await pageA.screenshot({ path: `${OUT}/s13-footer.png` });
  const privacyLink = await pageA.evaluate(() => {
    const a = document.querySelector('a[href="/privacy"], a[href*="privacy"]');
    return a ? a.href : null;
  });
  const termsLink = await pageA.evaluate(() => {
    const a = document.querySelector('a[href="/terms"], a[href*="terms"]');
    return a ? a.href : null;
  });
  const cookieLink = await pageA.evaluate(() => {
    const a = document.querySelector('a[href="/cookies"], a[href*="cookies"]');
    return a ? a.href : null;
  });
  if (privacyLink) pass('S13-privacy', `Privacy link: ${privacyLink}`);
  else             fail('S13-privacy', 'No /privacy link in footer');
  if (termsLink)   pass('S13-terms', `Terms link: ${termsLink}`);
  else             fail('S13-terms', 'No /terms link in footer');
  if (cookieLink)  pass('S13-cookies', `Cookies link: ${cookieLink}`);
  else             fail('S13-cookies', 'No /cookies link in footer');

  // ── CATEGORY PAGE ──────────────────────────────────────────────────────────
  console.log('\n─── SCAN: CATEGORY PAGE ───');
  await pageA.goto(`${BASE}/category/womens-fashion`, { waitUntil: 'networkidle' });
  await wait(2000);
  await pageA.screenshot({ path: `${OUT}/catpage-womens.png` });
  const catProducts = await pageA.evaluate(() => document.querySelectorAll('[draggable="true"]').length);
  const miniCanvasTxt = await pageA.evaluate(() => {
    const el = document.querySelector('[class*="MiniFloating"], [class*="mini-float"]');
    return el ? el.textContent.trim().slice(0, 40) : null;
  });
  const miniDropZone = await pageA.evaluate(() => document.body.innerText.includes('Drop Zone') || document.body.innerText.includes('Open Full Canvas'));
  console.log(`  Cat page products: ${catProducts}, mini: "${miniCanvas}", dropzone: ${miniDropZone}`);
  if (catProducts >= 5) pass('CAT-products', `Category page shows ${catProducts} draggable products`);
  else                  fail('CAT-products', `Category page shows only ${catProducts} products`);
  if (miniDropZone) pass('CAT-mini', 'MiniFloatingCanvas visible on category page');
  else              fail('CAT-mini', 'MiniFloatingCanvas missing on category page');

  // ── LEGAL PAGES ────────────────────────────────────────────────────────────
  console.log('\n─── SCAN: LEGAL PAGES ───');
  await pageA.goto(`${BASE}/privacy`, { waitUntil: 'networkidle' });
  await wait(800);
  const privacyTitle = await pageA.evaluate(() => document.querySelector('h1')?.textContent?.trim());
  await pageA.screenshot({ path: `${OUT}/legal-privacy.png` });
  if (privacyTitle?.includes('Privacy')) pass('LEGAL-privacy', `/privacy: "${privacyTitle}"`);
  else                                    fail('LEGAL-privacy', `/privacy h1: "${privacyTitle}"`);

  await pageA.goto(`${BASE}/terms`, { waitUntil: 'networkidle' });
  await wait(800);
  const termsTitle = await pageA.evaluate(() => document.querySelector('h1')?.textContent?.trim());
  await pageA.screenshot({ path: `${OUT}/legal-terms.png` });
  if (termsTitle?.includes('Terms')) pass('LEGAL-terms', `/terms: "${termsTitle}"`);
  else                                fail('LEGAL-terms', `/terms h1: "${termsTitle}"`);

  await pageA.goto(`${BASE}/cookies`, { waitUntil: 'networkidle' });
  await wait(800);
  const cookiesTitle = await pageA.evaluate(() => document.querySelector('h1')?.textContent?.trim());
  await pageA.screenshot({ path: `${OUT}/legal-cookies.png` });
  if (cookiesTitle?.includes('Cookie')) pass('LEGAL-cookies', `/cookies: "${cookiesTitle}"`);
  else                                   fail('LEGAL-cookies', `/cookies h1: "${cookiesTitle}"`);

  // ── CONSOLE ERRORS SUMMARY ─────────────────────────────────────────────────
  console.log('\n─── CONSOLE ERRORS ───');
  if (consoleErrors.length === 0) {
    console.log('  ✅ No console errors detected');
    pass('CONSOLE', 'No JavaScript errors');
  } else {
    consoleErrors.forEach(e => console.log(`  ❌ ${e}`));
    fail('CONSOLE', `${consoleErrors.length} JS errors: ${consoleErrors.slice(0,2).join(' | ')}`);
  }

  await browser.close();

  // ── FINAL REPORT ───────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  FULL SCAN REPORT — DrawNBuy 16-Section Audit');
  console.log('═══════════════════════════════════════════════════════');
  results.forEach(r => console.log(`${r.status} [${r.id}] ${r.note}`));
  const p = results.filter(r => r.status.includes('PASS')).length;
  const w = results.filter(r => r.status.includes('PARTIAL')).length;
  const f = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`\nResult: ${p} PASS  ${w} PARTIAL  ${f} FAIL  (${results.length} total)`);

  console.log('\n── BUGS TO FIX ──');
  bugs.forEach((b, i) => console.log(`  ${i+1}. [${b.id}] ${b.note}`));

  if (consoleErrors.length) {
    console.log('\n── CONSOLE ERRORS ──');
    consoleErrors.forEach(e => console.log(`  • ${e}`));
  }

  // Write JSON for next phase
  fs.writeFileSync('./scan-results.json', JSON.stringify({ results, bugs, consoleErrors }, null, 2));
  console.log('\nFull results saved to scan-results.json');
  console.log('Screenshots saved to scan-out/');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
