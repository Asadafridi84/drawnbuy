import { useState, useEffect } from 'react';
import { ADS } from '../data';

export default function AdStrip() {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setIdx(i => (i + 1) % ADS.length);
          return 0;
        }
        return p + 2.5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const ad = ADS[idx];

  return (
    <div style={{
      height: '46px',
      position: 'relative',
      overflow: 'hidden',
      background: ad.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      fontSize: '13px',
      fontWeight: '700',
      color: ad.color,
      transition: 'background .5s',
    }}>
      <span>{ad.emoji} {ad.text}</span>
      <button
        onClick={() => window.open(ad.url, '_blank')}
        style={{
          background: ad.btnBg,
          color: ad.btnColor,
          border: 'none',
          padding: '5px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '800',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {ad.btn}
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', right: '12px', display: 'flex', gap: '4px' }}>
        {ADS.map((_, i) => (
          <div
            key={i}
            onClick={() => { setIdx(i); setProgress(0); }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%', cursor: 'pointer',
              background: i === idx ? '#fff' : 'rgba(255,255,255,.35)',
              transition: '.2s',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '3px', background: 'rgba(255,255,255,.5)',
        width: `${progress}%`, transition: 'width .5s linear',
        borderRadius: '0 3px 3px 0',
      }} />
    </div>
  );
}
