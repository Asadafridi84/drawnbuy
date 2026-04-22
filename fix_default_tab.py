content = open('src/pages/ProfilePage.jsx', encoding='utf-8').read()
content = content.replace("useState('feed')", "useState('whiteboard')")
open('src/pages/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print('Done!')