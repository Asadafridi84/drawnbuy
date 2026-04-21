import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATS, DRAG_PRODS } from '../data';

// Generate 16 products per category from DRAG_PRODS pool
function getCatProducts(cat) {
  const pool = DRAG_PRODS;
  const result = [];
  for (let i = 0; i < 16; i++) {
    const base = pool[i % pool.length];
    result.push({
      ...base,
      name: i < pool.length ? base.name : `${cat.name} Item ${i + 1}`,
      price: base.price,
    });
  }
  return result;
}

export default function CategoryPage({ cat, onClose }) {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState({});
  const products = getCatProducts(cat);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#f4f0ff',
      zIndex: 500, overflowY: 'auto',
      animation: 'cpIn .25s ease',
    }}>
      <style>{`
        @keyframes cpIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
        .cp-dc { background:#fff; border:1.5px solid #e5e7eb; border-radius:14px; overflow:hidden; cursor:pointer; transition:all .22s; position:relative; }
        .cp-dc:hover { transform:translateY(-4px); box-shadow:0 8px 32px rgba(124,58,237,.18); border-color:#ede9fe; }
        .cp-dc-img { height:140px; background:#f9f7ff; border-bottom:1px solid #e5e7eb; overflow:hidden; }
        .cp-dc-img img { width:100%; height:100%; object-fit:cover; transition:transform .3s; display:block; }
        .cp-dc:hover .cp-dc-img img { transform:scale(1.06); }
        .cp-buybtn { width:100%; background:#7c3aed; color:#fff; border:none; border-radius:8px; padding:9px; font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:.15s; }
        .cp-buybtn:hover { background:#5b21b6; }
        .cp-addbtn { width:100%; background:linear-gradient(135deg,#7c3aed,#06b6d4); color:#fff; border:none; border-radius:8px; padding:7px; font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; cursor:pointer; margin-top:5px; }
      `}</style>

      {/* Sticky top nav */}
      <div style={{ background: '#7c3aed', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 12px rgba(0,0,0,.2)' }}>
        <button
          onClick={() => onClose ? onClose() : navigate(-1)}
          style={{ background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)', color: '#fff', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '700' }}
        >← Back</button>
        <span style={{ fontSize: '17px', fontWeight: '800', color: '#fff' }}>{cat.emoji} {cat.name}</span>
        <div style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,rgba(251,191,36,.2),rgba(249,115,22,.2))', border: '1px solid rgba(251,191,36,.4)', color: '#fbbf24', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
          🔥 {cat.count} products available
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem' }}>
        {/* Hero banner */}
        <div style={{ background: 'linear-gradient(135deg,#3b0764,#7c3aed)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>{cat.emoji} {cat.name}</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.65)', marginTop: '4px', marginBottom: 0 }}>{cat.desc || 'Browse our full selection'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24' }}>{cat.count}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>Products</div>
          </div>
        </div>

        {/* Products grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px' }}>
          {products.map((p, i) => (
            <div key={i} className="cp-dc">
              {p.deal && (
                <div style={{ position: 'absolute', top: '9px', left: '9px', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', zIndex: 1, background: '#fef2f2', color: '#dc2626' }}>{p.deal}</div>
              )}
              <button
                style={{ position: 'absolute', top: '9px', right: '9px', background: 'rgba(255,255,255,.92)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', zIndex: 1 }}
                onClick={e => { e.stopPropagation(); setWishlist(w => ({ ...w, [i]: !w[i] })); }}
              >{wishlist[i] ? '❤️' : '♡'}</button>
              <div className="cp-dc-img">
                <img src={p.img} alt={p.name} loading="lazy" />
              </div>
              <div style={{ padding: '11px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a0a3e', marginBottom: '5px', lineHeight: '1.35' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#7c3aed' }}>{p.price}</span>
                  {p.old && <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>{p.old}</span>}
                </div>
                <button className="cp-buybtn">Buy Now →</button>
                <button className="cp-addbtn">🎨 Add to Canvas</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
