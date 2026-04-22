import { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../store/canvas';
import { useSocket } from '../hooks/useSocket';
import CanvasOverlayLayer from './CanvasOverlayLayer';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';

export default function MiniFloatingCanvas() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const lastPos      = useRef(null);
  const drawingRef   = useRef(false);
  const addCard      = useCanvasStore(s => s.addCard);
  const { sendDraw, onRemoteDraw } = useSocket();

  useEffect(() => {
    // Subscribe to remote draw events and replay them on the mini canvas
    const unsub = onRemoteDraw((d) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Scale from main canvas logical size (1000×600) to mini (560×280)
      const scaleX = 560 / 1000;
      const scaleY = 280 / 600;
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = d.color || '#7c3aed';
      ctx.lineWidth = Math.max(1, (d.width || 2) * scaleX);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(d.x1 * scaleX, d.y1 * scaleY);
      ctx.lineTo(d.x2 * scaleX, d.y2 * scaleY);
      ctx.stroke();
    });
    return () => { unsub?.(); };
  }, []);

  const [minimized,      setMinimized]      = useState(false);
  const [tool,           setTool]           = useState('draw');
  const [destination,    setDestination]    = useState('everyone');
  const [pendingProduct, setPendingProduct] = useState(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [confirmMsg,     setConfirmMsg]     = useState('');
  const [miniAudios,     setMiniAudios]     = useState([]);
  const [chatText,       setChatText]       = useState('');
  const [chatMsgs,       setChatMsgs]       = useState([]);

  const MOCK_ROOMS = [
    { id: 'room-1', name: 'Family Shopping', online: ['Anna', 'Maja'], isOnline: true  },
    { id: 'room-2', name: 'My Wishlist',     online: [],              isOnline: false },
    { id: 'room-3', name: 'Spring Fashion',  online: ['Erik'],        isOnline: true  },
  ];

  // ── Drawing ──────────────────────────────────────────────────────────────
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

      // Emit stroke scaled to main canvas coords (1000×600) so all clients
      // (including CollabCanvas and other mini canvases) see it in real time
      if (lastPos.current) {
        const scaleX = 1000 / 560;
        const scaleY = 600 / 280;
        sendDraw({
          x1: lastPos.current.x * scaleX,
          y1: lastPos.current.y * scaleY,
          x2: pos.x * scaleX,
          y2: pos.y * scaleY,
          color: '#7c3aed',
          width: 3,
        });
      }
    }
    lastPos.current = pos;
  };

  const endDraw = () => { drawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  // ── Drop handling ─────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData('application/drawnbuy-product');
    if (!raw) return;
    let product;
    try { product = JSON.parse(raw); } catch { return; }

    if (destination === 'everyone') {
      const cardId = Date.now().toString();
      // Show in mini canvas
      addCard('mini-preview', {
        id: cardId, product,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        ownerId: 'mini-guest',
        size: 'mini',
      });
      // Also send to main collab canvas
      addCard('main-collab', {
        id: cardId + '-main', product,
        x: 80 + Math.random() * 400,
        y: 60 + Math.random() * 280,
        ownerId: 'mini-guest',
        size: 'normal',
      });
      setConfirmMsg('✅ Added to canvas!');
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
      size: 'small',
    });
    setShowRoomPicker(false);
    setPendingProduct(null);
    setConfirmMsg('Added to ' + room.name + '!');
    setTimeout(() => setConfirmMsg(''), 2500);
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = () => {
    const txt = chatText.trim();
    if (!txt) return;
    const now = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    setChatMsgs(m => [...m, { id: Date.now(), text: txt, me: true, time: now }]);
    setChatText('');
    // Simulate reply
    setTimeout(() => {
      const replies = ['Nice! 🔥', 'Love it! ❤️', 'Should we buy it?', 'Add to cart!'];
      const now2 = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      setChatMsgs(m => [...m, { id: Date.now() + 1, text: replies[Math.floor(Math.random() * replies.length)], me: false, name: 'Anna', time: now2 }]);
    }, 900 + Math.random() * 600);
  };

  const onMiniAudio = (url, dur) => setMiniAudios(m => [...m, { url, dur, id: Date.now() }]);

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 300, filter: 'drop-shadow(0 8px 32px rgba(124,58,237,.35))' }}>

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

      <div style={{ width: 280, background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,.15)' }}>

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

            {/* Canvas — IMPORTANT: onDragOver+onDrop on canvas element itself so drop is not blocked */}
            <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
              <canvas
                ref={canvasRef}
                data-canvas-id="mini-preview"
                width={560} height={280}
                style={{ width: '100%', height: 140, display: 'block', cursor: tool === 'erase' ? 'cell' : 'crosshair', background: 'rgba(255,255,255,.04)' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={endDraw}
              />
              <CanvasOverlayLayer canvasId="mini-preview" />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', textAlign: 'center' }}>
                <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>✏️ Draw or drop a product</div>
              </div>
            </div>

            {/* Tool buttons */}
            <div style={{ display: 'flex', gap: 4, padding: '5px 8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
              {['draw', 'erase'].map(t => (
                <button key={t} onClick={() => setTool(t)} style={{
                  flex: 1, padding: '3px 0', borderRadius: 6, border: '1.5px solid',
                  borderColor: tool === t ? '#fbbf24' : 'rgba(255,255,255,.15)',
                  background: tool === t ? 'rgba(251,191,36,.15)' : 'transparent',
                  color: tool === t ? '#fbbf24' : 'rgba(255,255,255,.6)',
                  fontSize: '.65rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  {t === 'draw' ? '✏️ Draw' : '⬜ Erase'}
                </button>
              ))}
              <button
                onClick={() => document.getElementById('collabSection')?.scrollIntoView({ behavior: 'smooth' }) || (window.location.href = '/#collabSection')}
                style={{ flex: 1, padding: '3px 0', borderRadius: 6, border: '1.5px solid #fbbf24', background: 'rgba(251,191,36,.15)', color: '#fbbf24', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' }}
              >↗ Open Full</button>
            </div>

            {/* Chat messages */}
            {chatMsgs.length > 0 && (
              <div style={{ maxHeight: 80, overflowY: 'auto', padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {chatMsgs.slice(-5).map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
                    <div style={{ background: m.me ? 'linear-gradient(90deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.12)', borderRadius: 8, padding: '3px 8px', maxWidth: '80%' }}>
                      {!m.me && <div style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>{m.name}</div>}
                      <div style={{ fontSize: '.72rem', color: '#fff' }}>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat input */}
            <div style={{ display: 'flex', gap: 4, padding: '5px 8px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
              <input
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Say something..."
                style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '4px 8px', color: '#fff', fontSize: '.72rem', outline: 'none' }}
              />
              <button onClick={sendChat} style={{ background: 'linear-gradient(90deg,#7c3aed,#5b21b6)', border: '1.5px solid #fbbf24', borderRadius: 8, width: 28, color: '#fff', cursor: 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
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
