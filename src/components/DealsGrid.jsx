import { useState, useEffect } from 'react';
import { DEALS } from '../data';

function CountdownTimer() {
  const [secs, setSecs] = useState(3600 * 4 + 23 * 60 + 47);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = n => String(n).padStart(2, '0');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '800' }}>
      ⏱ {pad(h)}:{pad(m)}:{pad(s)} left
    </span>
  );
}

function Stars({ count }) {
  return (
    <span style={{ color: '#d97706', fontSize: '11px' }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

export default function DealsGrid({ selectedCategory = 'all' }) {
  const [wishlist, setWishlist] = useState({});
  const [viewing] = useState(() => {
    const map = {};
    DEALS.forEach((_, i) => { map[i] = Math.floor(Math.random() * 18) + 3; });
    return map;
  });

  const toggleWish = i => setWishlist(w => ({ ...w, [i]: !w[i] }));

  const filtered = selectedCategory === 'all'
    ? DEALS
    : DEALS.filter(d => d.cat === selectedCategory);

  const badgeStyle = type => {
    if (type === 'red')  return { background: '#fef2f2', color: '#dc2626' };
    if (type === 'gold') return { background: '#fffbeb', color: '#b45309' };
    if (type === 'grn')  return { background: '#f0fdf4', color: '#15803d' };
    return {};
  };

  return (
    <div id="dealsAnchor" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem' }}>
      <style>{`
        @keyframes dealSlideIn { from{transform:translateY(14px)} to{transform:none} }
        @keyframes heartPop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
        .dc {
          background:#fff; border:1.5px solid #e5e7eb; border-radius:14px;
          overflow:hidden; cursor:pointer; transition:all .22s; position:relative;
          animation: dealSlideIn .35s ease-out;
        }
        .dc:hover { transform:translateY(-4px); box-shadow:0 8px 32px rgba(124,58,237,.18); border-color:#ede9fe; }
        .dc-badge { position:absolute; top:9px; left:9px; font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px; z-index:1; }
        .wbtn {
          position:absolute; top:9px; right:9px; background:rgba(255,255,255,.92); border:none;
          width:30px; height:30px; border-radius:50%; cursor:pointer; display:flex;
          align-items:center; justify-content:center; font-size:16px; z-index:1; transition:.15s;
        }
        .wbtn:hover { transform:scale(1.15); animation:heartPop .3s ease; }
        .dc-img { height:130px; background:#f9f7ff; border-bottom:1px solid #e5e7eb; overflow:hidden; }
        .dc-img img { width:100%; height:100%; object-fit:cover; transition:transform .3s; display:block; }
        .dc:hover .dc-img img { transform:scale(1.06); }
        .dc-buybtn {
          width:100%; background:#7c3aed; color:#fff; border:none; border-radius:8px;
          padding:9px; font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700;
          cursor:pointer; transition:.15s;
        }
        .dc-buybtn:hover { background:#5b21b6; }
        .dc-addbtn {
          width:100%; background:linear-gradient(135deg,#7c3aed,#06b6d4); color:#fff; border:none;
          border-radius:8px; padding:7px; font-family:'Space Grotesk',sans-serif; font-size:11px;
          font-weight:700; cursor:pointer; margin-top:5px; transition:.15s;
        }
        .dc-addbtn:hover { opacity:.85; transform:scale(1.02); }
      `}</style>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', marginBottom: '3px' }}>Limited time</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1a0a3e', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            🔥 Flash Deals
            <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 9px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626' }}>HOT</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CountdownTimer />
          <a style={{ color: '#7c3aed', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>View all deals →</a>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🔍</div>
          <p style={{ fontWeight: '700', color: '#6b7280' }}>No flash deals in this category yet</p>
          <p style={{ fontSize: '13px', marginTop: '.25rem' }}>Check back soon or browse All deals</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '14px', marginBottom: '2rem' }}>
        {filtered.map((d, i) => (
          <div key={i} className="dc" style={{ animationDelay: `${i * 0.05}s` }}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify({
                name: d.name, price: d.price, img: d.img,
                url: d.url || `https://www.amazon.co.uk/s?k=${encodeURIComponent(d.name)}&tag=drawnbuy-21`
              }));
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <div className="dc-badge" style={badgeStyle(d.badgeType)}>{d.badge}</div>
            <button className="wbtn" onClick={e => { e.stopPropagation(); toggleWish(i); }}>
              {wishlist[i] ? '❤️' : '♡'}
            </button>
            <div className="dc-img">
              <img src={d.img} alt={d.name} loading="lazy" />
            </div>
            <div style={{ padding: '11px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '3px' }}>{d.store}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a0a3e', marginBottom: '5px', lineHeight: '1.35' }}>{d.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Stars count={d.stars} />
                <span style={{ color: '#6b7280', fontSize: '10px' }}>({d.reviews})</span>
                <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: '700' }}>{viewing[i]} viewing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#7c3aed' }}>{d.price}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>{d.old}</span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '5px' }}>Save {d.save}</span>
              </div>
              <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
                <button className="dc-buybtn" style={{ flex: 2 }} onClick={() => window.open(d.url, '_blank')}>Buy on {d.store}</button>
              </div>
              <button className="dc-addbtn">🎨 Add to Canvas</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
