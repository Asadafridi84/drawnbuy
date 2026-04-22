content = open('src/pages/ProfilePage.jsx', encoding='utf-8').read()

content = content.replace(
    "{ id:'feed',      label:'Activity',    icon:'📊' },\n  { id:'whiteboard',label:'Whiteboard',  icon:'🎨' }",
    "{ id:'whiteboard',label:'Collab-Canvas Drawing',  icon:'🎨' },\n  { id:'feed',      label:'Activity',    icon:'📊' }"
)

open('src/pages/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print('Done!')