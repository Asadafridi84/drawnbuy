import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useProductDrop } from '../hooks/useProductDrop';
import { useAuthStore } from '../store/auth';

export default function MiniFloatingCanvas() {
  const [minimized, setMinimized] = useState(false);
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || 'main';
  const user = useAuthStore(s => s.user);
  const { sendProductDrop, connect } = useSocket();
  const { onDragOver, onDrop } = useProductDrop('main-collab', containerRef, [], sendProductDrop);

  // Ensure socket is joined to the current room on every page
  useEffect(() => {
    connect(roomId, user?.name || 'Guest');
  }, [roomId]);

  const openFullCanvas = () => {
    const el = document.getElementById('collabSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = `/?room=${roomId}`;
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 300, filter: 'drop-shadow(0 8px 32px rgba(124,58,237,.35))' }}>
      <div style={{ width: 220, background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: 14, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '.78rem', flex: 1 }}>🛍️ Drop Zone</span>
          <button
            onClick={() => setMinimized(v => !v)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '.85rem' }}
          >
            {minimized ? '▲' : '▼'}
          </button>
        </div>

        {!minimized && (
          <>
            {/* Drop zone */}
            <div
              ref={containerRef}
              onDragOver={onDragOver}
              onDrop={onDrop}
              style={{
                padding: '24px 12px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                minHeight: 90, cursor: 'copy',
                borderBottom: '1px solid rgba(255,255,255,.08)',
                border: '2px dashed rgba(251,191,36,.3)',
                margin: 8, borderRadius: 10,
              }}
            >
              <div style={{ fontSize: '1.6rem' }}>🛒</div>
              <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
                Drop a product here to add it to the shared canvas
              </div>
            </div>

            {/* Open full canvas button */}
            <div style={{ padding: '8px 10px' }}>
              <button
                onClick={openFullCanvas}
                style={{
                  width: '100%', padding: '7px', borderRadius: 8,
                  border: '1.5px solid #fbbf24', background: 'rgba(251,191,36,.15)',
                  color: '#fbbf24', fontSize: '.72rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >↗ Open Full Canvas</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
