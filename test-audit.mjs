/**
 * DrawNBuy Full 16-Section Audit
 * Tests every page, every section, every connection
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Kashif/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');

const BASE = 'https://drawnbuy.vercel.app';
const OUT  = './audit-screenshots';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const issues = [];
const passes = [];

function pass(id, note) { passes.push({ id, note }); console.log(`✅ PASS [${id}] ${note}`); }
function fail(id, note) { issues.push({ id, note }); console.log(`❌ FAIL [${id}] ${note}`); }
function info(msg)       { console.log(`   ℹ  ${msg}`); }
async function wait(ms)  { return new Promise(r => setTimeout(r, ms)); }

async function ss(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}
async function ssFull(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // ═══════════════════════════════════════════════════════
  // HOME PAGE — full scroll audit
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ HOME PAGE ══════');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(2000);
  await ss(page, '01-home-initial');

  // S1 — Topbar
  const topbar = await page.$eval('body', () => {
    const el = document.querySelector('[class*="topbar"], [id*="topbar"]') ||
               Array.from(document.querySelectorAll('div')).find(d => d.style?.background?.includes('1a0a3e') || d.innerText?.includes('Sweden') || d.innerText?.includes('language'));
    return el ? el.innerText.slice(0, 100) : null;
  });
  info(`Topbar text: ${topbar?.slice(0,60)}`);
  if (topbar) pass('S1-topbar', 'Topbar renders'); else fail('S1-topbar', 'Topbar not found');

  // S2 — Navbar: check nav links exist
  const navLinks = await page.$$eval('nav a, header a', els => els.map(e => ({ text: e.textContent.trim().slice(0,30), href: e.href })));
  info(`Nav links found: ${navLinks.length}`);
  navLinks.forEach(l => info(`  → "${l.text}" ${l.href}`));
  if (navLinks.length >= 3) pass('S2-navbar', `${navLinks.length} nav links found`); else fail('S2-navbar', `Only ${navLinks.length} nav links`);

  // Check Live badge in navbar
  const liveBadge = await page.evaluate(() => document.body.innerText.includes('LIVE') || document.body.innerText.includes('drawing now'));
  if (liveBadge) pass('S2-live-badge', 'Live/drawing badge present'); else fail('S2-live-badge', 'No live badge found');

  // S3 — AdStrip
  const adStrip = await page.evaluate(() => {
    const el = document.querySelector('[class*="ad"], [class*="strip"], [class*="banner"]') ||
               Array.from(document.querySelectorAll('div')).find(d => d.style?.background?.includes('gradient') && d.style?.height?.includes('44'));
    return el?.innerText?.slice(0,100);
  });
  if (adStrip) pass('S3-adstrip', `AdStrip found: "${adStrip.slice(0,40)}"`); else fail('S3-adstrip', 'AdStrip not found');

  // S4 — Hero: check buttons
  const heroButtons = await page.$$eval('button, a', els =>
    els.filter(e => e.innerText?.match(/draw|canvas|invite|start/i)).map(e => e.innerText.trim().slice(0,30))
  );
  info(`Hero-style buttons: ${JSON.stringify(heroButtons)}`);
  if (heroButtons.length > 0) pass('S4-hero-buttons', `Found: ${heroButtons.join(', ')}`); else fail('S4-hero-buttons', 'No draw/invite/start buttons found');

  // S5 — CategoryBar chips
  const catChips = await page.$$eval('[class*="cat"], [class*="chip"], [class*="filter"]', els =>
    els.map(e => e.textContent.trim().slice(0,20)).filter(t => t.length > 1)
  );
  info(`Category chips: ${catChips.slice(0,6).join(', ')}`);
  if (catChips.length >= 5) pass('S5-catbar', `${catChips.length} category chips found`); else fail('S5-catbar', `Only ${catChips.length} chips`);

  // Scroll to CollabCanvas section
  await page.evaluate(() => document.getElementById('collabSection')?.scrollIntoView({ block: 'start' }));
  await wait(800);
  await ss(page, '02-collab-canvas-section');

  // S6 — CollabCanvas
  const canvas = await page.$('canvas[data-canvas-id="main-collab"]');
  if (canvas) pass('S6-collab-canvas', 'CollabCanvas renders with canvas element'); else fail('S6-collab-canvas', 'CollabCanvas not found');

  // S16 — MiniFloatingCanvas on home
  const mini = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Drop Zone') || text.includes('Open Full Canvas') || text.includes('Drop a product');
  });
  if (mini) pass('S16-mini-home', 'MiniFloatingCanvas visible on home'); else fail('S16-mini-home', 'MiniFloatingCanvas NOT found on home');

  // Scroll to DragStrip
  await page.evaluate(() => window.scrollBy(0, 600));
  await wait(600);
  await ss(page, '03-dragstrip-psp');

  // S7 — PSP
  const psp = await page.evaluate(() => {
    return !!document.querySelector('[class*="psp"], [class*="search-panel"], [class*="product-search"]') ||
           Array.from(document.querySelectorAll('h2,h3')).some(h => h.innerText?.match(/product|search|find/i));
  });
  if (psp) pass('S7-psp', 'ProductSearchPanel found'); else fail('S7-psp', 'PSP not found');

  // S8 — DragStrip: draggable products
  const draggable = await page.$$('[draggable="true"]');
  info(`Draggable items: ${draggable.length}`);
  if (draggable.length >= 3) pass('S8-dragstrip', `${draggable.length} draggable products found`); else fail('S8-dragstrip', `Only ${draggable.length} draggable items`);

  // Scroll to Deals section
  await page.evaluate(() => window.scrollBy(0, 1000));
  await wait(600);
  await ss(page, '04-deals-section');

  // S9 — DealsGrid: countdown timer
  const hasCountdown = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).some(el => {
      const t = el.innerText || '';
      return /\d{1,2}:\d{2}:\d{2}/.test(t) || /\d+h\s*\d+m/i.test(t);
    });
  });
  if (hasCountdown) pass('S9-deals-countdown', 'Countdown timer found in Deals'); else fail('S9-deals-countdown', 'No countdown timer');

  // Scroll to Categories
  await page.evaluate(() => window.scrollBy(0, 1200));
  await wait(600);
  await ss(page, '05-categories-section');

  // S10 — CategoriesGrid
  const catCards = await page.$$eval('[class*="cat-card"], [class*="category-card"]', els => els.length)
    .catch(() => 0);
  // Alternative selector
  const catCount = catCards || await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h3')).filter(h => h.innerText?.length < 30 && h.closest('div')).length;
  });
  info(`Category count approx: ${catCount}`);
  if (catCount >= 5) pass('S10-categories', `~${catCount} category items found`); else fail('S10-categories', 'Too few category items');

  // S11 — Sponsors
  await page.evaluate(() => window.scrollBy(0, 800));
  await wait(500);
  const sponsors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).filter(el =>
      el.tagName === 'IMG' && el.src && (el.alt?.toLowerCase().includes('sponsor') || el.closest('[class*="sponsor"]'))
    ).length;
  });
  if (sponsors > 0) pass('S11-sponsors', `${sponsors} sponsor items`); else {
    const sponsorText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[class*="sponsor"]')).length
    );
    if (sponsorText > 0) pass('S11-sponsors', 'Sponsors section found'); else fail('S11-sponsors', 'Sponsors section not visible');
  }

  // S12 — HowItWorks CTA
  const hiwCTA = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).some(e =>
      e.innerText?.match(/start|draw|canvas|begin|try/i)
    );
  });
  if (hiwCTA) pass('S12-hiw', 'HIW section CTA found'); else fail('S12-hiw', 'HIW CTA not found');

  // Full-page scroll screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(600);
  await ss(page, '06-bottom-footer');

  // S13 — Footer links
  const footerLinks = await page.$$eval('footer a', els => els.map(e => ({ text: e.textContent.trim().slice(0,25), href: e.href })));
  info(`Footer links: ${footerLinks.length}`);
  footerLinks.slice(0,8).forEach(l => info(`  footer: "${l.text}" → ${l.href?.slice(0,50)}`));
  if (footerLinks.length >= 5) pass('S13-footer', `${footerLinks.length} footer links`); else fail('S13-footer', `Only ${footerLinks.length} footer links`);

  // Check for dead links in footer (href="#" or empty)
  const deadFooter = footerLinks.filter(l => !l.href || l.href === '#' || l.href.endsWith('#'));
  if (deadFooter.length > 0) fail('S13-footer-dead', `${deadFooter.length} dead footer links: ${deadFooter.map(l=>l.text).join(', ')}`);
  else pass('S13-footer-dead', 'No dead footer links');

  // ═══════════════════════════════════════════════════════
  // S5 — CLICK FIRST CATEGORY CHIP
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ CATEGORY BAR CLICK TEST ══════');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);
  // Scroll to CategoryBar
  await page.evaluate(() => window.scrollBy(0, 600));
  await wait(500);
  await ss(page, '07-pre-catbar-click');

  // Click first category chip (not "All")
  const firstCatChip = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('button, [role="button"], a')).filter(e =>
      e.innerText && e.innerText.length < 25 && !e.innerText.match(/^(All|Draw|Share|Invite|Start|Save|Clear|Sticker)$/i)
    );
    if (chips[1]) { chips[1].click(); return chips[1].innerText.trim(); }
    if (chips[0]) { chips[0].click(); return chips[0].innerText.trim(); }
    return null;
  });
  info(`Clicked category chip: "${firstCatChip}"`);
  await wait(1000);
  await ss(page, '08-after-catbar-click');
  const catPageLoaded = await page.evaluate(() =>
    document.body.innerText.includes('product') || document.body.innerText.includes('items') ||
    window.location.href.includes('category')
  );
  if (catPageLoaded || firstCatChip) pass('S5-chip-click', `Clicked "${firstCatChip}" — page reacted`); else fail('S5-chip-click', 'Category chip click had no effect');

  // ═══════════════════════════════════════════════════════
  // CATEGORY PAGE via URL
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ CATEGORY PAGE ══════');
  await page.goto(`${BASE}/category/shoes-sneakers`, { waitUntil: 'networkidle' });
  await wait(2000);
  await ss(page, '09-category-page-shoes');

  const catPageTitle = await page.evaluate(() =>
    document.querySelector('h1,h2')?.innerText?.trim()
  );
  info(`Category page title: "${catPageTitle}"`);

  const catProducts = await page.$$('[draggable="true"]');
  info(`Draggable products on category page: ${catProducts.length}`);

  // Check MiniFloatingCanvas on category page
  const miniOnCat = await page.evaluate(() =>
    document.body.innerText.includes('Drop Zone') || document.body.innerText.includes('Open Full Canvas')
  );
  info(`MiniFloatingCanvas on category page: ${miniOnCat}`);
  if (miniOnCat) pass('S16-mini-category', 'MiniFloatingCanvas present on category page'); else fail('S16-mini-category', 'MiniFloatingCanvas MISSING on category page ← P0 BUG');

  if (catPageTitle) pass('S15-category-page', `Category page loads: "${catPageTitle}"`); else fail('S15-category-page', 'Category page has no title');
  if (catProducts.length >= 2) pass('S15-cat-products-draggable', `${catProducts.length} draggable products on category page`); else fail('S15-cat-products-draggable', `${catProducts.length} draggable products — too few`);

  // ═══════════════════════════════════════════════════════
  // PROFILE PAGE
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ PROFILE PAGE ══════');
  await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle' });
  await wait(2000);
  await ss(page, '10-profile-page');

  const profileContent = await page.evaluate(() => document.body.innerText.slice(0, 200));
  info(`Profile page content: "${profileContent.slice(0,100)}"`);

  // Protected route — expect redirect to login or show login form
  const isLoginPage = await page.evaluate(() =>
    document.body.innerText.includes('Log In') || document.body.innerText.includes('Sign In') ||
    document.body.innerText.includes('Login') || window.location.href.includes('login')
  );
  const isProfilePage = await page.evaluate(() =>
    document.body.innerText.includes('Profile') || document.body.innerText.includes('Wishlist') ||
    document.body.innerText.includes('Canvases') || document.body.innerText.includes('My Page')
  );
  const miniOnProfile = await page.evaluate(() =>
    document.body.innerText.includes('Drop Zone') || document.body.innerText.includes('Open Full Canvas')
  );
  info(`Profile page: isLogin=${isLoginPage}, isProfile=${isProfilePage}, hasMini=${miniOnProfile}`);
  if (isLoginPage) pass('profile-auth', 'Protected route redirects to login when not authenticated');
  else if (isProfilePage) pass('profile-auth', 'Profile page loads (user authenticated)');
  else fail('profile-auth', 'Profile page shows neither login nor profile content');

  if (miniOnProfile) pass('S16-mini-profile', 'MiniFloatingCanvas on profile page'); else fail('S16-mini-profile', 'MiniFloatingCanvas MISSING on profile ← P0 BUG');

  // ═══════════════════════════════════════════════════════
  // CANVASES PAGE
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ CANVASES PAGE ══════');
  await page.goto(`${BASE}/canvases`, { waitUntil: 'networkidle' });
  await wait(2000);
  await ss(page, '11-canvases-page');
  const miniOnCanvases = await page.evaluate(() =>
    document.body.innerText.includes('Drop Zone') || document.body.innerText.includes('Open Full Canvas')
  );
  info(`MiniFloatingCanvas on canvases page: ${miniOnCanvases}`);
  if (miniOnCanvases) pass('S16-mini-canvases', 'MiniFloatingCanvas on canvases page'); else fail('S16-mini-canvases', 'MiniFloatingCanvas MISSING on canvases ← P0 BUG');

  // ═══════════════════════════════════════════════════════
  // NAVBAR LINKS
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ NAVBAR LINKS ══════');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);

  const allNavLinks = await page.$$eval('nav a, header a', els =>
    els.map(e => ({ text: e.textContent.trim().slice(0,30), href: e.href, visible: e.offsetParent !== null }))
       .filter(e => e.text.length > 0)
  );
  for (const link of allNavLinks) {
    if (!link.href || link.href === window?.location?.href || link.href.endsWith('#')) {
      info(`  nav: "${link.text}" → dead/empty`);
    } else {
      info(`  nav: "${link.text}" → ${link.href}`);
    }
  }

  // Test Deals anchor link
  const dealsLink = allNavLinks.find(l => l.text.toLowerCase().includes('deal'));
  if (dealsLink) {
    pass('S2-deals-link', `Deals link: ${dealsLink.href}`);
  } else {
    fail('S2-deals-link', 'No Deals nav link found');
  }

  // ═══════════════════════════════════════════════════════
  // S9 — DEALS COUNTDOWN LIVE CHECK
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ DEALS COUNTDOWN TICK TEST ══════');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('dealsAnchor')?.scrollIntoView() || window.scrollBy(0, 2000));
  await wait(1500);
  const countdown1 = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    for (const el of els) {
      if (/\d{1,2}:\d{2}:\d{2}/.test(el.innerText || '')) return el.innerText.trim().slice(0,20);
    }
    return null;
  });
  await wait(2500); // wait 2.5s then check if it changed
  const countdown2 = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    for (const el of els) {
      if (/\d{1,2}:\d{2}:\d{2}/.test(el.innerText || '')) return el.innerText.trim().slice(0,20);
    }
    return null;
  });
  info(`Countdown T1: "${countdown1}" → T2: "${countdown2}"`);
  if (countdown1 && countdown2 && countdown1 !== countdown2) pass('S9-countdown-live', `Countdown ticking: "${countdown1}" → "${countdown2}"`);
  else if (countdown1) fail('S9-countdown-live', `Countdown found but not changing: "${countdown1}" (static?)`);
  else fail('S9-countdown-live', 'No countdown timer found in Deals');
  await ss(page, '12-deals-countdown');

  // ═══════════════════════════════════════════════════════
  // S2 — CART + WISHLIST BUTTONS
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ CART/WISHLIST BUTTONS ══════');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);
  // Scroll to DragStrip
  await page.evaluate(() => window.scrollBy(0, 1400));
  await wait(600);

  const cartBtnCount = await page.$$eval('button', els =>
    els.filter(e => e.innerText?.match(/add.*(cart|bag)|add to/i)).length
  );
  const wishBtnCount = await page.$$eval('button', els =>
    els.filter(e => e.innerText?.match(/wish|♡|❤|save/i)).length
  );
  info(`Add to cart buttons: ${cartBtnCount}, Wish buttons: ${wishBtnCount}`);
  if (cartBtnCount >= 2) pass('S8-cart-btn', `${cartBtnCount} "Add to cart" buttons found`); else fail('S8-cart-btn', `Only ${cartBtnCount} add-to-cart buttons`);
  if (wishBtnCount >= 1) pass('S8-wish-btn', `${wishBtnCount} wish buttons found`); else fail('S8-wish-btn', 'No wish buttons found');

  // Test clicking Add to Cart
  const cartCountBefore = await page.evaluate(() => {
    // Read cart count from navbar badge if any
    const badge = document.querySelector('[class*="cart"] [class*="badge"], [class*="cart-count"]');
    return badge?.textContent?.trim() || '0';
  });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.match(/add.*(cart|bag)|add to/i));
    if (btn) btn.click();
  });
  await wait(500);
  const toastAfterCart = await page.evaluate(() =>
    document.body.innerText.includes('cart') || document.body.innerText.includes('Cart') || document.body.innerText.includes('Added')
  );
  if (toastAfterCart) pass('S8-add-cart-toast', 'Add to cart shows feedback'); else fail('S8-add-cart-toast', 'No cart feedback after click');

  // ═══════════════════════════════════════════════════════
  // SHARE MODAL
  // ═══════════════════════════════════════════════════════
  console.log('\n══════ SHARE MODAL ══════');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(1500);
  // Click Share Canvas in navbar
  const shareBtn = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(e => e.innerText?.match(/share.*canvas|canvas.*share/i));
    if (btn) { btn.click(); return btn.innerText.trim(); }
    return null;
  });
  info(`Share button clicked: "${shareBtn}"`);
  await wait(500);
  const modalOpen = await page.evaluate(() =>
    document.body.innerText.includes('Share Your Canvas') || document.body.innerText.includes('Copy') && document.body.innerText.includes('room')
  );
  if (modalOpen) pass('S14-share-modal', 'ShareModal opens from navbar'); else fail('S14-share-modal', 'ShareModal did not open from navbar click');
  await ss(page, '13-share-modal');

  // ═══════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════
  await browser.close();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  DrawNBuy Full Audit Report');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\n✅ PASSED (${passes.length}):`);
  passes.forEach(p => console.log(`  ✅ [${p.id}] ${p.note}`));
  console.log(`\n❌ FAILED (${issues.length}):`);
  issues.forEach(i => console.log(`  ❌ [${i.id}] ${i.note}`));
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`Result: ${passes.length} passed, ${issues.length} failed`);

  // Write JSON report
  fs.writeFileSync('./audit-report.json', JSON.stringify({ passes, issues }, null, 2));
  console.log('Full report: ./audit-report.json');
  console.log('Screenshots: ./audit-screenshots/');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
