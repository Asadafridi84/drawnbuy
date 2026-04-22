import { useRef } from 'react';
import { useCanvasStore } from '../store/canvas';
import { useAuthStore } from '../store/auth';

export function useProductDrop(canvasId, containerRef, syncCanvasIds = []) {
  const addCard   = useCanvasStore(s => s.addCard);
  const user      = useAuthStore(s => s.user);
  const guestId   = useRef('guest-' + Math.random().toString(36).slice(2, 7));
  const userId    = user?.id || guestId.current;

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/drawnbuy-product');
    if (!raw) return;
    let product;
    try { product = JSON.parse(raw); } catch { return; }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, e.clientX - rect.left - 80);
    const y = Math.max(0, e.clientY - rect.top  - 60);

    const id = Date.now().toString();

    // Add to primary canvas
    addCard(canvasId, { id, product, x, y, ownerId: userId });

    // Sync to additional canvases (e.g. hero -> main-collab)
    syncCanvasIds.forEach((syncId, i) => {
      addCard(syncId, {
        id: id + '-sync-' + i,
        product,
        x: 80 + Math.random() * 400,
        y: 60 + Math.random() * 300,
        ownerId: userId,
      });
    });
  };

  return { onDragOver, onDrop };
}
