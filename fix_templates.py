
# fix_templates.py - fixes backtick escaping in ProfilePage.jsx
path = 'src/pages/ProfilePage.jsx'
content = open(path, 'r', encoding='utf-8').read()

# PowerShell escaped `$ to `${ - fix all template literals
content = content.replace('`$', '${').replace('`${', '${')

# Also fix any double-escaped backticks
content = content.replace('``', '`')

open(path, 'w', encoding='utf-8', newline='\n').write(content)
print('Fixed! Lines:', content.count('\n'))
print('Template literals found:', content.count('${'))
