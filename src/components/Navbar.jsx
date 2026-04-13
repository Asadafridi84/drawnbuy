import { useState, useRef, useEffect } from 'react';
import { CATS } from '../data';

const LogoSVG = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="url(#lg1)"/>
    <rect x="2" y="2" width="32" height="32" rx="8" fill="rgba(255,255,255,0.08)"/>
    <path d="M10 24 Q10 12 18 12 Q26 12 26 18 Q26 24 18 22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <circle cx="24" cy="24" r="3" fill="#67e8f9"/>
    <path d="M14 20 L18 24 L22 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#7c3aed"/>
        <stop offset="100%" stopColor="#3b0764"/>
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar({ onShare, cartCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catDdOpen, setCatDdOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const ddRef = useRef(null);

  const filteredCats = CATS.filter(c =>
    c.name.toLowerCase().includes(catFilter.toLowerCase())
  );

  useEffect(() => {
    const handler = e => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setCatDdOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const suggestions = searchVal.length > 1
    ? CATS.filter(c => c.name.toLowerCase().includes(searchVal.toLowerCase())).slice(0, 5)
    : [];

  return (
    <>
      <style>{`
        .nav-root {
          background: #7c3aed;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          height: 64px;
          position: sticky;
          top: 0;
          z-index: 400;
          box-shadow: 0 2px 20px rgba(0,0,0,.2);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .logo { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
        .logo-text { font-size:20px; font-weight:800; letter-spacing:-.5px; }
        .logo-text .ld { color:#f3e8ff; }
        .logo-text .ln { color:#fff; }
        .logo-text .lb { color:#67e8f9; }
        .logo-tagline { font-size:9px; font-weight:600; color:rgba(255,255,255,.5); letter-spacing:.03em; white-space:nowrap; }
        .cat-dd-wrap { position:relative; flex-shrink:0; }
        .cat-dd-btn {
          display:flex; align-items:center; gap:7px;
          background:rgba(255,255,255,.13); border:1.5px solid rgba(255,255,255,.2);
          color:#fff; padding:8px 13px; border-radius:10px; cursor:pointer;
          font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700;
          white-space:nowrap; transition:.15s;
        }
        .cat-dd-btn:hover { background:rgba(255,255,255,.2); }
        .cat-dd-menu {
          position:absolute; top:calc(100% + 8px); left:0; width:300px;
          background:#fff; border:1.5px solid #ede9fe; border-radius:14px;
          box-shadow:0 12px 40px rgba(124,58,237,.18); z-index:600; overflow:hidden;
          animation: ddIn .15s ease;
        }
        @keyframes ddIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        .cat-dd-list { max-height:340px; overflow-y:auto; }
        .cat-dd-item {
          display:flex; align-items:center; gap:.6rem; padding:.45rem .75rem;
          cursor:pointer; border-bottom:1px solid rgba(0,0,0,.04); transition:.12s;
          font-size:13px; color:#1a0a3e; font-weight:600;
        }
        .cat-dd-item:hover { background:#f4f0ff; }
        .cat-dd-thumb { width:34px; height:34px; border-radius:8px; object-fit:cover; flex-shrink:0; border:1.5px solid #ede9fe; }
        .cat-dd-count { font-size:10px; color:#9ca3af; margin-left:auto; white-space:nowrap; }
        .nav-search-wrap { flex:1; max-width:420px; display:flex; position:relative; }
        .nav-search-wrap input {
          flex:1; background:rgba(255,255,255,.13); border:1.5px solid rgba(255,255,255,.18);
          border-radius:10px 0 0 10px; color:#fff; font-family:'Space Grotesk',sans-serif;
          font-size:13px; padding:9px 14px; outline:none; transition:.2s;
        }
        .nav-search-wrap input::placeholder { color:rgba(255,255,255,.45); }
        .nav-search-wrap input:focus { background:rgba(255,255,255,.2); border-color:#67e8f9; }
        .nav-search-btn {
          background:#fbbf24; border:none; color:#3b0764; padding:0 15px;
          border-radius:0 10px 10px 0; cursor:pointer; font-size:15px; font-weight:800;
        }
        .search-sugg {
          position:absolute; top:calc(100% + 4px); left:0; right:38px;
          background:#fff; border:1.5px solid #ede9fe; border-radius:10px;
          box-shadow:0 8px 28px rgba(124,58,237,.14); z-index:500; overflow:hidden;
        }
        .sugg-item {
          display:flex; align-items:center; gap:.55rem; padding:.5rem .75rem;
          cursor:pointer; border-bottom:1px solid #e5e7eb; transition:.12s;
        }
        .sugg-item:last-child { border-bottom:none; }
        .sugg-item:hover { background:#f4f0ff; }
        .sugg-name { font-size:13px; font-weight:600; color:#1a0a3e; }
        .sugg-badge { font-size:10px; font-weight:700; color:#7c3aed; background:#ede9fe; padding:1px 7px; border-radius:20px; margin-left:auto; }
        .nav-links { display:flex; gap:2px; }
        .nav-links a {
          color:rgba(255,255,255,.8); text-decoration:none; font-size:13px; font-weight:600;
          padding:7px 10px; border-radius:8px; cursor:pointer; transition:.15s; white-space:nowrap;
        }
        .nav-links a:hover { color:#fff; background:rgba(255,255,255,.12); }
        .nav-links a.hot { color:#fbbf24; }
        .live-badge {
          display:inline-flex; align-items:center; gap:3px; background:#22c55e; color:#fff;
          font-size:9px; font-weight:800; padding:2px 6px; border-radius:20px; margin-left:4px;
          vertical-align:middle; animation:pulseLive 2s infinite;
        }
        @keyframes pulseLive { 0%,100%{opacity:1} 50%{opacity:.75} }
        .cart-wrap { position:relative; cursor:pointer; }
        .cart-ico {
          background:rgba(255,255,255,.12); border:1.5px solid rgba(255,255,255,.2);
          width:38px; height:38px; border-radius:9px; display:flex; align-items:center; justify-content:center;
        }
        .cart-badge {
          position:absolute; top:-5px; right:-5px; background:#fbbf24; color:#3b0764;
          font-size:9px; font-weight:800; min-width:17px; height:17px; border-radius:9px;
          display:flex; align-items:center; justify-content:center; padding:0 3px;
        }
        .btn-ghost {
          background:transparent; border:1.5px solid rgba(255,255,255,.35); color:#fff;
          padding:8px 14px; border-radius:9px; cursor:pointer; font-family:'Space Grotesk',sans-serif;
          font-size:13px; font-weight:600; transition:.15s; white-space:nowrap;
        }
        .btn-ghost:hover { border-color:#fff; }
        .btn-cta {
          background:#fbbf24; border:none; color:#3b0764; padding:8px 17px; border-radius:9px;
          cursor:pointer; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:800;
          white-space:nowrap; transition:.15s;
        }
        .btn-cta:hover { background:#d97706; }
        .share-btn {
          display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.12);
          border:1.5px solid rgba(255,255,255,.2); color:#fff; padding:7px 13px; border-radius:9px;
          cursor:pointer; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600;
          transition:.15s; white-space:nowrap;
        }
        .share-btn:hover { background:rgba(255,255,255,.2); }
        .hamburger {
          display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px;
        }
        .hamburger span { display:block; width:22px; height:2px; background:#fff; border-radius:2px; }
        .mobile-nav {
          display:none; position:fixed; inset:0; background:rgba(59,7,100,.97);
          z-index:800; flex-direction:column; padding:2rem;
        }
        .mobile-nav.open { display:flex; }
        .mob-close {
          align-self:flex-end; background:rgba(255,255,255,.1); border:none; color:#fff;
          width:36px; height:36px; border-radius:50%; font-size:18px; cursor:pointer; margin-bottom:1.5rem;
        }
        .mob-link {
          color:rgba(255,255,255,.85); font-size:1.1rem; font-weight:700; padding:.9rem 0;
          border-bottom:1px solid rgba(255,255,255,.08); cursor:pointer; display:block; text-decoration:none;
        }
        @media(max-width:768px) {
          .hamburger { display:flex; }
          .cat-dd-wrap, .nav-search-wrap, .nav-links, .share-btn { display:none !important; }
          .btn-ghost { display:none !important; }
        }
      `}</style>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mob-close" onClick={() => setMobileOpen(false)}>✕</button>
        <a className="mob-link" onClick={() => scrollTo('collabSection')}>🎨 Canvas</a>
        <a className="mob-link" onClick={() => scrollTo('pspSection')}>🔍 Products</a>
        <a className="mob-link" onClick={() => scrollTo('dealsAnchor')}>🔥 Deals</a>
        <a className="mob-link" onClick={() => scrollTo('catsSection')}>📦 Categories</a>
        <a className="mob-link" onClick={() => scrollTo('hiwSection')}>❓ How It Works</a>
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <button className="btn-ghost" style={{ width: '100%', textAlign: 'center' }}>Log In</button>
          <button className="btn-cta" style={{ width: '100%', textAlign: 'center', padding: '12px' }}>Sign Up Free</button>
        </div>
      </div>

      <nav className="nav-root">
        {/* Logo */}
        <a className="logo" href="/">
          <LogoSVG />
          <div>
            <div className="logo-text">
              <span className="ld">Draw</span><span className="ln">N</span><span className="lb">Buy</span>
            </div>
            <div className="logo-tagline">Draw it. Find it. Buy it.</div>
          </div>
        </a>

        {/* Category Dropdown */}
        <div className="cat-dd-wrap" ref={ddRef}>
          <button className="cat-dd-btn" onClick={() => setCatDdOpen(o => !o)}>
            📦 All Categories
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ transform: catDdOpen ? 'rotate(180deg)' : 'none', transition: '.2s' }}>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
          {catDdOpen && (
            <div className="cat-dd-menu">
              <div style={{ padding: '.55rem .75rem', borderBottom: '1px solid #e5e7eb' }}>
                <input
                  type="text"
                  placeholder="Filter categories..."
                  value={catFilter}
                  onChange={e => setCatFilter(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '6px 10px', fontFamily: 'inherit', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div className="cat-dd-list">
                {filteredCats.map(c => (
                  <div key={c.slug} className="cat-dd-item">
                    <img className="cat-dd-thumb" src={c.img} alt={c.name} />
                    <span>{c.emoji} {c.name}</span>
                    <span className="cat-dd-count">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="nav-search-wrap">
          <input
            type="text"
            placeholder="Search e.g. Nike, iPhone, IKEA sofa..."
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setSearchOpen(true); }}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            onFocus={() => setSearchOpen(true)}
          />
          <button className="nav-search-btn">🔍</button>
          {searchOpen && suggestions.length > 0 && (
            <div className="search-sugg">
              {suggestions.map(c => (
                <div key={c.slug} className="sugg-item">
                  <span>{c.emoji}</span>
                  <span className="sugg-name">{c.name}</span>
                  <span className="sugg-badge">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="nav-links">
          <a className="hot" onClick={() => scrollTo('dealsAnchor')}>🔥 Deals</a>
          <a onClick={() => scrollTo('collabSection')}>Canvas</a>
          <a onClick={() => scrollTo('catsSection')}>Categories</a>
          <a>Live<span className="live-badge">247</span></a>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 }}>
          <button className="share-btn" onClick={onShare}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Canvas
          </button>
          <div className="cart-wrap">
            <div className="cart-ico">
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <button className="btn-ghost">Log In</button>
          <button className="btn-cta">Sign Up Free</button>
          <button className="hamburger" onClick={() => setMobileOpen(true)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>
    </>
  );
}
