c = open('src/pages/SignupPage.jsx', encoding='utf-8').read()
old = c[c.find('to="/"'):c.find('</Link>', c.find('to="/"'))+7]
print('Found:', old[:80])
new = '''<Link to="/" className={styles.logo} style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <defs>
              <linearGradient id="ss1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
              <linearGradient id="ss2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
              <linearGradient id="ss3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4f0ff"/><stop offset="100%" stopColor="#ede9fe"/></linearGradient>
            </defs>
            <rect x="1.5" y="2" width="21" height="15" rx="3" fill="url(#ss1)"/>
            <rect x="3" y="3.5" width="18" height="12" rx="1.8" fill="url(#ss3)"/>
            <text x="5.2" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#7c3aed">D</text>
            <text x="10.8" y="11.8" fontFamily="Georgia,serif" fontSize="5" fontWeight="400" fill="#5b21b6">n</text>
            <text x="14.8" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#67e8f9">B</text>
            <rect x="6.5" y="19.5" width="11" height="3" rx="1.5" fill="url(#ss2)"/>
            <circle cx="9.5" cy="22.8" r="0.85" fill="#3b0764"/><circle cx="14.5" cy="22.8" r="0.85" fill="#3b0764"/>
          </svg>
          <span style={{fontWeight:'800',fontSize:'20px',color:'#1a0a3e'}}>DrawNBuy</span>
        </Link>'''
c2 = c.replace(old, new)
if c2 != c:
    open('src/pages/SignupPage.jsx', 'w', encoding='utf-8').write(c2)
    print('SignupPage logo fixed!')
else:
    print('NOT FOUND')
