const STEPS = [
  { img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop', title: 'Draw Your Idea', desc: 'Sketch what you want on the collaborative canvas. Use freehand drawing or simple shapes.' },
  { img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=200&h=200&fit=crop', title: 'AI Finds Products', desc: 'Our AI recognises your drawing and instantly surfaces matching real products from top stores.' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', title: 'Drag to Canvas', desc: 'Drag products from the search panel onto your canvas. Arrange, compare, and share your wishlist.' },
  { img: 'https://images.unsplash.com/photo-1522125670776-3c7abb882bc2?w=200&h=200&fit=crop', title: 'Shop Together', desc: 'Invite friends & family to your canvas. Chat, react, and buy — all in one place.' },
];

export default function HowItWorks() {
  return (
    <div id="hiwSection" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <style>{`
        @keyframes hiwHover { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .hiw { background:linear-gradient(135deg,#1a0a3e,#2d1266); border-radius:20px; padding:2.5rem 2rem; position:relative; overflow:hidden; }
        .hiw::before { content:''; position:absolute; top:-40px; right:-40px; width:200px; height:200px; background:radial-gradient(circle,rgba(124,58,237,.3),transparent); pointer-events:none; }
        .hiw::after { content:''; position:absolute; bottom:-40px; left:-40px; width:150px; height:150px; background:radial-gradient(circle,rgba(251,191,36,.15),transparent); pointer-events:none; }
        .hiw-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin-top:2rem; position:relative; }
        .hiw-connector { position:absolute; top:44px; left:calc(12.5% + 20px); right:calc(12.5% + 20px); height:2px; background:linear-gradient(90deg,rgba(124,58,237,.6),rgba(251,191,36,.6)); z-index:0; }
        .hiw-connector::before, .hiw-connector::after { content:''; position:absolute; top:-4px; width:10px; height:10px; border-radius:50%; background:#fbbf24; }
        .hiw-connector::before { left:0; } .hiw-connector::after { right:0; }
        .hiw-step { text-align:center; padding:1.25rem .75rem; position:relative; z-index:1; transition:all .25s cubic-bezier(.34,1.56,.64,1); }
        .hiw-step:hover { transform:translateY(-6px); }
        .hiw-num { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#5b21b6); color:#fff; font-weight:900; font-size:16px; display:flex; align-items:center; justify-content:center; margin:0 auto .75rem; box-shadow:0 4px 20px rgba(124,58,237,.5); transition:all .25s; }
        .hiw-step:hover .hiw-num { transform:scale(1.15); box-shadow:0 8px 28px rgba(124,58,237,.7); }
        .hiw-icon-wrap { width:64px; height:64px; border-radius:16px; overflow:hidden; border:2px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; margin:0 auto .75rem; transition:all .25s; }
        .hiw-step:hover .hiw-icon-wrap { border-color:rgba(251,191,36,.6); transform:rotate(-5deg) scale(1.08); }
        .hiw-title { font-size:.92rem; font-weight:900; color:#fff; margin-bottom:.5rem; }
        .hiw-desc { font-size:.76rem; color:#e8d5ff; line-height:1.6; font-weight:500; }
        .hiw-cta-btn { background:linear-gradient(135deg,#fbbf24,#f59e0b); color:#1a0a3e; border:none; border-radius:12px; padding:12px 32px; font-size:.95rem; font-weight:900; cursor:pointer; font-family:inherit; transition:all .2s cubic-bezier(.34,1.56,.64,1); box-shadow:0 4px 20px rgba(251,191,36,.4); }
        .hiw-cta-btn:hover { transform:translateY(-3px) scale(1.05); box-shadow:0 8px 28px rgba(251,191,36,.6); }
        @media(max-width:700px) { .hiw-grid { grid-template-columns:1fr 1fr; } .hiw-connector { display:none; } }
      `}</style>

      <div className="hiw">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.4)', marginBottom: '6px' }}>Simple to use</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>How DrawNBuy Works</h2>
          <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.55)', marginTop: '6px' }}>From sketch to shopping cart in seconds</p>
        </div>

        <div className="hiw-grid">
          <div className="hiw-connector" />
          {STEPS.map((s, i) => (
            <div key={i} className="hiw-step">
              <div className="hiw-num">{i + 1}</div>
              <div className="hiw-icon-wrap">
                <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
              </div>
              <div className="hiw-title">{s.title}</div>
              <div className="hiw-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="hiw-cta-btn">🎨 Start Drawing Free — It's Free!</button>
        </div>
      </div>
    </div>
  );
}
