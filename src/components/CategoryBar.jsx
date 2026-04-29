import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATS } from '../data';

export default function CategoryBar({ onSelect }) {
  const [active, setActive] = useState('all');
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
      `}</style>

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
