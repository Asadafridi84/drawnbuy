c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Fix image to be same size as hero ad cards - small thumbnail
c = c.replace(
    "height: '30px', objectFit: 'contain', display: 'block', pointerEvents: 'none', padding: '2px', background: '#f4f0ff'",
    "height: '80px', objectFit: 'cover', display: 'block', pointerEvents: 'none'"
)

# Fix grid to match - more columns, fixed width cards like hero ads
c = c.replace(
    "grid-template-columns:repeat(5,1fr); gap:.4rem; }",
    "grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.5rem; }"
)

open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c)
print('Done!')
