c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Fix 1: Make product grid 4 columns instead of 3
c = c.replace(
    'grid-template-columns:repeat(3,1fr); gap:.65rem; }',
    'grid-template-columns:repeat(4,1fr); gap:.5rem; }'
)

# Fix 2: Make image height smaller
c = c.replace(
    "height: '120px', objectFit: 'contain', display: 'block', pointerEvents: 'none', padding: '8px', background: '#f4f0ff'",
    "height: '80px', objectFit: 'contain', display: 'block', pointerEvents: 'none', padding: '6px', background: '#f4f0ff'"
)

open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c)
print('Done!')
