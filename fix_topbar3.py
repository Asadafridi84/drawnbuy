c = open('src/components/Topbar.jsx', encoding='utf-8').read()

# Move CSS out of JSX - replace style tag with a global CSS string at top of file
old_style = """      <style>{\
        @keyframes tbShimmer { from{left:-100%} to{left:200%} }
        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:.3} }
        .topbar::after {
          content:''; position:absolute; bottom:0; left:-100%; width:60%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(103,232,249,.6),transparent);
          animation:tbShimmer 4s ease-in-out infinite;
        }
        .tb-link { color:#67e8f9; text-decoration:none; font-weight:600; cursor:pointer; }
        .tb-link:hover { color:#fff; }
        .country-sel {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          color: rgba(255,255,255,.8);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          outline: none;
        }
        .currency-badge {
          background: rgba(251,191,36,.2);
          border: 1px solid rgba(251,191,36,.3);
          color: #fbbf24;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }
        .live-dot {
          display:inline-block; width:6px; height:6px; border-radius:50%;
          background:#22c55e; animation:pulse-live 1.5s infinite; margin-right:4px;
        }
      \}</style>"""

new_style = """{/* styles in index.css */}"""

c2 = c.replace(old_style, new_style)
if c2 != c:
    open('src/components/Topbar.jsx', 'w', encoding='utf-8').write(c2)
    print('Removed inline style tag!')
else:
    print('Not found, showing style area:')
    idx = c.find('<style>')
    print(repr(c[idx:idx+200]))
