import { useState, useEffect } from 'react';
import { ADS } from '../data';

export default function AdStrip() {
  const [dismissed, setDismissed] = useState([]);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const visible = ADS.filter((_, i) => !dismissed.includes(i));

  useEffect(() => {
    if (visible.length === 0) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setIdx(i => (i + 1) % visible.length);
          return 0;
        }
        return p + 2.5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [visible.length]);

  if (visible.length === 0) return null;

  const safeIdx = idx % visible.length;
  const ad = visible[safeIdx];

  const dismiss = () => {
    const originalIdx = ADS.indexOf(ad);
    setDismissed(d => [...d, originalIdx]);
    setProgress(0);
    setIdx(i => (i >= visible.length - 1 ? 0 : i));
  };

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

      {/* Dots — shifted left to make room for × */}
      <div style={{ position: 'absolute', right: '36px', display: 'flex', gap: '4px' }}>
        {visible.map((_, i) => (
          <div
            key={i}
            onClick={() => { setIdx(i); setProgress(0); }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%', cursor: 'pointer',
              background: i === safeIdx ? '#fff' : 'rgba(255,255,255,.35)',
              transition: '.2s',
            }}
          />
        ))}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss this ad"
        style={{
          position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%',
          width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', lineHeight: 1,
        }}
      >×</button>

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
