import { useState, useRef, useEffect } from 'react';
import { DRAG_PRODS } from '../data';

// Extend drag prods to 33+ by repeating with variation
const ALL_PRODS = [
  ...DRAG_PRODS,
  {name:'AirPods Pro 2',    price:'2 799 kr',old:'3 299 kr',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',deal:'-15%'},
  {name:'IKEA KALLAX',      price:'649 kr',  old:'',         img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80', deal:''},
  {name:'KitchenAid Mixer', price:'5 299 kr',old:'6 499 kr', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',deal:'-20%'},
  {name:"Levi's 501 Jeans", price:'899 kr',  old:'',         img:'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&q=80',deal:''},
  {name:'Dyson V15 Vacuum', price:'6 499 kr',old:'8 990 kr', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',deal:'-28%'},
  {name:'H&M Linen Blazer', price:'699 kr',  old:'',         img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',deal:''},
  {name:'iPad Air M2',      price:'8 999 kr',old:'',         img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',deal:''},
  {name:'Zara Maxi Dress',  price:'399 kr',  old:'599 kr',   img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',deal:'-33%'},
  {name:'Samsung 4K TV',    price:'7 999 kr',old:'9 990 kr', img:'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300&q=80',deal:'-20%'},
  {name:'Nike Running Shoes',price:'1 199 kr',old:'',        img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',deal:''},
  {name:'Vitamix Blender',  price:'5 890 kr',old:'7 490 kr', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',deal:'-21%'},
  {name:'Louis Vuitton Bag',price:'12 900 kr',old:'',        img:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80',deal:''},
  {name:'LEGO Technic Set', price:'1 299 kr',old:'1 599 kr', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',deal:'-19%'},
  {name:'Kindle Paperwhite',price:'1 249 kr',old:'',         img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80',deal:''},
  {name:'GoPro HERO 12',    price:'4 299 kr',old:'4 990 kr', img:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80',deal:'-14%'},
  {name:'Nespresso Vertuo', price:'1 690 kr',old:'2 490 kr', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',deal:'-32%'},
  {name:'Acne Studios Jeans',price:'3 200 kr',old:'',        img:'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&q=80',deal:''},
];

export default function DragStrip() {
  const [sort, setSort] = useState('featured');
  const [autoRotate, setAutoRotate] = useState(true);
  const rowRef = useRef(null);

  const sorted = [...ALL_PRODS].sort((a, b) => {
    if (sort === 'price-asc') return parseInt(a.price) - parseInt(b.price);
    if (sort === 'price-desc') return parseInt(b.price) - parseInt(a.price);
    if (sort === 'deals') return (b.deal ? 1 : 0) - (a.deal ? 1 : 0);
    return 0;
  });

  useEffect(() => {
    if (!autoRotate) return;
    const el = rowRef.current;
    if (!el) return;
    let frame;
    const step = () => {
      el.scrollLeft += 0.5;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate]);

  const scroll = dir => {
    rowRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });
  };

  return (
    <div style={{ overflow: 'hidden', background: '#3b0764', borderTop: '1px solid rgba(255,255,255,.08)', padding: '.85rem 2rem' }}>
      <style>{`
        @keyframes dealPop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .pc {
          min-width:148px; background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.1);
          border-radius:12px; overflow:hidden; cursor:grab; transition:.22s; position:relative;
          flex-shrink:0; user-select:none;
        }
        .pc:hover { border-color:rgba(251,191,36,.5); transform:translateY(-2px); }
        .pc:active { cursor:grabbing; opacity:.7; }
        .deal-badge { position:absolute; top:6px; left:6px; background:#ef4444; color:#fff; font-size:.58rem; font-weight:800; padding:1px 6px; border-radius:4px; animation:dealPop 2s infinite; }
        .drag-hint { position:absolute; top:5px; right:5px; background:rgba(0,0,0,.6); border-radius:4px; padding:2px 5px; font-size:.58rem; color:#fbbf24; font-weight:700; }
        .prow { display:flex; gap:.85rem; overflow-x:auto; padding-bottom:.4rem; scrollbar-width:none; }
        .prow::-webkit-scrollbar { display:none; }
        .pc-cart { flex:1; background:#7c3aed; color:#fff; border:none; border-radius:6px; padding:4px; font-size:.65rem; font-weight:700; cursor:pointer; font-family:inherit; }
        .pc-wish { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:6px; padding:3px 6px; cursor:pointer; font-size:.7rem; color:#fff; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto .6rem', display: 'flex', alignItems: 'center', gap: '.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontSize: '.95rem', fontWeight: '800', color: '#fff' }}>🛍️ Drag Products to Canvas</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', borderRadius: '999px', padding: '2px 10px', fontSize: '.68rem', color: '#fbbf24', fontWeight: '700' }}>
            ✋ Drag any product to your canvas
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '999px', padding: '2px 10px', fontSize: '.68rem', color: 'rgba(255,255,255,.6)', fontWeight: '700', cursor: 'pointer' }}
            onClick={() => setAutoRotate(a => !a)}>
            {autoRotate ? '⏸ Pause' : '▶ Auto-rotate'}
          </span>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ background: 'rgba(0,0,0,.4)', color: '#fbbf24', border: '2.5px solid #fbbf24', borderRadius: '9px', padding: '7px 28px 7px 14px', fontSize: '.82rem', fontWeight: '800', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
        >
          <option value="featured">⭐ Featured</option>
          <option value="deals">🔥 Best Deals</option>
          <option value="price-asc">💰 Price: Low to High</option>
          <option value="price-desc">💎 Price: High to Low</option>
        </select>
      </div>

      {/* Row */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div
          className="prow"
          ref={rowRef}
          onMouseEnter={() => setAutoRotate(false)}
          onMouseLeave={() => setAutoRotate(true)}
        >
          {sorted.map((p, i) => (
            <div
              key={i}
              className="pc"
              draggable
              onDragStart={() => { window._dnbDrag = { name: p.name, price: p.price, img: p.img }; }}
            >
              {p.deal && <span className="deal-badge">{p.deal}</span>}
              <span className="drag-hint">DRAG</span>
              <img src={p.img} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} loading="lazy" />
              <div style={{ padding: '.5rem' }}>
                <div style={{ fontSize: '.72rem', fontWeight: '700', color: '#fff', lineHeight: 1.3, marginBottom: '.22rem' }}>{p.name}</div>
                <div>
                  <span style={{ fontSize: '.88rem', fontWeight: '800', color: '#fbbf24' }}>{p.price}</span>
                  {p.old && <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.35)', textDecoration: 'line-through', marginLeft: '.25rem' }}>{p.old}</span>}
                </div>
                <div style={{ display: 'flex', gap: '.35rem', marginTop: '.4rem' }}>
                  <button className="pc-cart">🛒 Add</button>
                  <button className="pc-wish">♡</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ maxWidth: '1200px', margin: '.4rem auto 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 .5rem' }}>
        <button onClick={() => scroll(-1)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '700' }}>◀ Scroll back</button>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)', fontWeight: '600' }}>{ALL_PRODS.length} products</span>
        <button onClick={() => scroll(1)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '700' }}>Scroll forward ▶</button>
      </div>
    </div>
  );
}
