import { useState } from 'react';
import { SPONSORS } from '../data';

export default function Sponsors() {
  const [dismissed, setDismissed] = useState([]);

  const visible = SPONSORS.filter((_, i) => !dismissed.includes(i));
  if (visible.length === 0) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem' }}>
      <style>{`
        .spc { border-radius:14px; padding:1.3rem 1.5rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:transform .2s; position:relative; }
        .spc:hover { transform:translateY(-3px); }
        .sp-btn { background:#fff; border:none; border-radius:8px; padding:8px 16px; font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:800; cursor:pointer; transition:.15s; }
        .sp-btn:hover { transform:scale(1.05); }
        .sp-icon { font-size:48px; filter:drop-shadow(0 4px 12px rgba(0,0,0,.3)); transition:.3s; }
        .spc:hover .sp-icon { transform:scale(1.1) rotate(-5deg); }
        .spc-stat { font-size:11px; color:rgba(255,255,255,.55); margin-bottom:10px; }
      `}</style>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', marginBottom: '3px' }}>Our partners</div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1a0a3e', margin: 0 }}>🤝 Featured Sponsors</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '2rem' }}>
        {visible.map((s, visIdx) => {
          const originalIdx = SPONSORS.indexOf(s);
          return (
            <div
              key={originalIdx}
              className="spc"
              style={{ background: s.bg }}
              onClick={() => window.open(s.url, '_blank')}
            >
              <button
                onClick={e => { e.stopPropagation(); setDismissed(d => [...d, originalIdx]); }}
                aria-label="Dismiss sponsor"
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%',
                  width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit', lineHeight: 1, zIndex: 2,
                }}
              >×</button>
              <div>
                <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,.45)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Sponsored</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '3px' }}>{s.name}</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)', marginBottom: '8px' }}>{s.desc}</p>
                {s.stat && <div className="spc-stat">✓ {s.stat}</div>}
                <button
                  className="sp-btn"
                  onClick={e => { e.stopPropagation(); window.open(s.url, '_blank'); }}
                >{s.btn}</button>
              </div>
              <div className="sp-icon">{s.icon}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
