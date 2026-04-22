import pathlib

p = pathlib.Path('src/pages/ProfilePage.jsx')
src = p.read_text(encoding='utf-8')

# Fix 1: CSS template literal - add opening backtick
# Line 31 is "const CSS = " followed by newline then CSS rules
src = src.replace('const CSS = \n', 'const CSS = `\n', 1)

# Fix 2: CSS template literal - add closing backtick before export
src = src.replace(
    '@media(max-width:768px){.pw{grid-template-columns:1fr}}.pw{display:grid;grid-template-columns:260px 1fr;gap:1.5rem;max-width:960px;margin:0 auto;align-items:start}\n\nexport default function ProfilePage',
    '@media(max-width:768px){.pw{grid-template-columns:1fr}}.pw{display:grid;grid-template-columns:260px 1fr;gap:1.5rem;max-width:960px;margin:0 auto;align-items:start}\n`;\n\nexport default function ProfilePage',
    1
)

# Fix 3: Tab button - \t + b + \\ pattern
# Raw bytes: { TAB b BACKSLASH }
src = src.replace(
    'className={\tb\\}',
    "className={`tb${tab===id?' on':''}`}",
    1
)

# Fix 4: Friend tag - \x0c + tag + space + \\ pattern  
# Raw bytes: { FORMFEED t a g SPACE BACKSLASH }
src = src.replace(
    'className={\x0ctag \\}',
    "className={`ftag ${f.status==='invited'?'tinv':f.rel==='Family'?'tfam':'tfri'}`}",
    1
)

# Fix 5: Status dot - find any remaining broken sd className
# Check what exact bytes are there
lines = src.split('\n')
for i, l in enumerate(lines, 1):
    if 'className={' in l and 'sd' in l and '`' not in l and 'title={f.status}' in l:
        print(f"SD line {i}: {repr(l.strip())}")
        fixed = l.replace(l[l.find('className={'):l.find('}')+1], "className={`sd ${f.status==='online'?'son':f.status==='invited'?'sin':'sof'}`}")
        src = src.replace(l, fixed, 1)
        print(f"Fixed to: {repr(fixed.strip())}")
        break

p.write_text(src, encoding='utf-8')
print('Done. Verifying...')

# Verify the 3 fixes
lines = src.split('\n')
print('Line 31:', repr(lines[30][:50]))
for i, l in enumerate(lines, 1):
    if 'tab===id' in l or 'ftag' in l or ("sd " in l and 'son' in l):
        print(f'FIXED line {i}: {l.strip()[:80]}')
