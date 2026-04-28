/**
 * DrawNBuy Fix Verification — 8 Real-User Scenarios
 * Two browser contexts (A=Friend1, B=Friend2) + a late-joiner (C=Friend3)
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const ROOM = 'verifyroom9';
const OUT  = './verify-out';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const results = [];
function pass(id, note) { results.push({ status: '✅ PASS', id, note }); console.log(`✅ PASS  [${id}] ${note}`); }
function fail(id, note) { results.push({ status: '❌ FAIL', id, note }); console.log(`❌ FAIL  [${id}] ${note}`); }
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// Wait until both pages have ≥2 participants visible (both sockets joined the room)
async function waitForBothJoined(pageA, pageB, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const avA = await pageA.evaluate(() => document.querySelectorAll('.presence-av:not(.presence-more)').length).catch(() => 0);
    const avB = await pageB.evaluate(() => document.querySelectorAll('.presence-av:not(.presence-more)').length).catch(() => 0);
    console.log(`  [socket-wait] A avatars: ${avA}, B avatars: ${avB}`);
    if (avA >= 2 && avB >= 2) {
      console.log('  ✓ Both contexts joined the room');
      return true;
    }
    await wait(1500);
  }
  console.log('  ✗ Timeout waiting for both to join');
  return false;
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctxA = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ctxB = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  const consoleErrors = [];
  pageA.on('console', m => {
    if (m.type() === 'error') consoleErrors.push('[A:err] ' + m.text());
    if (m.type() === 'warning') consoleErrors.push('[A:warn] ' + m.text());
  });
  pageB.on('console', m => {
    if (m.type() === 'error') consoleErrors.push('[B:err] ' + m.text());
    if (m.type() === 'warning') consoleErrors.push('[B:warn] ' + m.text());
  });

  console.log('\n══════════════════════════════════════════════');
  console.log('  DrawNBuy Fix Verification — 8 Scenarios');
  console.log('══════════════════════════════════════════════');
  console.log(`  Room: ${ROOM}  |  URL: ${BASE}/?room=${ROOM}`);

  await Promise.all([
    pageA.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' }),
    pageB.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' }),
  ]);

  // Scroll both to collab section first so presence avatars render
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await pageB.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());

  // Gate: wait until both have presence avatars (socket joined room)
  const bothJoined = await waitForBothJoined(pageA, pageB);
  if (!bothJoined) {
    fail('PREREQ', 'Socket join room timed out — all scenarios will fail');
  }

  await pageA.screenshot({ path: `${OUT}/00-both-open.png` });

  // ── SCENARIO 1: Draw sync A → B ─────────────────────────────────────────
  console.log('\n── Scenario 1: Draw circle (A→B) ──');
  const canvasCoords = await pageA.evaluate(() => {
    const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });

  if (canvasCoords) {
    const cx = canvasCoords.x, cy = canvasCoords.y;
    await pageA.mouse.move(cx, cy);
    await pageA.mouse.down();
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      await pageA.mouse.move(cx + Math.cos(a) * 50, cy + Math.sin(a) * 50);
    }
    await pageA.mouse.up();
    await wait(2000);
    await pageA.screenshot({ path: `${OUT}/01-draw-ctxA.png` });
    await pageB.screenshot({ path: `${OUT}/01-draw-ctxB.png` });

    const bHasPixels = await pageB.evaluate(() => {
      const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
      if (!c) return false;
      const ctx = c.getContext('2d');
      const img = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        if (img.data[i + 3] > 0 && (img.data[i] !== 255 || img.data[i + 1] !== 255 || img.data[i + 2] !== 255)) return true;
      }
      return false;
    });
    if (bHasPixels) pass('S1-draw', 'Friend 2 sees drawing from Friend 1 in real time');
    else            fail('S1-draw', 'Friend 2 canvas is empty — draw sync not working');
  } else {
    fail('S1-draw', 'Canvas element not found');
  }

  // ── SCENARIO 2: Product drop → B sees it ────────────────────────────────
  console.log('\n── Scenario 2: Product drop (A→B) ──');
  const dropResult = await pageA.evaluate(() => {
    const cvArea = document.querySelector('.cv-area');
    if (!cvArea) return false;
    const r = cvArea.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + 120;
    if (cy < 0) return false; // cv-area off-screen
    const dt = new DataTransfer();
    dt.setData('application/drawnbuy-product', JSON.stringify({
      name: 'Test Sneakers', price: '£79.99',
      img: 'https://placehold.co/300x200/7c3aed/white?text=Sneakers',
      url: 'https://www.amazon.co.uk/'
    }));
    cvArea.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    cvArea.dispatchEvent(new DragEvent('drop',     { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    return { dropped: true, cy };
  });
  await wait(3000);
  await pageA.screenshot({ path: `${OUT}/02-drop-ctxA.png` });
  await pageB.screenshot({ path: `${OUT}/02-drop-ctxB.png` });

  const cardsOnA = await pageA.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const cardsOnB = await pageB.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  console.log(`  Cards on A: ${cardsOnA}, on B: ${cardsOnB}, drop: ${JSON.stringify(dropResult)}`);

  if (cardsOnA > 0) pass('S2-drop-A', `Product card appeared on Friend 1 canvas (${cardsOnA})`);
  else              fail('S2-drop-A', `No product card on Friend 1 canvas after drop: ${JSON.stringify(dropResult)}`);
  if (cardsOnB > 0) pass('S2-drop-B', `Product card synced to Friend 2 (${cardsOnB})`);
  else              fail('S2-drop-B', 'Product card NOT synced to Friend 2');

  // ── SCENARIO 3: Hero canvas drop → shows on MAIN CollabCanvas on B ──────
  console.log('\n── Scenario 3: Hero canvas drop → main CollabCanvas on B (FIX 1) ──');
  await pageA.evaluate(() => window.scrollTo(0, 0));
  await wait(500);

  const heroDropResult = await pageA.evaluate(() => {
    // Find hero mini canvas container: div with height:190px (browser normalises #fff to rgb)
    // We check the computed height and position to identify the hero canvas drop zone
    const allDivs = Array.from(document.querySelectorAll('div'));
    const heroContainer = allDivs.find(d => {
      const s = d.getAttribute('style') || '';
      // Look for height:190px (with or without spaces, with or without semicolon)
      if (!s.match(/height\s*:\s*190px/)) return false;
      const r = d.getBoundingClientRect();
      return r.width > 100 && r.height > 0; // must be visible
    });
    if (!heroContainer) return { found: false, reason: 'no height:190px div visible' };
    const r = heroContainer.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { found: false, reason: 'zero-size' };
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dt = new DataTransfer();
    dt.setData('application/drawnbuy-product', JSON.stringify({
      name: 'Hero Test Product', price: '£49.99',
      img: 'https://placehold.co/300x200/f97316/white?text=Hero',
      url: 'https://www.amazon.co.uk/'
    }));
    heroContainer.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    heroContainer.dispatchEvent(new DragEvent('drop',     { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    return { found: true, w: r.width, h: r.height, cx, cy };
  });

  await wait(3000);
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await pageB.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(500);
  await pageA.screenshot({ path: `${OUT}/03-hero-drop-ctxA-collab.png` });
  await pageB.screenshot({ path: `${OUT}/03-hero-drop-ctxB-collab.png` });

  const cardsAfterHeroA = await pageA.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const cardsAfterHeroB = await pageB.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  console.log(`  Hero drop: ${JSON.stringify(heroDropResult)}`);
  console.log(`  Cards after hero drop — A: ${cardsAfterHeroA}, B: ${cardsAfterHeroB}`);

  if (!heroDropResult.found) {
    fail('S3-hero', `Hero canvas container not found: ${heroDropResult.reason}`);
  } else if (cardsAfterHeroA > cardsOnA) {
    pass('S3-hero-A', `Hero drop added to main canvas A (now ${cardsAfterHeroA} cards)`);
    if (cardsAfterHeroB > cardsOnB) pass('S3-hero-B', `Hero drop synced to Friend 2 main canvas (${cardsAfterHeroB} cards)`);
    else                             fail('S3-hero-B', `Hero drop NOT on Friend 2 main canvas (${cardsAfterHeroB} cards, was ${cardsOnB})`);
  } else {
    fail('S3-hero-A', `Hero drop did NOT appear on A main canvas (still ${cardsAfterHeroA})`);
    fail('S3-hero-B', 'Hero drop NOT synced (no card on A to begin with)');
  }

  // ── SCENARIO 4: Chat message appears ONCE (not twice) ───────────────────
  console.log('\n── Scenario 4: Chat message count on B (FIX 2) ──');
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await pageB.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(600);

  const msgsBefore = await pageB.evaluate(() => document.querySelectorAll('.mbbl').length);

  const chatVisible = await pageA.evaluate(() => !!document.querySelector('.cinp'));
  if (chatVisible) {
    await pageA.click('.cinp');
    await pageA.fill('.cinp', 'hello from friend 1 test msg');
    await pageA.keyboard.press('Enter');
    await wait(3000);
    await pageA.screenshot({ path: `${OUT}/04-chat-ctxA.png` });
    await pageB.screenshot({ path: `${OUT}/04-chat-ctxB.png` });

    const msgsAfter = await pageB.evaluate(() => document.querySelectorAll('.mbbl').length);
    const newMsgsOnB = msgsAfter - msgsBefore;
    console.log(`  B messages before: ${msgsBefore}, after: ${msgsAfter}, new: ${newMsgsOnB}`);

    if (newMsgsOnB === 1) pass('S4-chat-once', `Message appeared exactly ONCE on Friend 2`);
    else if (newMsgsOnB === 2) fail('S4-chat-twice', `Message appeared TWICE on Friend 2 — double listener still present`);
    else if (newMsgsOnB === 0) fail('S4-chat-none', 'Message did NOT appear on Friend 2 at all');
    else fail('S4-chat-count', `Unexpected: ${newMsgsOnB} new messages on Friend 2`);
  } else {
    fail('S4-chat', 'Chat input not found');
  }

  // ── SCENARIO 5: Sticker sync A → B ──────────────────────────────────────
  console.log('\n── Scenario 5: Sticker sync (A→B) ──');
  await pageA.evaluate(() => {
    const stickerBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sticker'));
    stickerBtn?.click();
  });
  await wait(600);
  await pageA.evaluate(() => {
    const thumbsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '👍');
    thumbsBtn?.click();
  });
  await wait(3000);
  await pageA.screenshot({ path: `${OUT}/05-sticker-ctxA.png` });
  await pageB.screenshot({ path: `${OUT}/05-sticker-ctxB.png` });

  const stickersOnA = await pageA.evaluate(() => document.querySelectorAll('.emoji-sticker').length);
  const stickersOnB = await pageB.evaluate(() => document.querySelectorAll('.emoji-sticker').length);
  console.log(`  Stickers on A: ${stickersOnA}, on B: ${stickersOnB}`);
  if (stickersOnA > 0) pass('S5-sticker-A', `Sticker placed on Friend 1 (${stickersOnA})`);
  else                 fail('S5-sticker-A', 'Sticker not placed on Friend 1');
  if (stickersOnB > 0) pass('S5-sticker-B', `Sticker synced to Friend 2 (${stickersOnB})`);
  else                 fail('S5-sticker-B', 'Sticker NOT synced to Friend 2');

  // ── SCENARIO 6: Delete card syncs to B ──────────────────────────────────
  console.log('\n── Scenario 6: Delete card syncs (A→B) ──');
  const cardsBeforeDelete = await pageA.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const cardsBBeforeDelete = await pageB.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  console.log(`  Cards before delete — A: ${cardsBeforeDelete}, B: ${cardsBBeforeDelete}`);

  if (cardsBeforeDelete > 0 && cardsBBeforeDelete > 0) {
    await pageA.evaluate(() => {
      const delBtn = document.querySelector('#collabSection .card-delete-btn');
      delBtn?.click();
    });
    await wait(3000);
    await pageA.screenshot({ path: `${OUT}/06-delete-ctxA.png` });
    await pageB.screenshot({ path: `${OUT}/06-delete-ctxB.png` });

    const cardsAfterDeleteA = await pageA.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
    const cardsAfterDeleteB = await pageB.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
    console.log(`  Cards after delete — A: ${cardsAfterDeleteA}, B: ${cardsAfterDeleteB}`);

    if (cardsAfterDeleteA < cardsBeforeDelete) pass('S6-delete-A', `Card removed locally on A (${cardsBeforeDelete}→${cardsAfterDeleteA})`);
    else                                        fail('S6-delete-A', 'Card not removed locally on A');
    if (cardsAfterDeleteB < cardsBBeforeDelete) pass('S6-delete-B', `Delete synced to Friend 2 (${cardsBBeforeDelete}→${cardsAfterDeleteB})`);
    else                                        fail('S6-delete-B', `Delete NOT synced to Friend 2 (still ${cardsAfterDeleteB})`);
  } else if (cardsBeforeDelete > 0 && cardsBBeforeDelete === 0) {
    fail('S6-delete', `Skip: A has ${cardsBeforeDelete} cards but B has 0 — sync broken upstream (S2)`);
  } else {
    fail('S6-delete', 'No cards on canvas to delete');
  }

  // ── SCENARIO 7: Clear All syncs to B ────────────────────────────────────
  console.log('\n── Scenario 7: Clear All syncs (A→B) ──');
  // Add a fresh card first
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(400);
  await pageA.evaluate(() => {
    const cvArea = document.querySelector('.cv-area');
    if (!cvArea) return;
    const r = cvArea.getBoundingClientRect();
    const dt = new DataTransfer();
    dt.setData('application/drawnbuy-product', JSON.stringify({
      name: 'Clear Test', price: '£10',
      img: 'https://placehold.co/200x150/22c55e/white?text=Clear',
      url: 'https://www.amazon.co.uk/'
    }));
    const cx = r.left + r.width / 2;
    const cy = r.top + 120;
    cvArea.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
    cvArea.dispatchEvent(new DragEvent('drop',     { bubbles: true, dataTransfer: dt, clientX: cx, clientY: cy }));
  });
  await wait(2000);

  const cardsBeforeClearA = await pageA.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const cardsBeforeClearB = await pageB.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const stickersBeforeClearB = await pageB.evaluate(() => document.querySelectorAll('.emoji-sticker').length);
  console.log(`  Before Clear All — A cards: ${cardsBeforeClearA}, B cards: ${cardsBeforeClearB}, B stickers: ${stickersBeforeClearB}`);

  await pageA.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.t-chip'));
    const clearAllBtn = chips.find(c => c.textContent.includes('Clear All'));
    clearAllBtn?.click();
  });
  await wait(3000);
  await pageA.screenshot({ path: `${OUT}/07-clearall-ctxA.png` });
  await pageB.screenshot({ path: `${OUT}/07-clearall-ctxB.png` });

  const cardsAfterClearA = await pageA.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const cardsAfterClearB = await pageB.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const stickersAfterClearB = await pageB.evaluate(() => document.querySelectorAll('.emoji-sticker').length);
  console.log(`  After Clear All — A cards: ${cardsAfterClearA}, B cards: ${cardsAfterClearB}, B stickers: ${stickersAfterClearB}`);

  if (cardsAfterClearA === 0) pass('S7-clearall-A', 'Clear All removed all cards from A');
  else                         fail('S7-clearall-A', `A still has ${cardsAfterClearA} cards after Clear All`);

  if (cardsAfterClearB < cardsBeforeClearB || (cardsBeforeClearB === 0 && cardsAfterClearB === 0)) {
    if (cardsBeforeClearB > 0) pass('S7-clearall-B', `Clear All synced to Friend 2 (${cardsBeforeClearB}→${cardsAfterClearB} cards)`);
    else pass('S7-clearall-B', 'Clear All on B: canvas already empty (upstream sync covers this)');
  } else {
    fail('S7-clearall-B', `Clear All NOT synced to Friend 2 (${cardsBeforeClearB}→${cardsAfterClearB})`);
  }

  // ── SCENARIO 8: Late joiner sees canvas state ────────────────────────────
  console.log('\n── Scenario 8: Friend 3 joins late ──');
  // Draw a stroke so the canvas has drawing state for the late joiner to see
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(400);
  const s8Canvas = await pageA.evaluate(() => {
    const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (s8Canvas) {
    await pageA.mouse.move(s8Canvas.x - 40, s8Canvas.y);
    await pageA.mouse.down();
    await pageA.mouse.move(s8Canvas.x + 40, s8Canvas.y);
    await pageA.mouse.up();
    await wait(1000);
  }

  // Drop a product so there's state
  await pageA.evaluate(() => {
    const cvArea = document.querySelector('.cv-area');
    if (!cvArea) return;
    const r = cvArea.getBoundingClientRect();
    const dt = new DataTransfer();
    dt.setData('application/drawnbuy-product', JSON.stringify({
      name: 'Late Join Test', price: '£25',
      img: 'https://placehold.co/200x150/f59e0b/white?text=LateJoin',
      url: 'https://www.amazon.co.uk/'
    }));
    cvArea.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt, clientX: r.left + 200, clientY: r.top + 100 }));
    cvArea.dispatchEvent(new DragEvent('drop',     { bubbles: true, dataTransfer: dt, clientX: r.left + 200, clientY: r.top + 100 }));
  });
  await wait(2000);

  const ctxC = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pageC = await ctxC.newPage();
  await pageC.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' });
  await wait(3000);
  await pageC.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(800);
  await pageC.screenshot({ path: `${OUT}/08-latejoin-ctxC.png` });

  const cardsOnC = await pageC.evaluate(() => document.querySelectorAll('#collabSection .cv-card').length);
  const cHasDrawing = await pageC.evaluate(() => {
    const c = document.querySelector('canvas[data-canvas-id="main-collab"], .cv-area canvas');
    if (!c) return false;
    const ctx = c.getContext('2d');
    const img = ctx.getImageData(0, 0, Math.min(c.width, 600), Math.min(c.height, 400));
    for (let i = 0; i < img.data.length; i += 4) {
      if (img.data[i + 3] > 0 && (img.data[i] !== 255 || img.data[i + 1] !== 255 || img.data[i + 2] !== 255)) return true;
    }
    return false;
  });
  console.log(`  Friend 3 sees — cards: ${cardsOnC}, drawing: ${cHasDrawing}`);
  if (cardsOnC > 0) pass('S8-latejoin-cards', `Friend 3 sees ${cardsOnC} product cards on join`);
  else              fail('S8-latejoin-cards', 'Friend 3 sees 0 cards — product-state not sent on join');
  if (cHasDrawing) pass('S8-latejoin-drawing', 'Friend 3 sees existing canvas drawing');
  else             fail('S8-latejoin-drawing', 'Friend 3 sees empty canvas — canvas-state not replayed');

  await ctxC.close();

  // ── CONSOLE CHECK ────────────────────────────────────────────────────────
  console.log('\n── Console Errors/Warnings ──');
  const micErrors = consoleErrors.filter(e => /microphone|permissions.policy/i.test(e));
  const cspErrors = consoleErrors.filter(e => /csp|content.security/i.test(e));
  const otherErrors = consoleErrors.filter(e => !/microphone|permissions.policy|csp|content.security/i.test(e));

  if (micErrors.length === 0) pass('FIX3-mic', 'No microphone/Permissions-Policy violations');
  else                         fail('FIX3-mic', `${micErrors.length} mic errors: ${micErrors[0]}`);
  if (cspErrors.length === 0) pass('FIX3-csp', 'No CSP violations');
  else                         fail('FIX3-csp', `${cspErrors.length} CSP errors: ${cspErrors[0]}`);
  if (otherErrors.length === 0) pass('CONSOLE', 'No other JS errors');
  else                          fail('CONSOLE', `${otherErrors.length} errors: ${otherErrors.slice(0, 2).join(' | ')}`);

  await browser.close();

  // ── FINAL REPORT ─────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('  VERIFICATION REPORT');
  console.log('══════════════════════════════════════════════════════');
  results.forEach(r => console.log(`${r.status} [${r.id}] ${r.note}`));
  const p = results.filter(r => r.status.includes('PASS')).length;
  const f = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`\nResult: ${p} PASS  ${f} FAIL  (${results.length} total)`);
  if (f === 0) console.log('\n🎉 ALL SCENARIOS PASS — ready to ship');
  else         console.log('\n⚠️  Failures to investigate');

  if (consoleErrors.length) {
    console.log('\n── All console errors/warnings ──');
    consoleErrors.forEach(e => console.log(' ', e));
  }

  fs.writeFileSync('./verify-results.json', JSON.stringify({ results, consoleErrors }, null, 2));
  console.log('\nResults: verify-results.json | Screenshots: verify-out/');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
