import { useCanvasStore } from '../store/canvas';

export default function RecordingIndicator({ canvasId }) {
  const rec = useCanvasStore(s => s.recording[canvasId]);
  if (!rec) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: '.72rem', color: 'rgba(255,255,255,.7)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        {[8, 14, 10].map((h, i) => (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2, background: '#ef4444',
            animation: `bounce ${0.4 + i * 0.1}s ease infinite alternate`,
          }}/>
        ))}
      </div>
      <span><strong style={{ color: '#fbbf24' }}>{rec.userName}</strong> is recording a voice message...</span>
      <style>{`@keyframes bounce { from{transform:scaleY(.4)} to{transform:scaleY(1)} }`}</style>
    </div>
  );
}
