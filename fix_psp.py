c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Fix product image size - make it smaller/thumbnail
old = "style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}"
new = "style={{ width: '100%', height: '120px', objectFit: 'contain', display: 'block', pointerEvents: 'none', padding: '8px', background: '#f4f0ff' }}"

c2 = c.replace(old, new)
if c2 != c:
    open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed PSP image size!')
else:
    print('Pattern not found')
    # Show the image lines
    import re
    for m in re.finditer(r'img src.{0,200}', c):
        print(m.group()[:150])
