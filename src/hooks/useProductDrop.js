import { useRef } from 'react';
import { useCanvasStore } from '../store/canvas';
import { useAuthStore } from '../store/auth';

const CARD_W = 160;
const CARD_H = 200;

export function useProductDrop(canvasId, containerRef, syncCanvasIds = [], sendProductDrop = null, sendMoveProduct = null) {
  const addCard      = useCanvasStore(s => s.addCard);
  const moveCard     = useCanvasStore(s => s.moveCard);
  const user         = useAuthStore(s => s.user);
  const guestId      = useRef('guest-' + Math.random().toString(36).slice(2, 7));
  const userId       = user?.id || guestId.current;
  const lastDropRef  = useRef(0);

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (e) => {
    e.preventDefault();

    // If the drop is a card already on the canvas (HTML5 drag-to-move), reposition it
    const moveId       = e.dataTransfer.getData('move-card-id');
    const moveCanvasId = e.dataTransfer.getData('move-canvas-id');
    if (moveId && moveCanvasId === canvasId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = Math.max(0, Math.min(e.clientX - rect.left - 80, rect.width  - CARD_W));
      const my = Math.max(0, Math.min(e.clientY - rect.top  - 60, rect.height - CARD_H));
      moveCard(canvasId, moveId, mx, my);
      sendMoveProduct?.({ cardId: moveId, canvasId, x: mx, y: my });
      return;
    }

    const now = Date.now();
    if (now - lastDropRef.current < 300) return; // dupe guard
    lastDropRef.current = now;

    const raw = e.dataTransfer.getData('application/drawnbuy-product');
    if (!raw) return;
    let product;
    try { product = JSON.parse(raw); } catch { return; }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(e.clientX - rect.left - 80, rect.width  - CARD_W));
    const y = Math.max(0, Math.min(e.clientY - rect.top  - 60, rect.height - CARD_H));
    const id = Date.now().toString();

    // 1. Add to primary canvas locally
    addCard(canvasId, { id, product, x, y, ownerId: userId });

    // 2. Sync to additional canvases (e.g. hero -> main-collab)
    syncCanvasIds.forEach((syncId, i) => {
      addCard(syncId, {
        id: id + '-sync-' + i,
        product,
        x: 80 + Math.random() * 400,
        y: 60 + Math.random() * 300,
        ownerId: userId,
      });
    });

    // 3. Emit to socket so remote clients see the drop
    if (sendProductDrop) {
      sendProductDrop(
        { ...product, id, canvasId, droppedBy: userId },
        x,
        y,
      );
    }
  };

  return { onDragOver, onDrop };
}
