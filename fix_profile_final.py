"""
fix_profile_final.py
====================
Fixes ProfilePage.jsx broken template literals and missing grid layout.

Problems found:
  1. Line ~134 - className tab-literal corrupted: className={<TAB>b }
                  should be: className={`tb ${tab===id?'on':''}`}
  2. Line ~185 - className tag-literal corrupted: className={tag }
                  should be: className={`ftag ${...}`}
  3. Line ~191 - className sd-literal corrupted:  className={sd }
                  should be: className={`sd ${...}`}
  4. CSS string - .pw has no base grid styles (only a media-query override)
  5. CSS string - trailing ;\\;; is a corrupted template literal close

Run from the drawnbuy project root:
  python fix_profile_final.py
"""

import re, sys, subprocess
from pathlib import Path

# Fix Windows terminal encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

TARGET = Path('src/pages/ProfilePage.jsx')

if not TARGET.exists():
    sys.exit('ERROR: src/pages/ProfilePage.jsx not found -- run from the drawnbuy project root.')

src = TARGET.read_text(encoding='utf-8')
original = src

# ---- Fix 1: broken tab-button className --------------------------------------
# Was:  className={\tb }  (tab char between { and b)
# Fix:  className={`tb ${tab===id?'on':''}`}
broken_tb = "className={\tb }"
fixed_tb  = "className={`tb ${tab===id?'on':''}`}"
if broken_tb in src:
    src = src.replace(broken_tb, fixed_tb)
    print('[OK] Fix 1: tab-button className repaired')
else:
    patched = re.sub(
        r'className=\{[\t ]+b[\t ]+\}',
        "className={`tb ${tab===id?'on':''}`}",
        src
    )
    if patched != src:
        src = patched
        print('[OK] Fix 1: tab-button className repaired (regex)')
    else:
        print('[WARN] Fix 1: tab-button className -- pattern not found (check manually)')

# ---- Fix 2: broken friend-tag className --------------------------------------
# Was:  className={\x0ctag }  (\x0c = form feed char — invisible corruption)
# Fix:  className={`ftag ${f.status==='invited'?'tinv':f.rel==='Family'?'tfam':'tfri'}`}
broken_tag     = "className={\x0ctag }"
broken_tag_alt = "className={tag }"
fixed_tag      = "className={`ftag ${f.status==='invited'?'tinv':f.rel==='Family'?'tfam':'tfri'}`}"
if broken_tag in src:
    src = src.replace(broken_tag, fixed_tag)
    print('[OK] Fix 2: friend-tag className repaired (form-feed variant)')
elif broken_tag_alt in src:
    src = src.replace(broken_tag_alt, fixed_tag)
    print('[OK] Fix 2: friend-tag className repaired')
else:
    print('[WARN] Fix 2: friend-tag className -- pattern not found (check manually)')

# ---- Fix 3: broken status-dot className --------------------------------------
# Was:  className={sd }
# Fix:  className={`sd ${f.status==='online'?'son':f.status==='invited'?'sin':'sof'}`}
broken_sd = "className={sd }"
fixed_sd  = "className={`sd ${f.status==='online'?'son':f.status==='invited'?'sin':'sof'}`}"
if broken_sd in src:
    src = src.replace(broken_sd, fixed_sd)
    print('[OK] Fix 3: status-dot className repaired')
else:
    print('[WARN] Fix 3: status-dot className -- pattern not found (check manually)')

# ---- Fix 4: add base grid styles to .pw --------------------------------------
old_pw_media = '@media(max-width:768px){.pw{grid-template-columns:1fr}}'
new_pw_full  = (
    '.pw{display:grid;grid-template-columns:260px 1fr;gap:1.5rem;'
    'align-items:start;max-width:1200px;margin:0 auto}'
    '@media(max-width:900px){.pw{grid-template-columns:1fr}}'
)
if old_pw_media in src:
    src = src.replace(old_pw_media, new_pw_full)
    print('[OK] Fix 4: .pw base grid layout added')
else:
    print('[WARN] Fix 4: .pw media rule -- pattern not found (check manually)')

# ---- Fix 5: corrupted CSS template literal close -----------------------------
# The CSS const ends with ;\\;; -- should be `; (closing backtick + semicolon)
corrupted_end = ';\x5c;;'   # ;\;; using hex to avoid escape warning
if corrupted_end in src:
    src = src.replace(corrupted_end, '`;')
    print('[OK] Fix 5: CSS template literal close repaired')
else:
    # Also try the literal string as it may appear
    alt_end = ';\;;'
    if alt_end in src:
        src = src.replace(alt_end, '`;')
        print('[OK] Fix 5: CSS template literal close repaired (alt pattern)')
    else:
        print('[INFO] Fix 5: corrupted CSS close not found -- may already be correct')

# ---- Write result ------------------------------------------------------------
if src == original:
    print('\n[WARN] No changes made. File may already be fixed, or patterns shifted.')
    print('  Open ProfilePage.jsx and search for: className={  and className={tag')
    sys.exit(0)

backup = TARGET.with_suffix('.jsx.bak')
backup.write_text(original, encoding='utf-8')
print(f'\n[BACKUP] Saved -> {backup}')

TARGET.write_text(src, encoding='utf-8')
print('[OK] ProfilePage.jsx written successfully.')

# ---- Quick file sanity check -------------------------------------------------
size = TARGET.stat().st_size
print(f'[OK] File size: {size} bytes')

print('\nDone. Fixes applied:')
print('  1. className={<TAB>b } -> className={`tb ${tab===id?"on":""}`}')
print('  2. className={tag }    -> className={`ftag ${...status/rel...}`}')
print('  3. className={sd }     -> className={`sd ${...status...}`}')
print('  4. .pw base grid styles added (260px sidebar + 1fr main)')
print('  5. ;\\;; -> `; (CSS template literal close)')
