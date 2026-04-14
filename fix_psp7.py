import re
c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Remove the img tag entirely from PSP product cards
# Replace the img line with nothing
c2 = re.sub(
    r'<img\s+src=\{p\.img\}[^/]*/>\s*',
    '',
    c
)

if c2 != c:
    open('src/components/ProductSearchPanel.jsx', 'w', encoding='utf-8').write(c2)
    print('Removed PSP images!')
else:
    print('Pattern not found')
