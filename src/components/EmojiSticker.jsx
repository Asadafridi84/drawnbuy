import { useState, useRef } from 'react';
import { useCanvasStore } from '../store/canvas';
import { useAuthStore } from '../store/auth';
import { useSocket } from '../hooks/useSocket';

export default function EmojiSticker({ sticker, canvasId }) {
  const moveSticker      = useCanvasStore(s => s.moveSticker);
  const removeStickerById = useCanvasStore(s => s.removeStickerById);
  const user             = useAuthStore(s => s.user);
  const userId           = user?.id || '';
  const isOwner          = sticker.ownerId === userId || sticker.ownerId?.startsWith('guest');
  const { sendRemoveSticker } = useSocket();

  const [pos, setPos]       = useState({ x: sticker.x, y: sticker.y });
  const [showDel, setShowDel] = useState(false);
  const dragStart = useRef(null);

  const onMouseDown = (e) => {
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
    const onMove = (ev) => {
      const nx = dragStart.current.x + (ev.clientX - dragStart.current.mx);
      const ny = dragStart.current.y + (ev.clientY - dragStart.current.my);
      setPos({ x: nx, y: ny });
      moveSticker(canvasId, sticker.id, nx, ny);
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
      className="emoji-sticker"
      onMouseDown={onMouseDown}
      onDoubleClick={() => isOwner && setShowDel(v => !v)}
      style={{ position: 'absolute', left: pos.x, top: pos.y, cursor: 'grab', zIndex: 11, userSelect: 'none', fontSize: 32, lineHeight: 1, pointerEvents: 'auto' }}
      title={isOwner ? 'Double-click to delete' : 'Move me!'}
    >
      {sticker.emoji}
      {showDel && isOwner && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeStickerById(canvasId, sticker.id);
            sendRemoveSticker({ stickerId: sticker.id, canvasId });
          }}
          style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', fontWeight: 800, lineHeight: '18px', padding: 0 }}
        >✕</button>
      )}
    </div>
  );
}
