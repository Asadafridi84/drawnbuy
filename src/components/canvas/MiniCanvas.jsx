import { useRef, useEffect, useState } from 'react';
import { useCanvasStore } from '../../store';
import styles from './MiniCanvas.module.css';

/**
 * MiniCanvas — floating bottom-right pip that mirrors the main canvas.
 * Expands to a small drawing pad. Collapses to a thumbnail.
 * Syncs tool/color from the global canvas store.
 */
export default function MiniCanvas() {
  const miniRef   = useRef(null);
  const [open, setOpen]       = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [hasContent, setHasContent] = useState(false);

  const { tool, color, strokeWidth } = useCanvasStore();

  // Clear to white on mount
  useEffect(() => {
    const c = miniRef.current;
    if (!c) return;
    c.getContext('2d').fillStyle = '#fff';
    c.getContext('2d').fillRect(0, 0, c.width, c.height);
  }, [open]);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    setLastPos(getPos(e, miniRef.current));
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing || !lastPos) return;
    const canvas = miniRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
    ctx.lineWidth   = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    setLastPos(pos);
    setHasContent(true);
  };

  const stopDraw = () => { setDrawing(false); setLastPos(null); };

  const clearMini = () => {
    const c = miniRef.current;
    if (!c) return;
    c.getContext('2d').fillStyle = '#fff';
    c.getContext('2d').fillRect(0, 0, c.width, c.height);
    setHasContent(false);
  };

  const downloadMini = () => {
    const link      = document.createElement('a');
    link.download   = 'drawnbuy-mini.png';
    link.href       = miniRef.current.toDataURL();
    link.click();
  };

  return (
    <div className={`${styles.container} ${open ? styles.open : ''}`}>
      {/* Toggle pill */}
      <button
        className={styles.toggle}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Collapse mini canvas' : 'Open mini canvas'}
        aria-expanded={open}
      >
        {open ? '✕' : '✏️'}
        {!open && hasContent && <span className={styles.dot} />}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>✏️ Quick Sketch</span>
            <div className={styles.panelActions}>
              <button className={styles.actionBtn} onClick={clearMini} title="Clear">🗑️</button>
              <button className={styles.actionBtn} onClick={downloadMini} title="Save">💾</button>
            </div>
          </div>

          <canvas
            ref={miniRef}
            width={300}
            height={200}
            className={`${styles.canvas} ${tool === 'eraser' ? styles.eraserCursor : styles.penCursor}`}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            aria-label="Mini drawing canvas"
          />

          {/* Current tool indicator */}
          <div className={styles.toolStatus}>
            <span
              className={styles.colorDot}
              style={{ background: tool === 'eraser' ? '#e5e7eb' : color }}
            />
            <span className={styles.toolName}>{tool === 'eraser' ? 'Eraser' : 'Pen'}</span>
            <span className={styles.sizeDot} style={{ width: strokeWidth + 4, height: strokeWidth + 4, background: color }} />
          </div>
        </div>
      )}
    </div>
  );
}
