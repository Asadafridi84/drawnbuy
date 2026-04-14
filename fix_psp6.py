import re

c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Find the product card JSX and replace image with proper small size
# The img needs its parent div to be flex row
old_img = "width: '52px', height: '52px', objectFit: 'cover', display: 'block', pointerEvents: 'none', flexShrink: 0, borderRadius: '6px'"
new_img = "width: '100%', height: '65px', objectFit: 'cover', display: 'block', pointerEvents: 'none', borderRadius: '6px 6px 0 0'"

c2 = c.replace(old_img, new_img)

# Also fix grid to 6 columns for smaller cards
c2 = c2.replace(
    "grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.5rem; }",
    "grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:.4rem; }"
)

if c2 != c:
    open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed!')
else:
    print('No changes')
