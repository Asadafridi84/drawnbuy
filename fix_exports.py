c = open('src/data/index.js', encoding='utf-8').read()

# Fix missing export keywords
fixes = [
    ('SPONSORS = [', 'export const SPONSORS = ['),
    ('DRAG_PRODS = [', 'export const DRAG_PRODS = ['),
    ('HERO_PRODS = [', 'export const HERO_PRODS = ['),
    ('DEALS = [', 'export const DEALS = ['),
    ('CATS = [', 'export const CATS = ['),
    ('GROUPS = [', 'export const GROUPS = ['),
]

count = 0
for old, new in fixes:
    if old in c and new not in c:
        c = c.replace(old, new)
        print(f'Fixed: {old}')
        count += 1

open('src/data/index.js', 'w', encoding='utf-8').write(c)
print(f'Total fixed: {count}')
