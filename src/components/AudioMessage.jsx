import { useState, useRef, useEffect } from 'react';

export default function AudioMessage({ url, duration, sender, time, isMe }) {
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    const onEnd  = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  // Generate pseudo-waveform bars from the url string as a seed
  const bars = Array.from({ length: 20 }, (_, i) => {
    const seed = (url.charCodeAt(i % url.length) || 50);
    return 8 + (seed % 20);
  });

  return (
    <div style={{
      background: isMe ? 'linear-gradient(90deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.1)',
      borderRadius: 12, padding: '8px 12px', maxWidth: 240,
      border: '1px solid rgba(251,191,36,.35)',
    }}>
      <audio ref={audioRef} src={url} preload="metadata"/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggle}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)', border: '1.5px solid #fbbf24',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {playing
            ? <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        {/* Waveform */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 28 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              height: h,
              background: (i / 20) * 100 <= progress ? '#fbbf24' : 'rgba(255,255,255,.3)',
              transition: 'background .1s',
              flexShrink: 0,
            }}/>
          ))}
        </div>
        <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.6)', flexShrink: 0 }}>
          {duration}s
        </span>
      </div>
      <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
        {sender}{time ? ' · ' + time : ''}
      </div>
    </div>
  );
}
