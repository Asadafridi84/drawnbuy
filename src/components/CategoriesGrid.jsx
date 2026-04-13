import { useState } from 'react';
import { CATS, GROUPS } from '../data';

export default function CategoriesGrid() {
  const [activeGroup, setActiveGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  const filtered = CATS.filter(c => {
    const matchGroup = activeGroup === 'all' || c.group === activeGroup;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const badgeStyle = badge => {
    if (badge === 'hot')  return { background: '#fef2f2', color: '#dc2626' };
    if (badge === 'sale') return { background: '#fffbeb', color: '#b45309' };
    if (badge === 'new')  return { background: '#f0fdf4', color: '#15803d' };
    if (badge === 'top')  return { background: '#f5f3ff', color: '#7c3aed' };
    return null;
  };

  return (
    <div id="catsSection" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <style>{`
        @keyframes catIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:none} }
        .ct {
          border-radius:14px; overflow:hidden; cursor:pointer; position:relative;
          box-shadow:0 2px 12px rgba(124,58,237,.08); transition:all .22s;
          background:#fff; border:1.5px solid #e5e7eb; animation:catIn .3s ease both;
        }
        .ct:hover { transform:translateY(-4px); box-shadow:0 8px 32px rgba(124,58,237,.18); border-color:#ede9fe; }
        .ct-img { height:110px; overflow:hidden; background:#ede9fe; }
        .ct-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .35s; }
        .ct:hover .ct-img img { transform:scale(1.07); }
        .ct-overlay { position:absolute; inset:0; background:rgba(124,58,237,.0); display:flex; align-items:center; justify-content:center; opacity:0; transition:.22s; font-size:13px; font-weight:800; color:#fff; letter-spacing:.02em; pointer-events:none; }
        .ct:hover .ct-overlay { opacity:1; background:rgba(124,58,237,.35); }
        .fbtn { background:#fff; border:1.5px solid #e5e7eb; color:#6b7280; padding:6px 14px; border-radius:20px; font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:.15s; }
        .fbtn.on, .fbtn:hover { background:#7c3aed; border-color:#7c3aed; color:#fff; }
        .cat-search { background:#fff; border:2px solid #ede9fe; border-radius:10px; padding:9px 14px; font-family:'Space Grotesk',sans-serif; font-size:14px; outline:none; width:260px; max-width:100%; transition:.2s; }
        .cat-search:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,.1); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', marginBottom: '3px' }}>Browse by category</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1a0a3e', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            📦 All Categories
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af' }}>{filtered.length} categories</span>
          </h2>
        </div>
        <input
          className="cat-search"
          placeholder="🔍 Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {GROUPS.map(g => (
          <button
            key={g.key}
            className={`fbtn ${activeGroup === g.key ? 'on' : ''}`}
            onClick={() => setActiveGroup(g.key)}
          >{g.label}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: '12px', marginBottom: '2rem' }}>
        {filtered.map((c, i) => (
          <div
            key={c.slug}
            className="ct"
            style={{ animationDelay: `${i * 0.03}s` }}
            onMouseEnter={() => setHovered(c.slug)}
            onMouseLeave={() => setHovered(null)}
          >
            {c.badge && badgeStyle(c.badge) && (
              <div style={{ position: 'absolute', top: '7px', left: '7px', fontSize: '9px', fontWeight: '800', padding: '2px 7px', borderRadius: '20px', zIndex: 1, ...badgeStyle(c.badge) }}>
                {c.badgeText}
              </div>
            )}
            <div className="ct-img">
              <img src={c.img} alt={c.name} loading="lazy" />
            </div>
            <div className="ct-overlay">Shop Now</div>
            <div style={{ padding: '9px 11px 11px' }}>
              <div style={{ fontSize: '16px', marginBottom: '2px' }}>{c.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#1a0a3e', marginBottom: '1px' }}>{c.name}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>{c.count} products</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🔍</div>
          <div style={{ fontWeight: '700' }}>No categories found for "{search}"</div>
        </div>
      )}
    </div>
  );
}
