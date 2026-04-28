/**
 * Socket connection diagnostic — checks if both contexts connect and receive events
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const ROOM = 'diagroom7';
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctxA = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ctxB = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  const logsA = [], logsB = [], errA = [], errB = [];
  pageA.on('console', m => logsA.push(`[${m.type()}] ${m.text()}`));
  pageB.on('console', m => logsB.push(`[${m.type()}] ${m.text()}`));
  pageA.on('pageerror', e => errA.push(e.message));
  pageB.on('pageerror', e => errB.push(e.message));

  console.log('Loading both pages...');
  await Promise.all([
    pageA.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' }),
    pageB.goto(`${BASE}/?room=${ROOM}`, { waitUntil: 'networkidle' }),
  ]);

  // Check participants every 2s for up to 20s
  for (let i = 0; i < 10; i++) {
    await wait(2000);
    const participantsA = await pageA.evaluate(() => {
      try {
        const { useCollabStore } = window.__zustand__ || {};
        // Try to read participant count from DOM
        const badge = document.querySelector('.live-count-badge');
        if (badge) return badge.textContent.trim();
        return null;
      } catch { return null; }
    });
    const participantsDOM = await pageA.evaluate(() => {
      const badge = document.querySelector('.live-count-badge');
      return badge ? badge.textContent.trim() : 'not found';
    });
    console.log(`[${(i+1)*2}s] A participants badge: "${participantsDOM}"`);

    // Check if socket connected by looking for console logs
    const socketLogs = logsA.filter(l => l.includes('[socket]'));
    if (socketLogs.length > 0) {
      console.log('  A socket logs:', socketLogs.join(' | '));
    }

    // Check if B got any socket events
    const bSocketLogs = logsB.filter(l => l.includes('[socket]'));
    if (bSocketLogs.length > 0) {
      console.log('  B socket logs:', bSocketLogs.join(' | '));
    }

    if (socketLogs.some(l => l.includes('connected'))) {
      console.log('  ✓ A socket connected');
      break;
    }
  }

  // Print all socket-related logs
  console.log('\n=== Context A logs ===');
  logsA.forEach(l => console.log(' ', l));
  console.log('\n=== Context B logs ===');
  logsB.forEach(l => console.log(' ', l));
  if (errA.length) { console.log('\n=== A Page Errors ==='); errA.forEach(e => console.log(' ', e)); }
  if (errB.length) { console.log('\n=== B Page Errors ==='); errB.forEach(e => console.log(' ', e)); }

  // Check participant count on both after waiting
  await pageA.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await pageB.evaluate(() => document.getElementById('collabSection')?.scrollIntoView());
  await wait(1000);

  const participantsA = await pageA.evaluate(() => {
    const badge = document.querySelector('.live-count-badge');
    const avatars = document.querySelectorAll('.presence-av:not(.presence-more)');
    return { badge: badge?.textContent?.trim(), avatarCount: avatars.length };
  });
  const participantsB = await pageB.evaluate(() => {
    const badge = document.querySelector('.live-count-badge');
    const avatars = document.querySelectorAll('.presence-av:not(.presence-more)');
    return { badge: badge?.textContent?.trim(), avatarCount: avatars.length };
  });
  console.log('\n=== Participant State ===');
  console.log('A:', participantsA);
  console.log('B:', participantsB);

  if (participantsA.avatarCount >= 2 && participantsB.avatarCount >= 2) {
    console.log('\n✅ Both contexts are in the same room (2+ avatars)');
  } else {
    console.log('\n❌ Not both in same room — socket issue confirmed');
    console.log('   A avatars:', participantsA.avatarCount, ' B avatars:', participantsB.avatarCount);
  }

  await browser.close();
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
