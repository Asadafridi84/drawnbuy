c = open('src/components/Navbar.jsx', encoding='utf-8').read()

# Find the emoji div and replace with proper img tag
import re
old = re.search(r'<div style=\{\{[\s\S]*?group===.*?boxShadow.*?\}\}>\{c\.emoji\}</div>', c)
if old:
    print('Found emoji div, replacing with img tag')
    c2 = c.replace(old.group(0), '<img className="cat-dd-thumb" src={c.img} alt={c.name} onError={e => e.target.style.display="none"} />')
    open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed!')
else:
    # Try simpler approach
    idx = c.find('cat-dd-thumb')
    print('cat-dd-thumb context:')
    print(repr(c[idx-20:idx+200]))
