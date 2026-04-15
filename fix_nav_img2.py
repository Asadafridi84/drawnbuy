c = open('src/components/Navbar.jsx', encoding='utf-8').read()

old = '''                        <div style={{width:"34px",height:"34px",borderRadius:"8px",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>{c.emoji}</div>'''

new = '''                        <img className="cat-dd-thumb" src={c.img} alt={c.name} onError={e => { e.target.onerror=null; e.target.style.display='none'; }} />'''

c2 = c.replace(old, new)
if c2 != c:
    open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed! img tag restored.')
else:
    print('NOT FOUND - showing context:')
    idx = c.find('emoji}</div>')
    print(repr(c[max(0,idx-200):idx+50]))
