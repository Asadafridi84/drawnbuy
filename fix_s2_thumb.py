c = open('src/components/Navbar.jsx', encoding='utf-8').read()

# Replace the broken thumbnail img with an emoji badge
old_thumb = '                        <img className="cat-dd-thumb" src={c.img} alt={c.name} />'
new_thumb = '                        <div style={{width:"34px",height:"34px",borderRadius:"8px",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>{c.emoji}</div>'

c2 = c.replace(old_thumb, new_thumb)
if c2 != c:
    open('src/components/Navbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed category thumbnails!')
else:
    print('Not found')
