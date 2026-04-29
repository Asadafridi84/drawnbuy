import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATS, MOODS } from '../data';

export default function CategoryBar({ onSelect }) {
  const [active, setActive] = useState('all');
  const [activeMood, setActiveMood] = useState(null);
  const navigate = useNavigate();

  const chips = [
    { slug: 'all', name: '🔥 All', emoji: '' },
    ...CATS,
  ];

  const handleSelect = (slug) => {
    setActive(slug);
    onSelect?.(slug);
    if (slug !== 'all') navigate('/category/' + slug);
  };

  return (
    <div style={{
      background: '#fff',
      borderBottom: '2px solid #e5e7eb',
      position: 'sticky',
      top: '96px',
      zIndex: 200,
      overflowY: 'visible',
    }}>
      <style>{`
        .cat-bar::-webkit-scrollbar { display:none; }
        .mood-row::-webkit-scrollbar { display:none; }
        .cni {
          display:inline-flex; align-items:center; gap:4px;
          padding:9px 11px; cursor:pointer; border-bottom:3px solid transparent;
          transition:.15s; font-size:11px; font-weight:700; white-space:nowrap;
          color:#dc2626; background:none; border-top:none; border-left:none; border-right:none;
          font-family:'Space Grotesk',sans-serif;
        }
        .cni:hover { color:#b91c1c; border-bottom-color:rgba(220,38,38,.3); }
        .cni.on {
          color:#fff; background:#dc2626; border-bottom-color:#dc2626;
          border-radius:999px; margin:4px 2px; padding:5px 11px;
        }
        .mood-card {
          width:82px; height:82px; border-radius:16px; flex-shrink:0;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          cursor:pointer; border:2px solid transparent; transition:.18s; user-select:none;
        }
        .mood-card:hover { transform:translateY(-2px); border-color:rgba(124,58,237,.3); }
        .mood-card.on { border-color:#7c3aed; box-shadow:0 2px 12px rgba(124,58,237,.2); }
      `}</style>

      {/* Shop by Room & Mood row */}
      <div style={{ borderBottom:'1px solid #f3f4f6', padding:'.55rem 1rem .4rem' }}>
        <div style={{ fontSize:'.7rem', fontWeight:'800', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.4rem' }}>
          Shop by Room &amp; Mood 🏠
        </div>
        <div className="mood-row" style={{ display:'flex', gap:'.65rem', overflowX:'auto', scrollbarWidth:'none', paddingBottom:'.1rem' }}>
          {MOODS.map(m => (
            <div
              key={m.slug}
              className={`mood-card${activeMood === m.slug ? ' on' : ''}`}
              style={{ background: m.color }}
              onClick={() => {
                const next = activeMood === m.slug ? null : m.slug;
                setActiveMood(next);
                if (next) { setActive(next); onSelect?.(next); navigate('/category/' + next); }
                else { setActive('all'); onSelect?.('all'); }
              }}
            >
              <span style={{ fontSize:'1.75rem', lineHeight:1 }}>{m.emoji}</span>
              <span style={{ fontSize:'.6rem', fontWeight:'700', color:'#374151', marginTop:'.22rem', textAlign:'center', lineHeight:1.2 }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div
        className="cat-bar"
        style={{ display: 'flex', padding: '0 1rem', gap: '0', whiteSpace: 'nowrap', overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}
      >
        {chips.map(c => (
          <button
            key={c.slug}
            className={`cni ${active === c.slug ? 'on' : ''}`}
            onClick={() => handleSelect(c.slug)}
          >
            {c.slug === 'all' ? c.name : `${c.emoji} ${c.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}
