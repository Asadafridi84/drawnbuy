c = open('src/pages/LoginPage.jsx', encoding='utf-8').read()
old = '<Link to="/" className={styles.logo}>DrawNBuy</Link>'
new = '''<Link to="/" className={styles.logo} style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <defs>
              <linearGradient id="ls1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
              <linearGradient id="ls2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
              <linearGradient id="ls3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4f0ff"/><stop offset="100%" stopColor="#ede9fe"/></linearGradient>
            </defs>
            <rect x="1.5" y="2" width="21" height="15" rx="3" fill="url(#ls1)"/>
            <rect x="3" y="3.5" width="18" height="12" rx="1.8" fill="url(#ls3)"/>
            <text x="5.2" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#7c3aed">D</text>
            <text x="10.8" y="11.8" fontFamily="Georgia,serif" fontSize="5" fontWeight="400" fill="#5b21b6">n</text>
            <text x="14.8" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#67e8f9">B</text>
            <rect x="6.5" y="19.5" width="11" height="3" rx="1.5" fill="url(#ls2)"/>
            <circle cx="9.5" cy="22.8" r="0.85" fill="#3b0764"/><circle cx="14.5" cy="22.8" r="0.85" fill="#3b0764"/>
          </svg>
          <span style={{fontWeight:'800',fontSize:'20px',color:'#1a0a3e'}}>DrawNBuy</span>
        </Link>'''
c2 = c.replace(old, new)
if c2 != c:
    open('src/pages/LoginPage.jsx', 'w', encoding='utf-8').write(c2)
    print('LoginPage logo fixed!')
else:
    print('NOT FOUND:', repr(c[c.find('DrawNBuy')-30:c.find('DrawNBuy')+20]))
