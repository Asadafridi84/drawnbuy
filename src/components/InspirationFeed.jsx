import { useNavigate } from 'react-router-dom';
import { INSPO } from '../data';

const ROOM_BADGE = { public:'🌍 Public', friends:'👥 Friends', private:'🔒 Private' };
const ROOM_COLOR = { public:'#dcfce7', friends:'#dbeafe', private:'#fef3c7' };
const ROOM_TEXT  = { public:'#15803d', friends:'#1d4ed8', private:'#92400e' };

export default function InspirationFeed() {
  const navigate = useNavigate();

  const toSlug = (title) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <section id="inspiration" style={{ background:'#fff', borderTop:'1px solid #e5e7eb', borderBottom:'1px solid #e5e7eb', padding:'1.5rem 2rem' }}>
      <style>{`
        .inspo-card {
          width:280px; flex-shrink:0; background:#fff; border-radius:16px;
          box-shadow:0 2px 12px rgba(124,58,237,.1); border:1.5px solid #e5e7eb;
          overflow:hidden; transition:.22s; cursor:pointer;
        }
        .inspo-card:hover { transform:translateY(-3px); box-shadow:0 8px 32px rgba(124,58,237,.16); border-color:#ede9fe; }
        .inspo-preview { height:120px; display:flex; align-items:center; justify-content:center; font-size:3.5rem; position:relative; }
        .inspo-row { display:flex; gap:.85rem; overflow-x:auto; padding-bottom:.5rem; scrollbar-width:none; }
        .inspo-row::-webkit-scrollbar { display:none; }
        .inspo-open-btn {
          width:100%; background:linear-gradient(90deg,#7c3aed,#5b21b6); color:#fff;
          border:none; border-radius:8px; padding:8px; font-family:'Space Grotesk',sans-serif;
          font-size:.8rem; font-weight:800; cursor:pointer; transition:.15s; margin-top:.6rem;
          border:1.5px solid #fbbf24;
        }
        .inspo-open-btn:hover { opacity:.88; transform:translateY(-1px); }
        .inspo-chip { background:#f4f0ff; color:#7c3aed; border-radius:20px; padding:2px 8px; font-size:.65rem; font-weight:700; white-space:nowrap; }
        @keyframes inspoFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .inspo-card { animation:inspoFade .35s ease-out both; }
      `}</style>

      <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'.5rem' }}>
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:'800', color:'#1a0a3e', margin:0, display:'flex', alignItems:'center', gap:'.5rem' }}>
              Canvas Inspiration ✨
            </h2>
            <p style={{ fontSize:'.78rem', color:'#6b7280', margin:'3px 0 0' }}>See what others are drawing and buying together</p>
          </div>
          <a href="/#inspiration" style={{ fontSize:'.8rem', fontWeight:'700', color:'#7c3aed', textDecoration:'none', cursor:'pointer' }}>Browse all →</a>
        </div>

        <div className="inspo-row">
          {INSPO.map((card, i) => (
            <div key={i} className="inspo-card" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="inspo-preview" style={{ background: card.bg }}>
                {card.preview}
                <span style={{ position:'absolute', top:8, right:8, background: ROOM_COLOR[card.room], color: ROOM_TEXT[card.room], fontSize:'.6rem', fontWeight:800, padding:'2px 7px', borderRadius:20 }}>
                  {ROOM_BADGE[card.room]}
                </span>
              </div>
              <div style={{ padding:'.75rem' }}>
                <div style={{ fontWeight:800, fontSize:'.9rem', color:'#1a0a3e', marginBottom:'.2rem' }}>{card.title}</div>
                <div style={{ fontSize:'.7rem', color:'#9ca3af', marginBottom:'.55rem' }}>{card.user}</div>
                <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap', marginBottom:'.55rem' }}>
                  {card.products.map(p => <span key={p} className="inspo-chip">{p}</span>)}
                </div>
                <div style={{ display:'flex', gap:'.75rem', fontSize:'.7rem', color:'#9ca3af', marginBottom:'.1rem' }}>
                  <span>👁 {card.likes} likes</span>
                  <span>🎨 {card.draws} draws</span>
                </div>
                <button
                  className="inspo-open-btn"
                  onClick={() => navigate(`/?room=${toSlug(card.title)}`)}
                >
                  👁 Open Canvas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
