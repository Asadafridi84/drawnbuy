/**
 * DrawNBuy 5-Flow Collab Test Suite
 * Tests live collaboration on https://drawnbuy.vercel.app
 * Run: node test-collab.mjs
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const URL_A = 'https://drawnbuy.vercel.app/?room=test123';
const URL_B = 'https://drawnbuy.vercel.app/?room=test123';
const URL_C = 'https://drawnbuy.vercel.app/?room=otherroom';

const OUT = './test-screenshots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const results = [];

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function pass(test, note) { results.push({ test, status: '✅ PASS', note }); log(`PASS: ${test} — ${note}`); }
function fail(test, note) { results.push({ test, status: '❌ FAIL', note }); log(`FAIL: ${test} — ${note}`); }

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ── SETUP: Two contexts = two independent socket connections ──────────────
  const ctxA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const ctxB = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  log('Navigating Context A → ' + URL_A);
  await pageA.goto(URL_A, { waitUntil: 'networkidle' });
  log('Navigating Context B → ' + URL_B);
  await pageB.goto(URL_B, { waitUntil: 'networkidle' });

  // Give socket connections time to join the room
  await wait(3000);

  await pageA.screenshot({ path: `${OUT}/00-setup-contextA.png`, fullPage: false });
  await pageB.screenshot({ path: `${OUT}/00-setup-contextB.png`, fullPage: false });
  log('Baseline screenshots saved');

  // ── Check socket connected on both pages ─────────────────────────────────
  const socketAConnected = await pageA.evaluate(() => {
    // Check if CollabCanvas rendered (has canvas element)
    return !!document.querySelector('canvas[data-canvas-id="main-collab"]');
  });
  const socketBConnected = await pageB.evaluate(() => {
    return !!document.querySelector('canvas[data-canvas-id="main-collab"]');
  });
  log(`Canvas A present: ${socketAConnected}, Canvas B present: ${socketBConnected}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: Product drag sync
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n=== TEST 1: Product drag sync ===');
  try {
    // DragStrip items live inside overflow:hidden — scrollIntoViewIfNeeded times out.
    // Instead: scroll the CollabCanvas into view (already visible from setup), then
    // dispatch a synthetic drop event directly on the canvas container with the exact
    // payload that useProductDrop expects: application/drawnbuy-product JSON.
    await pageA.evaluate(() => {
      const el = document.getElementById('collabSection');
      if (el) el.scrollIntoView({ block: 'center' });
    });
    await wait(500);

    const canvas = await pageA.$('canvas[data-canvas-id="main-collab"]');
    if (!canvas) throw new Error('main-collab canvas not found on pageA');
    await canvas.scrollIntoViewIfNeeded();
    await wait(400);
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('canvas.boundingBox() returned null');

    log(`Canvas bounding box: (${Math.round(canvasBox.x)},${Math.round(canvasBox.y)}) ${Math.round(canvasBox.width)}×${Math.round(canvasBox.height)}`);

    // Drop target coordinates — centre of canvas (in viewport coordinates)
    const dstX = canvasBox.x + canvasBox.width  * 0.5;
    const dstY = canvasBox.y + canvasBox.height * 0.4;

    const dropResult = await pageA.evaluate(([dstX, dstY]) => {
      // Find the container that has the onDrop React handler.
      // In CollabCanvas the structure is: .cv-area > div[ref=canvasContainerRef] > canvas
      const cvArea = document.querySelector('.cv-area');
      const cvContainer = cvArea
        ? (cvArea.querySelector('[onDrop]') || cvArea.querySelector('div') || cvArea)
        : document.querySelector('canvas[data-canvas-id="main-collab"]')?.parentElement;

      if (!cvContainer && !cvArea) return 'no-drop-target';

      const target = cvContainer || cvArea;

      const dt = new DataTransfer();
      dt.setData('application/drawnbuy-product', JSON.stringify({
        name: 'Air Max Collab', price: '899 kr',
        img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
        url: 'https://amazon.com',
      }));

      target.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: dstX, clientY: dstY }));
      target.dispatchEvent(new DragEvent('dragover',  { bubbles: true, cancelable: true, dataTransfer: dt, clientX: dstX, clientY: dstY }));
      target.dispatchEvent(new DragEvent('drop',      { bubbles: true, cancelable: true, dataTransfer: dt, clientX: dstX, clientY: dstY }));

      return `dispatched-to:${target.className || target.tagName}`;
    }, [dstX, dstY]);
    log(`Drag dispatch: ${dropResult}`);

    await wait(3500); // socket round-trip to server + broadcast to B

    await pageA.screenshot({ path: `${OUT}/01-test1-contextA-after-drop.png` });
    await pageB.screenshot({ path: `${OUT}/01-test1-contextB-after-drop.png` });

    // Check B for: (a) toast notification, (b) overlay product cards
    const evidenceB = await pageB.evaluate(() => {
      const text = document.body.innerText;
      const cvArea = document.querySelector('.cv-area');
      const overlayCards = cvArea ? cvArea.querySelectorAll('[style*="position: absolute"]').length : 0;
      return {
        hasPlacedToast: text.includes('placed'),
        hasAirMax: text.includes('Air Max'),
        overlayCards,
        toastText: (document.querySelector('[class*="toast"], [id*="toast"]') || {}).textContent?.trim() || '',
      };
    });
    log(`Evidence in B: ${JSON.stringify(evidenceB)}`);

    if (evidenceB.overlayCards > 0 || evidenceB.hasPlacedToast || evidenceB.hasAirMax) {
      pass('Test 1 — Product drag sync', `B: overlayCards=${evidenceB.overlayCards} hasPlacedToast=${evidenceB.hasPlacedToast} hasAirMax=${evidenceB.hasAirMax}`);
    } else {
      fail('Test 1 — Product drag sync', `B shows no evidence: ${JSON.stringify(evidenceB)} (dispatch=${dropResult})`);
    }
  } catch (e) {
    fail('Test 1 — Product drag sync', `Exception: ${e.message}`);
    await pageA.screenshot({ path: `${OUT}/01-test1-ERROR.png` }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: Drawing sync
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n=== TEST 2: Drawing sync ===');
  try {
    // Scroll the canvas into view on BOTH pages
    await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView({ block: 'center' }));
    await pageB.evaluate(() => document.getElementById('collabSection')?.scrollIntoView({ block: 'center' }));
    await wait(600);

    const canvas = await pageA.$('canvas[data-canvas-id="main-collab"]');
    if (!canvas) throw new Error('Canvas not found on pageA');
    await canvas.scrollIntoViewIfNeeded();
    await wait(400);
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas.boundingBox() null even after scrollIntoViewIfNeeded');
    log(`Canvas A bounding box: x=${Math.round(box.x)} y=${Math.round(box.y)} w=${Math.round(box.width)} h=${Math.round(box.height)}`);

    // Pixel counter: check ALPHA channel (transparent = undrawn, opaque = drawn stroke)
    const countPainted = `() => {
      const c = document.querySelector('canvas[data-canvas-id="main-collab"]');
      if (!c) return -1;
      const ctx = c.getContext('2d');
      // Sample a horizontal strip at ~40% height, from 20% to 80% width
      const x = Math.floor(c.width * 0.2);
      const y = Math.floor(c.height * 0.4);
      const w = Math.floor(c.width * 0.6);
      const data = ctx.getImageData(x, y, w, 1).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4) { if (data[i] > 10) painted++; }
      return painted;
    }`;

    const pixelsBefore = await pageB.evaluate(eval(`(${countPainted})`));
    log(`Painted pixels BEFORE draw in B: ${pixelsBefore}`);

    // Draw a horizontal line across the canvas (40% down) — in VIEWPORT coords
    const startX = box.x + box.width * 0.2;
    const startY = box.y + box.height * 0.4;
    const endX   = box.x + box.width * 0.8;
    const endY   = startY;

    // Verify we're within viewport
    const vpSize = await pageA.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
    log(`Viewport: ${vpSize.w}×${vpSize.h}  Drawing from (${Math.round(startX)},${Math.round(startY)}) to (${Math.round(endX)},${Math.round(endY)})`);

    if (startY > vpSize.h) {
      throw new Error(`Canvas still below viewport after scroll: startY=${Math.round(startY)} > vpH=${vpSize.h}`);
    }

    await pageA.mouse.move(startX, startY);
    await pageA.mouse.down();
    for (let i = 1; i <= 30; i++) {
      await pageA.mouse.move(startX + (endX - startX) * (i / 30), startY);
      await wait(15);
    }
    await pageA.mouse.up();
    log('Draw complete on A');

    await wait(3000);

    await pageA.screenshot({ path: `${OUT}/02-test2-contextA-after-draw.png` });
    await pageB.screenshot({ path: `${OUT}/02-test2-contextB-after-draw.png` });

    const pixelsAfter = await pageB.evaluate(eval(`(${countPainted})`));
    log(`Painted pixels AFTER draw in B: ${pixelsAfter}`);

    if (pixelsAfter > pixelsBefore) {
      pass('Test 2 — Drawing sync', `Canvas B gained ${pixelsAfter - pixelsBefore} painted pixels (alpha > 10) after draw in A`);
    } else {
      fail('Test 2 — Drawing sync', `Canvas B unchanged: before=${pixelsBefore} after=${pixelsAfter} — sendDraw may not be emitting or socket not joined`);
    }
  } catch (e) {
    fail('Test 2 — Drawing sync', `Exception: ${e.message}`);
    await pageA.screenshot({ path: `${OUT}/02-test2-ERROR.png` }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: Chat sync
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n=== TEST 3: Chat sync ===');
  try {
    const msg = 'Hello from Context A — collab test ' + Date.now();

    // Find chat textarea in pageA
    const textarea = await pageA.$('textarea.cinp');
    if (!textarea) throw new Error('Chat textarea (.cinp) not found in pageA');

    await textarea.click();
    await textarea.fill(msg);
    await pageA.keyboard.press('Enter');
    log(`Sent chat message from A: "${msg}"`);

    await wait(2500);

    await pageA.screenshot({ path: `${OUT}/03-test3-contextA-chat-sent.png` });
    await pageB.screenshot({ path: `${OUT}/03-test3-contextB-chat-received.png` });

    // Look for the message in pageB
    const msgInB = await pageB.evaluate((m) => {
      return document.body.innerText.includes(m.slice(0, 30));
    }, msg);

    if (msgInB) {
      pass('Test 3 — Chat sync', `Message "${msg.slice(0,30)}..." appeared in Context B`);
    } else {
      fail('Test 3 — Chat sync', `Message not found in Context B body text`);
    }
  } catch (e) {
    fail('Test 3 — Chat sync', `Exception: ${e.message}`);
    await pageB.screenshot({ path: `${OUT}/03-test3-ERROR.png` });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: Room isolation
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n=== TEST 4: Room isolation ===');
  try {
    const ctxC = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC = await ctxC.newPage();
    await pageC.goto(URL_C, { waitUntil: 'networkidle' });
    await wait(2000);

    await pageC.screenshot({ path: `${OUT}/04-test4-contextC-otherroom.png` });

    // Context C is in a different room — its canvas should be empty (no strokes from test123)
    const pixelsC = await pageC.evaluate(() => {
      const c = document.querySelector('canvas[data-canvas-id="main-collab"]');
      if (!c) return -1;
      const ctx = c.getContext('2d');
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let nonEmpty = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) nonEmpty++;
      }
      return nonEmpty;
    });
    log(`Context C (otherroom) canvas non-empty pixels: ${pixelsC}`);

    if (pixelsC === 0) {
      pass('Test 4 — Room isolation', 'Context C (otherroom) canvas is empty — no bleed from test123');
    } else if (pixelsC < 0) {
      fail('Test 4 — Room isolation', 'Canvas not found on pageC');
    } else {
      fail('Test 4 — Room isolation', `Context C canvas has ${pixelsC} non-empty pixels — room bleed detected`);
    }
    await ctxC.close();
  } catch (e) {
    fail('Test 4 — Room isolation', `Exception: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 5: Catch-up on join
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n=== TEST 5: Catch-up on join ===');
  try {
    // Drop a product in pageA so there's something to catch up
    const canvas = await pageA.$('canvas[data-canvas-id="main-collab"]');
    const canvasBox = await canvas.boundingBox();

    await pageA.evaluate(([dstX, dstY]) => {
      const dt = new DataTransfer();
      dt.setData('application/drawnbuy-product', JSON.stringify({
        name: 'Catch-Up Sneaker', price: '999 kr',
        img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
        url: 'https://amazon.com'
      }));
      const cvArea = document.querySelector('.cv-area') || document.querySelector('canvas[data-canvas-id="main-collab"]')?.parentElement;
      if (!cvArea) return;
      cvArea.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: dstX, clientY: dstY }));
      cvArea.dispatchEvent(new DragEvent('drop',     { bubbles: true, cancelable: true, dataTransfer: dt, clientX: dstX, clientY: dstY }));
    }, [canvasBox.x + 300, canvasBox.y + 150]);

    await wait(3000); // let server store it

    // Now open fresh Context D (late joiner)
    const ctxD = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageD = await ctxD.newPage();
    await pageD.goto(URL_A, { waitUntil: 'networkidle' });
    await wait(4000); // wait for canvas-state + product-state replay

    await pageD.screenshot({ path: `${OUT}/05-test5-contextD-fresh-join.png` });

    // Check pixels on D's canvas — should have strokes from Test 2 at minimum
    const pixelsD = await pageD.evaluate(() => {
      const c = document.querySelector('canvas[data-canvas-id="main-collab"]');
      if (!c) return -1;
      const ctx = c.getContext('2d');
      // Use alpha channel: painted pixels have alpha > 0
      const x = Math.floor(c.width * 0.2);
      const y = Math.floor(c.height * 0.4);
      const w = Math.floor(c.width * 0.6);
      const data = ctx.getImageData(x, y, w, 1).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4) { if (data[i] > 10) painted++; }
      return painted;
    });

    // Check product cards in D's overlay
    const cardsD = await pageD.evaluate(() => {
      const overlays = document.querySelectorAll('[data-card-id], [style*="position: absolute"][style*="border-radius"]');
      return { count: overlays.length, html: document.querySelector('#collabSection')?.innerHTML?.slice(0, 500) || '' };
    });
    log(`Context D catch-up: canvas non-white pixels=${pixelsD}, overlay elements=${cardsD.count}`);

    if (pixelsD > 0) {
      pass('Test 5 — Catch-up on join', `Context D received canvas state: ${pixelsD} non-white pixels (draw strokes replayed)`);
    } else {
      fail('Test 5 — Catch-up on join', `Context D canvas empty after join — canvas-state event not working (pixelsD=${pixelsD})`);
    }
    await ctxD.close();
  } catch (e) {
    fail('Test 5 — Catch-up on join', `Exception: ${e.message}`);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  await ctxA.close();
  await ctxB.close();
  await browser.close();

  // ── Final Report ──────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('   DrawNBuy 5-Flow Test Report');
  console.log('════════════════════════════════════════');
  for (const r of results) {
    console.log(`${r.status}  ${r.test}`);
    console.log(`        ${r.note}`);
  }
  console.log('════════════════════════════════════════');
  console.log(`Screenshots saved to: ${OUT}/`);
  const passed = results.filter(r => r.status.includes('PASS')).length;
  const failed = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`Result: ${passed}/${results.length} passed, ${failed} failed`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
