import { useState, useEffect } from 'react';
import { CATS, HERO_ADS, DRAG_PRODS } from '../data';

function SideAdPanel({ ads, timerPct }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      {ads.map((ad, i) => (
        <div
          key={i}
          onClick={() => window.open(ad.url, '_blank')}
          style={{ background: 'rgba(255,255,255,.7)', border: '1.5px solid #ede9fe', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: '.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9fe'; e.currentTarget.style.transform = 'none'; }}
        >
          <img src={ad.img} alt={ad.name} style={{ width: '100%', height: '88px', objectFit: 'cover', display: 'block' }} />
          <div style={{ padding: '.4rem .5rem', background: '#fff' }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: '#1a0a3e', lineHeight: 1.3 }}>{ad.name}</div>
            <div style={{ fontSize: '.78rem', fontWeight: '800', color: '#7c3aed' }}>{ad.price}</div>
          </div>
        </div>
      ))}
      <div style={{ height: '2px', background: '#ede9fe', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#7c3aed', width: `${timerPct}%`, transition: 'width .3s linear' }} />
      </div>
    </div>
  );
}

export default function ProductSearchPanel() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(CATS[0].slug);
  const [adIdx, setAdIdx] = useState(0);
  const [timerPct, setTimerPct] = useState(0);

  const leftAds  = [0,1,2].map(i => HERO_ADS[(adIdx + i) % HERO_ADS.length]);
  const rightAds = [0,1,2].map(i => HERO_ADS[(adIdx + 3 + i) % HERO_ADS.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerPct(p => {
        if (p >= 100) { setAdIdx(i => (i + 3) % HERO_ADS.length); return 0; }
        return p + 1;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const catProducts = DRAG_PRODS.filter(p =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div id="pspSection" style={{
      background: 'linear-gradient(135deg,#ede9fe,#f4f0ff)',
      padding: '.85rem 1.5rem 1.2rem',
      borderTop: '3px solid #7c3aed',
      borderBottom: '2px solid #ede9fe',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <style>{`
        .psp-inner { width:100%; display:grid; grid-template-columns:140px 1fr 140px; gap:1rem; align-items:start; }
        .psp-search-box { background:#fff; border:2.5px solid #7c3aed; border-radius:10px; padding:9px 14px; color:#1a0a3e; font-family:'Space Grotesk',sans-serif; font-size:14px; outline:none; width:100%; box-sizing:border-box; box-shadow:0 2px 12px rgba(124,58,237,.12); transition:.2s; }
        .psp-search-box:focus { border-color:#5b21b6; box-shadow:0 2px 20px rgba(124,58,237,.2); }
        .psp-search-box::placeholder { color:#9ca3af; }
        .cat-chip { display:inline-flex; align-items:center; gap:4px; padding:5px 11px; border-radius:999px; cursor:pointer; font-size:11px; font-weight:700; white-space:nowrap; border:1.5px solid #e5e7eb; background:#fff; color:#6b7280; font-family:inherit; transition:.12s; }
        .cat-chip.on, .cat-chip:hover { background:#7c3aed; border-color:#7c3aed; color:#fff; }
        .psp-card {
          background:#fff; border:1.5px solid #ede9fe; border-radius:12px; overflow:hidden;
          cursor:grab; transition:.22s; position:relative; user-select:none;
        }
        .psp-card:hover { border-color:rgba(124,58,237,.5); transform:translateY(-3px); box-shadow:0 8px 24px rgba(124,58,237,.15); }
        .psp-card:active { cursor:grabbing; }
        .drag-badge { position:absolute; top:4px; right:4px; background:#7c3aed; border-radius:4px; padding:1px 6px; font-size:.55rem; color:#fff; font-weight:800; }
        .psp-products { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:.4rem; }
        @media(max-width:960px) { .psp-inner { grid-template-columns:1fr !important; } .psp-side { display:none !important; } }
        @media(max-width:600px) { .psp-products { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>

      <div className="psp-inner">
        {/* Left Ads */}
        <div className="psp-side">
          <SideAdPanel ads={leftAds} timerPct={timerPct} />
        </div>

        {/* Main Panel */}
        <div style={{ background: '#fff', border: '2px solid #ede9fe', borderRadius: '16px', padding: '.9rem 1.1rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem', marginBottom: '.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.88rem', fontWeight: '800', color: '#1a0a3e' }}>🔍 Find &amp; drag products to your canvas</span>
              <span style={{ fontSize: '.68rem', background: '#ede9fe', border: '1px solid rgba(124,58,237,.2)', borderRadius: '999px', padding: '2px 9px', color: '#7c3aed', fontWeight: '700' }}>✋ Drag to canvas · Click to open store</span>
            </div>
            <input
              className="psp-search-box"
              type="text"
              placeholder="Search e.g. Nike, watch, H&M dress, iPhone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: '.35rem', overflowX: 'auto', paddingBottom: '.5rem', scrollbarWidth: 'none', marginBottom: '.7rem' }}>
            {CATS.slice(0, 14).map(c => (
              <button
                key={c.slug}
                className={`cat-chip ${activeCat === c.slug ? 'on' : ''}`}
                onClick={() => setActiveCat(c.slug)}
              >{c.emoji} {c.name}</button>
            ))}
          </div>

          {/* Products grid */}
          <div className="psp-products">
            {catProducts.map((p, i) => (
              <div
                key={i}
                className="psp-card"
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify({ name: p.name, price: p.price, img: p.img }));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <span className="drag-badge">DRAG</span>
                <div style={{ padding: '.45rem' }}>
                  <div style={{ fontSize: '.72rem', fontWeight: '700', color: '#1a0a3e', lineHeight: 1.3, marginBottom: '.2rem' }}>{p.name}</div>
                  <div style={{ fontSize: '.88rem', fontWeight: '800', color: '#7c3aed' }}>{p.price}</div>
                  {p.old && <div style={{ fontSize: '.65rem', color: '#9ca3af', textDecoration: 'line-through' }}>{p.old}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Ads */}
        <div className="psp-side">
          <SideAdPanel ads={rightAds} timerPct={timerPct} />
        </div>
      </div>
    </div>
  );
}
