c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Make image much smaller - 30px height, and card grid 5 columns
c = c.replace(
    "grid-template-columns:repeat(4,1fr); gap:.5rem; }",
    "grid-template-columns:repeat(5,1fr); gap:.4rem; }"
)
c = c.replace(
    "height: '80px', objectFit: 'contain', display: 'block', pointerEvents: 'none', padding: '6px', background: '#f4f0ff'",
    "height: '30px', objectFit: 'contain', display: 'block', pointerEvents: 'none', padding: '2px', background: '#f4f0ff'"
)

open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c)
print('Done!')
