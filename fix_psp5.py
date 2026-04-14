c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Fix image to be tiny square thumbnail on left side
c = c.replace(
    "height: '80px', objectFit: 'cover', display: 'block', pointerEvents: 'none'",
    "width: '52px', height: '52px', objectFit: 'cover', display: 'block', pointerEvents: 'none', flexShrink: 0, borderRadius: '6px'"
)

open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c)
print('Done!')
