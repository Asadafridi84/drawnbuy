c = open('server/index.js', encoding='utf-8').read()
old = "imgSrc:         [\"'self'\", \"data:\", \"blob:\"],"
new = "imgSrc:         [\"'self'\", \"data:\", \"blob:\", \"https://placehold.co\", \"https://images.unsplash.com\", \"https://images.pexels.com\"],"
c2 = c.replace(old, new)
if c2 == c:
    print('NOT FOUND')
    idx = c.find('imgSrc')
    print(repr(c[idx:idx+80]))
else:
    open('server/index.js', 'w', encoding='utf-8').write(c2)
    print('Fixed!')
