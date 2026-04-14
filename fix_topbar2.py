c = open('src/components/Topbar.jsx', encoding='utf-8').read()

# Fix keyframes - escape the % signs by moving CSS to a variable
old = "      <style>{\n        @keyframes tbShimmer { 0%{left:-100%} 100%{left:200%} }\n        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:.3} }"
new = "      <style>{\n        @keyframes tbShimmer { from{left:-100%} to{left:200%} }\n        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:.3} }"

c2 = c.replace(old, new)
if c2 != c:
    open('src/components/Topbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Fixed keyframes!')
else:
    print('Not found - trying alternate fix')
    # Find and show the style tag
    idx = c.find('@keyframes')
    print(repr(c[idx:idx+100]))
