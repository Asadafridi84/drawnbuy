import { useCanvasStore } from '../store/canvas';
import { useAuthStore } from '../store/auth';

export function useProductDrop(canvasId, containerRef) {
  const addCard = useCanvasStore(s => s.addCard);
  const user    = useAuthStore(s => s.user);
  const userId  = user?.id || 'guest-' + Math.random().toString(36).slice(2, 7);

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

    addCard(canvasId, {
      id: Date.now().toString(),
      product,
      x,
      y,
      ownerId: userId,
    });
  };

  return { onDragOver, onDrop };
}
