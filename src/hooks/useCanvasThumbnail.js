import { useCallback, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import { useCollabStore } from '../store';

const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * useCanvasThumbnail
 * Attach canvasRef, then call saveThumbnail(canvasId) to capture
 * the current drawing as a 400×232 JPEG thumbnail and persist it.
 */
export function useCanvasThumbnail(canvasRef) {
  const { token } = useAuthStore();
  const { roomId } = useCollabStore();
  const savingRef = useRef(false);

  /** Capture the canvas at thumbnail resolution */
  const capture = useCallback(() => {
    const src = canvasRef.current;
    if (!src) return null;

    const thumb = document.createElement('canvas');
    thumb.width  = 400;
    thumb.height = 232;
    const ctx = thumb.getContext('2d');
    ctx.drawImage(src, 0, 0, 400, 232);
    return thumb.toDataURL('image/jpeg', 0.75);
  }, [canvasRef]);

  /** Save thumbnail to the canvas record by canvasId */
  const saveThumbnail = useCallback(async (canvasId) => {
    if (!canvasId || !token || savingRef.current) return;
    const thumbnail = capture();
    if (!thumbnail) return;

    savingRef.current = true;
    try {
      await fetch(`${API}/api/canvases/${canvasId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ thumbnail }),
      });
    } catch (err) {
      console.warn('[thumbnail] save failed:', err.message);
    } finally {
      savingRef.current = false;
    }
  }, [token, capture]);

  /** Auto-save thumbnail every N seconds while drawing */
  const startAutoSave = useCallback((canvasId, intervalMs = 30_000) => {
    if (!canvasId) return () => {};
    const id = setInterval(() => saveThumbnail(canvasId), intervalMs);
    return () => clearInterval(id);
  }, [saveThumbnail]);

  return { capture, saveThumbnail, startAutoSave };
}
