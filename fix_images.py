import re

files = ['src/data/index.js', 'src/components/DragStrip.jsx', 'src/components/Navbar.jsx']

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    before = c.count('unsplash')
    c2 = re.sub(r'https://images\.unsplash\.com/[^\'"`]+', 'https://placehold.co/300x300/7c3aed/white?text=Product', c)
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(c2)
    print(f'Fixed {f}: {before} -> {c2.count(chr(117)+chr(110)+chr(115)+chr(112)+chr(108)+chr(97)+chr(115)+chr(104))} unsplash URLs')

print('All done!')
