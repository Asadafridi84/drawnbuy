c = open('src/components/Navbar.jsx', encoding='utf-8').read()

# Fix: category click should open the specific category page via onCatClick prop
# Currently: onClick={() => { setCatDdOpen(false); scrollTo('catsSection'); }}
# Should be: onClick={() => { setCatDdOpen(false); onCatClick(c); }}

old = "onClick={() => { setCatDdOpen(false); scrollTo('catsSection'); }}"
new = "onClick={() => { setCatDdOpen(false); if(onCatClick) onCatClick(c); else scrollTo('catsSection'); }}"

c2 = c.replace(old, new)
if c2 != c:
    open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed! Category click now opens category page.')
else:
    print('NOT FOUND')
    idx = c.find('setCatDdOpen')
    print(repr(c[idx:idx+100]))
