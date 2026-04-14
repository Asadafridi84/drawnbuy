c = open('src/components/Navbar.jsx', encoding='utf-8').read()

# Fix 1: Replace LogoMark with correct SVG from reference
old_logo = """const LogoMark = () => (
  <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
    <img
      src="https://placehold.co/300x300/7c3aed/white?text=Product"
      alt=""
      style={{ width: '46px', height: '46px', borderRadius: '12px', objectFit: 'cover', opacity: .55, display: 'block' }}
    />
    <div style={{ position: 'absolute', inset: 0, width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(124,58,237,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 24 Q10 12 18 12 Q26 12 26 18 Q26 24 18 22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="24" cy="24" r="3" fill="#67e8f9"/>
        <path d="M14 20 L18 24 L22 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  </div>
);"""

new_logo = """const LogoMark = () => (
  <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="46" height="46">
      <defs>
        <linearGradient id="nb-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
        <linearGradient id="nb-cart" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        <linearGradient id="nb-canvas" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4f0ff"/><stop offset="100%" stopColor="#ede9fe"/></linearGradient>
      </defs>
      <rect x="1.5" y="2" width="21" height="15" rx="3" fill="url(#nb-screen)"/>
      <rect x="3" y="2.5" width="18" height="4" rx="1.5" fill="#fff" fillOpacity="0.07"/>
      <rect x="3" y="3.5" width="18" height="12" rx="1.8" fill="url(#nb-canvas)"/>
      <text x="5.2" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#7c3aed">D</text>
      <text x="10.1" y="8.4" fontFamily="Georgia,serif" fontSize="3.5" fontWeight="400" fill="#fbbf24">&apos;</text>
      <text x="10.8" y="11.8" fontFamily="Georgia,serif" fontSize="5" fontWeight="400" fill="#5b21b6">n</text>
      <text x="14.3" y="8.4" fontFamily="Georgia,serif" fontSize="3.5" fontWeight="400" fill="#fbbf24">&grave;</text>
      <text x="14.8" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#67e8f9">B</text>
      <rect x="11" y="17" width="2" height="2.5" rx="0.5" fill="#5b21b6"/>
      <rect x="6.5" y="19.5" width="11" height="3" rx="1.5" fill="url(#nb-cart)"/>
      <rect x="7.5" y="20" width="5" height="1" rx="0.5" fill="#fff" fillOpacity="0.25"/>
      <circle cx="9.5" cy="22.8" r="0.85" fill="#3b0764"/>
      <circle cx="14.5" cy="22.8" r="0.85" fill="#3b0764"/>
      <circle cx="9.5" cy="22.8" r="0.35" fill="#fbbf24"/>
      <circle cx="14.5" cy="22.8" r="0.35" fill="#fbbf24"/>
    </svg>
  </div>
);"""

c = c.replace(old_logo, new_logo)
print('Logo fixed:', old_logo[:30] not in c)

# Fix 2: Category dropdown - add onClick to navigate to category
old_cat_item = """                      <div key={c.slug} className="cat-dd-item">
                        <img className="cat-dd-thumb" src={c.img} alt={c.name} />
                        <span>{c.emoji} {c.name}</span>
                        <span className="cat-dd-count">{c.count}</span>
                      </div>"""

new_cat_item = """                      <div key={c.slug} className="cat-dd-item" onClick={() => { setCatDdOpen(false); scrollTo('catsSection'); }}>
                        <img className="cat-dd-thumb" src={c.img} alt={c.name} />
                        <span>{c.emoji} {c.name}</span>
                        <span className="cat-dd-count">{c.count}</span>
                      </div>"""

c = c.replace(old_cat_item, new_cat_item)
print('Cat dropdown click fixed:', 'setCatDdOpen(false)' in c)

# Fix 3: Search suggestions - add onClick
old_sugg = """                <div key={c.slug} className="sugg-item">
                  <span>{c.emoji}</span>
                  <span className="sugg-name">{c.name}</span>
                  <span className="sugg-badge">{c.count}</span>
                </div>"""

new_sugg = """                <div key={c.slug} className="sugg-item" onClick={() => { setSearchVal(c.name); setSearchOpen(false); scrollTo('catsSection'); }}>
                  <span>{c.emoji}</span>
                  <span className="sugg-name">{c.name}</span>
                  <span className="sugg-badge">{c.count}</span>
                </div>"""

c = c.replace(old_sugg, new_sugg)
print('Search suggestion click fixed:', 'setSearchVal(c.name)' in c)

open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c)
print('All Navbar fixes done!')
