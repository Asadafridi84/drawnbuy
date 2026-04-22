import { useState, useRef } from 'react';
import { useCanvasStore } from '../store/canvas';
import CanvasOverlayLayer from './CanvasOverlayLayer';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';

export default function MiniFloatingCanvas() {
  // ALL hooks must be at the top — no exceptions
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const lastPos        = useRef(null);
  const addCard        = useCanvasStore(s => s.addCard);

  const [minimized,      setMinimized]      = useState(false);
  const drawingRef = useRef(false);
  const [tool,           setTool]           = useState('draw');
  const [destination,    setDestination]    = useState('everyone');
  const [pendingProduct, setPendingProduct] = useState(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [confirmMsg,     setConfirmMsg]     = useState('');
  const [miniAudios,     setMiniAudios]     = useState([]);

  const MOCK_ROOMS = [
    { id: 'room-1', name: 'Family Shopping', online: ['Anna', 'Maja'], isOnline: true  },
    { id: 'room-2', name: 'My Wishlist',     online: [],              isOnline: false },
    { id: 'room-3', name: 'Spring Fashion',  online: ['Erik'],        isOnline: true  },
  ];

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY };
  };

  const startDraw = e => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  };

  const doDraw = e => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.clearRect(pos.x - 10, pos.y - 10, 20, 20);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const endDraw = () => { drawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/drawnbuy-product');
    if (!raw) return;
    let product;
    try { product = JSON.parse(raw); } catch { return; }

    if (destination === 'everyone') {
      const cardId = Date.now().toString();
      addCard('main-collab', {
        id: cardId, product,
        x: 80 + Math.random() * 250,
        y: 60 + Math.random() * 180,
        ownerId: 'mini-guest',
      });
      addCard('mini-preview', {
        id: cardId + '-preview', product,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        ownerId: 'mini-guest',
      });
      setConfirmMsg('Added to main canvas!');
      setTimeout(() => setConfirmMsg(''), 2500);
    } else {
      setPendingProduct(product);
      setShowRoomPicker(true);
    }
  };

  const dropToRoom = (room) => {
    if (!pendingProduct) return;
    addCard(room.id, {
      id: Date.now().toString(), product: pendingProduct,
      x: 60 + Math.random() * 160,
      y: 40 + Math.random() * 120,
      ownerId: 'mini-guest',
    });
    setShowRoomPicker(false);
    setPendingProduct(null);
    setConfirmMsg('Added to ' + room.name + '!');
    setTimeout(() => setConfirmMsg(''), 2500);
  };

  const onMiniAudio = (url, dur) => setMiniAudios(m => [...m, { url, dur, id: Date.now() }]);

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 300,
      filter: 'drop-shadow(0 8px 32px rgba(124,58,237,.35))',
    }}>
      {/* Room picker popup */}
      {showRoomPicker && (
        <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 8, background: '#fff', borderRadius: 12, padding: 12, width: 230, boxShadow: '0 8px 32px rgba(0,0,0,.25)', border: '1.5px solid #fbbf24', zIndex: 500 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 800, color: '#1a0a3e', marginBottom: 8 }}>Choose a room</div>
          {MOCK_ROOMS.map(room => (
            <button key={room.id} onClick={() => dropToRoom(room)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #f3f4f6', background: '#fafafa', cursor: 'pointer', marginBottom: 4, fontFamily: 'inherit' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: room.isOnline ? '#22c55e' : '#d1d5db', flexShrink: 0 }}/>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#1a0a3e' }}>{room.name}</div>
                {room.online.length > 0 && <div style={{ fontSize: '.62rem', color: '#9ca3af' }}>{room.online.join(', ')} online</div>}
              </div>
            </button>
          ))}
          <button onClick={() => { setShowRoomPicker(false); setPendingProduct(null); }} style={{ width: '100%', padding: '6px', borderRadius: 8, border: '1px solid #f3f4f6', background: '#fff', color: '#9ca3af', fontSize: '.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        </div>
      )}

      <div style={{
        width: 280, background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)',
        borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}/>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '.82rem', flex: 1 }}>LIVE Mini Canvas</span>
          <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '.75rem' }}>✕ Clear</button>
          <button onClick={() => setMinimized(v => !v)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '.85rem' }}>
            {minimized ? '▲' : '▼'}
          </button>
        </div>

        {!minimized && (
          <>
            {/* Destination toggle */}
            <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
              {['everyone', 'rooms'].map(opt => (
                <button key={opt} onClick={() => setDestination(opt)} style={{
                  flex: 1, padding: '4px 0', borderRadius: 6, border: '1.5px solid',
                  borderColor: destination === opt ? '#fbbf24' : 'rgba(255,255,255,.15)',
                  background: destination === opt ? '#fbbf24' : 'transparent',
                  color: destination === opt ? '#1a0a3e' : 'rgba(255,255,255,.7)',
                  fontSize: '.68rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  {opt === 'everyone' ? 'Everyone' : 'My Rooms'}
                </button>
              ))}
            </div>

            {/* Confirm message */}
            {confirmMsg && (
              <div style={{ background: '#d1fae5', color: '#065f46', fontSize: '.7rem', fontWeight: 700, padding: '4px 8px', textAlign: 'center' }}>
                {confirmMsg}
              </div>
            )}

            {/* Canvas drop area */}
            <div
              ref={containerRef}
              style={{ position: 'relative', width: '100%' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <canvas
                ref={canvasRef}
                width={560} height={280}
                style={{ width: '100%', height: 140, display: 'block', cursor: tool === 'erase' ? 'cell' : 'crosshair', background: 'rgba(255,255,255,.04)' }}
                onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={endDraw}
              />
              <CanvasOverlayLayer canvasId="mini-preview" />
              {/* Placeholder text */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', textAlign: 'center' }}>
                <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>✏️ Draw or drag a product here</div>
              </div>
            </div>

            {/* Tool buttons */}
            <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
              {['draw', 'erase'].map(t => (
                <button key={t} onClick={() => setTool(t)} style={{
                  flex: 1, padding: '4px 0', borderRadius: 6, border: '1.5px solid',
                  borderColor: tool === t ? '#fbbf24' : 'rgba(255,255,255,.15)',
                  background: tool === t ? 'rgba(251,191,36,.15)' : 'transparent',
                  color: tool === t ? '#fbbf24' : 'rgba(255,255,255,.6)',
                  fontSize: '.68rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  {t === 'draw' ? '✏️ Draw' : '⬜ Erase'}
                </button>
              ))}
              <button
                onClick={() => document.getElementById('collabSection')?.scrollIntoView({ behavior: 'smooth' }) || (window.location.href = '/#collabSection')}
                style={{ flex: 1, padding: '4px 0', borderRadius: 6, border: '1.5px solid #fbbf24', background: 'rgba(251,191,36,.15)', color: '#fbbf24', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}
              >↗ Open Full</button>
            </div>

            {/* Audio playback */}
            {miniAudios.length > 0 && (
              <div style={{ padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
                {miniAudios.slice(-1).map(a => (
                  <AudioMessage key={a.id} url={a.url} duration={a.dur} sender="You" time="" isMe={true}/>
                ))}
              </div>
            )}

            {/* Voice recorder */}
            <div style={{ padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
              <VoiceRecorder canvasId="mini-canvas" onAudioReady={onMiniAudio} userName="You"/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
