c = open('src/components/Navbar.jsx', encoding='utf-8').read()
# Add onCatClick to the destructured props
old = "export default function Navbar({ onShare, cartCount = 0 }) {"
new = "export default function Navbar({ onShare, cartCount = 0, onCatClick }) {"
c2 = c.replace(old, new)
if c2 != c:
    open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Navbar props fixed!')
else:
    print('Pattern not found')
