const SOCIALS = [
  { name: 'Instagram', url: 'https://instagram.com', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
  { name: 'TikTok',    url: 'https://tiktok.com',    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg> },
  { name: 'YouTube',   url: 'https://youtube.com',   svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg> },
  { name: 'Pinterest', url: 'https://pinterest.com', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg> },
  { name: 'Twitter/X', url: 'https://x.com',         svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
];

const FOOTER_LINKS = {
  'Company': ['About DrawNBuy', 'How It Works', 'Affiliate Program', 'Press Kit', 'Careers'],
  'Support': ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Cookie Settings'],
  'Discover': ["Women's Fashion", "Men's Fashion", 'Tech & Gadgets', 'Home & Living', 'Deals & Offers'],
};

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(180deg,#3b0764 0%,#0d0520 100%)',
      padding: '3rem 2rem 1.5rem',
      color: 'rgba(255,255,255,.55)',
      fontSize: '13px',
      marginTop: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .footer-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.6fr 1fr 1fr 1.4fr; gap:2.5rem; padding-bottom:2rem; border-bottom:1px solid rgba(255,255,255,.07); }
        .footer-brand p { font-size:.78rem; color:rgba(255,255,255,.45); line-height:1.6; margin-bottom:1rem; }
        .footer-col h4 { font-size:11px; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:.1em; margin-bottom:1rem; }
        .footer-col a { display:block; color:rgba(255,255,255,.45); text-decoration:none; font-size:.78rem; margin-bottom:.55rem; transition:.15s; cursor:pointer; }
        .footer-col a:hover { color:#fff; transform:translateX(3px); }
        .footer-social { display:flex; gap:8px; margin-top:.25rem; }
        .soc-btn { width:34px; height:34px; border-radius:8px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; color:rgba(255,255,255,.6); text-decoration:none; }
        .soc-btn:hover { background:rgba(255,255,255,.18); color:#fff; transform:translateY(-2px); }
        .footer-newsletter input { width:100%; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:9px 9px 0 0; padding:10px 13px; color:#fff; font-family:'Space Grotesk',sans-serif; font-size:13px; outline:none; box-sizing:border-box; transition:.2s; }
        .footer-newsletter input:focus { border-color:#7c3aed; background:rgba(124,58,237,.1); }
        .footer-newsletter input::placeholder { color:rgba(255,255,255,.3); }
        .footer-newsletter button { width:100%; background:linear-gradient(135deg,#7c3aed,#5b21b6); border:none; border-radius:0 0 9px 9px; padding:10px; color:#fff; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:800; cursor:pointer; transition:.2s; }
        .footer-newsletter button:hover { opacity:.9; transform:translateY(-1px); }
        .footer-bottom { max-width:1200px; margin:1.25rem auto 0; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.5rem; font-size:11px; color:rgba(255,255,255,.25); }
        .footer-trust { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:1rem; }
        .trust-badge { display:flex; align-items:center; gap:5px; font-size:.68rem; color:rgba(255,255,255,.35); font-weight:600; }
        @media(max-width:900px) { .footer-inner { grid-template-columns:1fr 1fr; } }
        @media(max-width:600px) { .footer-inner { grid-template-columns:1fr; } }
      `}</style>

      {/* Top shimmer line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(124,58,237,.6),rgba(251,191,36,.4),transparent)' }} />

      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.75rem' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
              <span style={{ color: '#f3e8ff' }}>Draw</span><span>N</span><span style={{ color: '#67e8f9' }}>Buy</span>
            </div>
          </div>
          <p>The world's first social shopping canvas. Draw it, find it, buy it — together.</p>
          <div className="footer-social">
            {SOCIALS.map(s => (
              <a key={s.name} className="soc-btn" href={s.url} target="_blank" rel="noopener noreferrer" title={s.name}>
                {s.svg}
              </a>
            ))}
          </div>
          <div className="footer-trust">
            {['🔒 Secure', '✅ Verified Partners', '🌍 17 Countries'].map(b => (
              <span key={b} className="trust-badge">{b}</span>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title} className="footer-col">
            <h4>{title}</h4>
            {links.map(l => <a key={l}>{l}</a>)}
          </div>
        ))}

        {/* Newsletter */}
        <div className="footer-col">
          <h4>🎁 Get exclusive deals</h4>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', marginBottom: '.85rem', lineHeight: '1.6' }}>
            Be first to know about new features and the best deals from our partners.
          </p>
          <div className="footer-newsletter">
            <input type="email" placeholder="your@email.com" />
            <button>Subscribe Free →</button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <span>© 2026 DrawNBuy AB — Stockholm, Sweden 🇸🇪</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a style={{ color: '#67e8f9', textDecoration: 'none', cursor: 'pointer' }}>Privacy</a>
          <a style={{ color: '#67e8f9', textDecoration: 'none', cursor: 'pointer' }}>Terms</a>
          <a style={{ color: '#67e8f9', textDecoration: 'none', cursor: 'pointer' }}>Cookies</a>
        </div>
      </div>
    </footer>
  );
}
