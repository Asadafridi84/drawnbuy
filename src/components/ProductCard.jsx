import { useState, useRef } from 'react';
import { useCanvasStore } from '../store/canvas';
import { useAuthStore } from '../store/auth';

const safeOpen = (url) => {
  if (!url) return;
  const trusted = ['amazon.co.uk','amazon.com','ikea.com','zalando.com','nike.com','boots.com'];
  try {
    const host = new URL(url).hostname.replace('www.','');
    if (trusted.some(d => host.endsWith(d))) window.open(url, '_blank', 'noopener,noreferrer');
    else window.open('https://www.amazon.co.uk/s?k='+encodeURIComponent(url), '_blank', 'noopener,noreferrer');
  } catch {}
};

export default function ProductCard({ card, canvasId }) {
  const moveCard   = useCanvasStore(s => s.moveCard);
  const removeCard = useCanvasStore(s => s.removeCard);
  const user       = useAuthStore(s => s.user);
  const userId     = user?.id || '';
  const isOwner    = card.ownerId === userId || card.ownerId?.startsWith('guest');

  const dragStart = useRef(null);
  const [pos, setPos] = useState({ x: card.x, y: card.y });

  const onMouseDown = (e) => {
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
    const onMove = (ev) => {
      const nx = dragStart.current.x + (ev.clientX - dragStart.current.mx);
      const ny = dragStart.current.y + (ev.clientY - dragStart.current.my);
      setPos({ x: nx, y: ny });
      moveCard(canvasId, card.id, nx, ny);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 160,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(124,58,237,.25)',
        border: '2px solid #fbbf24',
        cursor: 'grab',
        zIndex: 10,
        userSelect: 'none',
        overflow: 'hidden',
        transition: 'box-shadow .15s',
      }}
    >
      <img
        src={card.product.img}
        alt={card.product.name}
        style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        onError={e => { e.target.style.background = '#f4f0ff'; e.target.style.display = 'none'; }}
      />
      <div style={{ padding: '8px 10px 8px' }}>
        <div style={{ fontSize: '.75rem', fontWeight: 800, color: '#1a0a3e', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.product.name}
        </div>
        <div style={{ fontSize: '.82rem', fontWeight: 800, color: '#fbbf24', marginBottom: 6 }}>
          {card.product.price}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => safeOpen(card.product.url)}
            style={{ flex: 1, background: 'linear-gradient(90deg,#7c3aed,#5b21b6)', color: '#fff', border: '1.5px solid #fbbf24', borderRadius: 6, padding: '5px 0', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Add to Cart
          </button>
          {isOwner && (
            <button
              onClick={() => removeCard(canvasId, card.id, userId)}
              style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, padding: '5px 8px', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
