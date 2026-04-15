# Fix App.jsx - pass onCatClick to Navbar
c = open('src/App.jsx', encoding='utf-8').read()
old = '<Navbar onShare={() => setShareOpen(true)} cartCount={cartCount} />'
new = '<Navbar onShare={() => setShareOpen(true)} cartCount={cartCount} onCatClick={setActiveCat} />'
c2 = c.replace(old, new)
if c2 != c:
    open('src/App.jsx', 'w', encoding='utf-8').write(c2)
    print('App.jsx fixed!')
else:
    print('App.jsx pattern not found, showing context:')
    idx = c.find('<Navbar')
    print(repr(c[idx:idx+100]))
