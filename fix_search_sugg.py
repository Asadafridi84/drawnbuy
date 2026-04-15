c = open('src/components/Navbar.jsx', encoding='utf-8').read()

# Fix search suggestions to show image instead of just emoji
old = '''                <div key={c.slug} className="sugg-item" onClick={() => { setSearchVal(c.name); setSearchOpen(false); scrollTo('catsSection'); }}>
                  <span>{c.emoji}</span>
                  <span className="sugg-name">{c.name}</span>
                  <span className="sugg-badge">{c.count}</span>
                </div>'''

new = '''                <div key={c.slug} className="sugg-item" onClick={() => { setSearchOpen(false); if(onCatClick) onCatClick(c); else scrollTo('catsSection'); }}>
                  <img src={c.img} alt={c.name} onError={e => { e.target.onerror=null; e.target.style.display='none'; }} style={{width:'32px',height:'32px',borderRadius:'7px',objectFit:'cover',flexShrink:0}} />
                  <span className="sugg-name">{c.name}</span>
                  <span className="sugg-badge">{c.count}</span>
                </div>'''

c2 = c.replace(old, new)
if c2 != c:
    open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed search suggestions!')
else:
    print('NOT FOUND')
    idx = c.find('sugg-item')
    print(repr(c[idx:idx+300]))
