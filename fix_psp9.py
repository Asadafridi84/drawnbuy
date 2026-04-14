c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

old = '                <span className="drag-badge">DRAG</span>\n                <div style={{ padding: '
new = '                <span className="drag-badge">DRAG</span>\n                <img src={p.img} alt={p.name} style={{ width: "100%", height: "78px", objectFit: "cover", display: "block", pointerEvents: "none" }} />\n                <div style={{ padding: '

c2 = c.replace(old, new)
if c2 != c:
    open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed!')
else:
    print('NOT FOUND - showing context:')
    idx = c.find('drag-badge')
    print(repr(c[idx:idx+200]))
