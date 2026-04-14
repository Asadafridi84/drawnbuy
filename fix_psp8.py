import re
c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Fix 1: Change grid to horizontal flex scroll (matching reference HTML)
c = c.replace(
    "grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:.4rem; }",
    "display:flex; gap:.75rem; overflow-x:auto; padding-bottom:.35rem; scrollbar-width:thin; min-height:110px; align-items:flex-start; }"
)

# Fix 2: Add image back with correct size  
c = re.sub(
    r'(<div[^>]*className="psp-drag[^>]*>DRAG</div>)',
    r'<img src={p.img} alt={p.name} style={{ width: "100%", height: "78px", objectFit: "cover", display: "block", pointerEvents: "none" }} />\n              \1',
    c
)

# Fix 3: Add min-width to each card
c = c.replace(
    'position:relative;',
    'position:relative; min-width:130px; flex-shrink:0;'
)

open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c)
print('Done!')
