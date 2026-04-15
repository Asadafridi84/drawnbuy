c = open('src/data/index.js', encoding='utf-8').read()

replacements = [
  ("slug:'womens-fashion'",    "photo-1515886657613-9f3515b0c78f"),
  ("slug:'mens-fashion'",      "photo-1617137968427-85924c800a22"),
  ("slug:'shoes-sneakers'",    "photo-1542291026-7eec264c27ff"),
  ("slug:'beauty-cosmetics'",  "photo-1596462502278-27bfdc403348"),
  ("slug:'watches-jewelry'",   "photo-1523275335684-37898b6baf30"),
  ("slug:'smartphones'",       "photo-1511707171634-5f897ff02aa9"),
  ("slug:'laptops-computers'", "photo-1517336714731-489689fd1ca8"),
  ("slug:'audio-headphones'",  "photo-1505740420928-5e560c06d30e"),
  ("slug:'gaming'",            "photo-1593305841991-05c297ba4575"),
  ("slug:'office-supplies'",   "photo-1497366216548-37526070297c"),
  ("slug:'furniture'",         "photo-1555041469-a586c61ea9bc"),
  ("slug:'home-decor'",        "photo-1586023492125-27b2c045efd7"),
  ("slug:'kitchen-gadgets'",   "photo-1556909114-f6e7ad7d3136"),
  ("slug:'garden-outdoor'",    "photo-1416879595882-3373a0480b5b"),
  ("slug:'training-health'",   "photo-1534438327276-14e5300c3a48"),
  ("slug:'hygiene-care'",      "photo-1556228578-0d85b1a4d571"),
  ("slug:'food-snacks'",       "photo-1504674900247-0877df9cc836"),
  ("slug:'food-store'",        "photo-1542838132-92c53300491e"),
  ("slug:'restaurants'",       "photo-1414235077428-338989a2e8c0"),
  ("slug:'kids-clothes'",      "photo-1543269865-cbf427effbad"),
  ("slug:'kids-toys'",         "photo-1558618666-fcd25c85cd64"),
  ("slug:'books'",             "photo-1512820790803-83ca734da794"),
  ("slug:'art-supplies'",      "photo-1513364776144-60967b0f800f"),
  ("slug:'car-accessories'",   "photo-1492144534655-ae79c964c9d7"),
  ("slug:'pets'",              "photo-1450778869180-41d0601e046e"),
  ("slug:'shopping-stores'",   "photo-1555529669-e69e7aa0ba9a"),
  ("slug:'car-parts'",         "photo-1492144534655-ae79c964c9d7"),
  ("slug:'car-repair-garage'", "photo-1625047509168-a7026f36de04"),
  ("slug:'sportswear-mens'",   "photo-1483721310020-03333e577078"),
  ("slug:'sportswear-womens'", "photo-1518310383802-640c2de311b2"),
  ("slug:'sport-shoes'",       "photo-1542291026-7eec264c27ff"),
]

import re
fixed = 0
for slug, photo in replacements:
    pattern = f"({re.escape(slug)}[^{{}}]+?)img:'https://placehold\\.co/[^']+'"
    replacement = f"\\1img:'https://images.unsplash.com/{photo}?w=300&q=80'"
    new_c = re.sub(pattern, replacement, c)
    if new_c != c:
        c = new_c
        fixed += 1

open('src/data/index.js', 'w', encoding='utf-8').write(c)
print(f'Fixed {fixed} category images!')
