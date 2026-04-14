c = open('src/components/Sponsors.jsx', encoding='utf-8').read()
# Add return ( after the function declaration
old = 'export default function Sponsors() {\n    <div'
new = 'export default function Sponsors() {\n  return (\n    <div'
c2 = c.replace(old, new)
# Also need to close the return with )
# Find the last closing tag and add )
if c2 != c:
    # Add closing ) before last }
    last_brace = c2.rfind('\n}')
    c2 = c2[:last_brace] + '\n  );\n}'
    open('src/components/Sponsors.jsx', 'w', encoding='utf-8').write(c2)
    print('Sponsors fixed!')
else:
    print('Pattern not found, showing start:')
    print(repr(c[:200]))
