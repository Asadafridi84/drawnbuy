import { useState, useRef } from 'react';
import { useCanvasStore } from '../store/canvas';
import { useAuthStore } from '../store/auth';
import { useSocket } from '../hooks/useSocket';
import { useWishlist } from '../context/WishlistContext';

const safeOpen = (url) => {
  if (!url) return;
  const trusted = ['amazon.co.uk','amazon.com','ikea.com','zalando.com','nike.com','boots.com'];
  try {
    const host = new URL(url).hostname.replace('www.','');
    if (trusted.some(d => host.endsWith(d))) window.open(url, '_blank', 'noopener,noreferrer');
    else window.open('https://www.amazon.co.uk/s?k='+encodeURIComponent(url), '_blank', 'noopener,noreferrer');
  } catch {}
};

// Size map: different canvases get different card sizes
const CANVAS_SIZES = {
  'main-collab': { cardW: 160, imgH: 110, fontSize: '.75rem', priceSize: '.82rem', btnSize: '.65rem', pad: '8px 10px 8px' },
  'hero-canvas': { cardW: 100, imgH: 65,  fontSize: '.6rem',  priceSize: '.68rem', btnSize: '.55rem', pad: '5px 7px 6px'  },
  'mini-preview':{ cardW: 90,  imgH: 58,  fontSize: '.58rem', priceSize: '.65rem', btnSize: '.52rem', pad: '4px 6px 5px'  },
  'room-1':      { cardW: 110, imgH: 72,  fontSize: '.62rem', priceSize: '.7rem',  btnSize: '.56rem', pad: '6px 8px 6px'  },
  'room-2':      { cardW: 110, imgH: 72,  fontSize: '.62rem', priceSize: '.7rem',  btnSize: '.56rem', pad: '6px 8px 6px'  },
  'room-3':      { cardW: 110, imgH: 72,  fontSize: '.62rem', priceSize: '.7rem',  btnSize: '.56rem', pad: '6px 8px 6px'  },
};
const DEFAULT_SIZE = { cardW: 140, imgH: 90, fontSize: '.68rem', priceSize: '.75rem', btnSize: '.6rem', pad: '6px 8px 6px' };

export default function ProductCard({ card, canvasId }) {
  const sz = CANVAS_SIZES[canvasId] || DEFAULT_SIZE;
  const { cardW, imgH, fontSize, priceSize, btnSize, pad } = sz;
  const moveCard       = useCanvasStore(s => s.moveCard);
  const removeCardById = useCanvasStore(s => s.removeCardById);
  const { sendMoveProduct, sendRemoveProduct } = useSocket();
  const { addItem: wishAdd, hasItem: wishHas } = useWishlist();
  const isWishlisted = wishHas(card.product.name);

  const dragStart = useRef(null);
  const [pos, setPos] = useState({ x: card.x, y: card.y });

  const onMouseDown = (e) => {
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y, finalX: pos.x, finalY: pos.y };
    const onMove = (ev) => {
      const nx = dragStart.current.x + (ev.clientX - dragStart.current.mx);
      const ny = dragStart.current.y + (ev.clientY - dragStart.current.my);
      dragStart.current.finalX = nx;
      dragStart.current.finalY = ny;
      setPos({ x: nx, y: ny });
      moveCard(canvasId, card.id, nx, ny);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragStart.current) {
        sendMoveProduct({ cardId: card.id, canvasId, x: dragStart.current.finalX, y: dragStart.current.finalY });
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="cv-card"
      draggable={true}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('move-card-id', card.id);
        e.dataTransfer.setData('move-canvas-id', canvasId);
        e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify(card.product));
      }}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: cardW,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(124,58,237,.25)',
        border: '2px solid #fbbf24',
        cursor: 'grab',
        zIndex: 10,
        pointerEvents: 'auto',
        userSelect: 'none',
        overflow: 'hidden',
        transition: 'box-shadow .15s',
      }}
    >
      <img
        src={card.product.img}
        alt={card.product.name}
        style={{ width: '100%', height: imgH, objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        onError={e => { e.target.style.background = '#f4f0ff'; e.target.style.display = 'none'; }}
      />
      <div style={{ padding: pad }}>
        <div style={{ fontSize: fontSize, fontWeight: 800, color: '#1a0a3e', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.product.name}
        </div>
        <div style={{ fontSize: priceSize, fontWeight: 800, color: '#fbbf24', marginBottom: 6 }}>
          {card.product.price}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => safeOpen(card.product.url)}
            style={{ flex: 1, background: 'linear-gradient(90deg,#7c3aed,#5b21b6)', color: '#fff', border: '1.5px solid #fbbf24', borderRadius: 6, padding: '5px 0', fontSize: btnSize, fontWeight: 700, cursor: 'pointer' }}
          >
            Add to Cart
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); wishAdd({ id: card.product.name, ...card.product }); }}
            title={isWishlisted ? 'In wishlist' : 'Save to wishlist'}
            style={{ background: isWishlisted ? '#fee2e2' : '#f4f0ff', color: isWishlisted ? '#ef4444' : '#7c3aed', border: `1px solid ${isWishlisted ? '#fca5a5' : '#ede9fe'}`, borderRadius: 6, padding: '5px 6px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
          <button
            className="card-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeCardById(canvasId, card.id);
              sendRemoveProduct({ cardId: card.id, canvasId });
            }}
            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, padding: '5px 8px', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
