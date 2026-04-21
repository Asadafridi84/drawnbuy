import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/canvas';
import CanvasOverlayLayer from './CanvasOverlayLayer';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';

export default function MiniFloatingCanvas() {
  const canvasRef = useRef(null);
  const [minimized, setMinimized] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const navigate = useNavigate();
  const addCard  = useCanvasStore(s => s.addCard);
  const [destination, setDestination] = useState('everyone');
  const [pendingProduct, setPendingProduct] = useState(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [miniAudios, setMiniAudios] = useState([]);
  const containerRef = useRef(null);

  const MOCK_ROOMS = [
    { id: 'room-1', name: 'Family Shopping', online: ['Anna', 'Maja'], isOnline: true },
    { id: 'room-2', name: 'My Wishlist',     online: [],              isOnline: false },
    { id: 'room-3', name: 'Spring Fashion',  online: ['Erik'],        isOnline: true },
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/drawnbuy-product');
    if (!raw) return;
    let product;
    try { product = JSON.parse(raw); } catch { return; }
    if (destination === 'everyone') {
      addCard('main-collab', {
        id: Date.now().toString(), product,
        x: 80 + Math.random() * 250, y: 60 + Math.random() * 180, ownerId: 'mini-guest',
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
      x: 60 + Math.random() * 160, y: 40 + Math.random() * 120, ownerId: 'mini-guest',
    });
    setShowRoomPicker(false);
    setPendingProduct(null);
    setConfirmMsg('Added to ' + room.name + '!');
    setTimeout(() => setConfirmMsg(''), 2500);
  };

  const onMiniAudio = (url, dur) => setMiniAudios(m => [...m, { url, dur, id: Date.now() }]);
  const [tool, setTool] = useState('draw');
  const lastPos = useRef(null);

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
    setDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const doDraw = e => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 16;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
    }
    ctx.lineCap = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 300,
      filter: 'drop-shadow(0 8px 32px rgba(124,58,237,.35))',
    }}>
      <style>{`
        @keyframes floatIn { from{opacity:0;transform:scale(.8) translateY(20px)} to{opacity:1;transform:none} }
        .mfc-wrap { animation:floatIn .4s cubic-bezier(.34,1.56,.64,1); }
        .mfc-btn { background:none; border:none; color:rgba(255,255,255,.7); cursor:pointer; font-size:12px; padding:2px 6px; border-radius:4px; transition:.15s; font-family:inherit; font-weight:700; }
        .mfc-btn:hover { background:rgba(255,255,255,.15); color:#fff; }
        .mfc-chip { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); color:rgba(255,255,255,.8); border-radius:6px; padding:4px 8px; font-size:10px; font-weight:700; cursor:pointer; font-family:inherit; transition:.1s; }
        .mfc-chip.on,.mfc-chip:hover { background:rgba(251,191,36,.22); border-color:#fbbf24; color:#fbbf24; }
      `}</style>

      {minimized ? (
        /* Collapsed pill */
        <button
          onClick={() => setMinimized(false)}
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
            border: '2px solid rgba(251,191,36,.4)',
            borderRadius: '50px',
            padding: '10px 16px',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 20px rgba(124,58,237,.5)',
          }}
        >
          🎨 Canvas
          <span style={{ background: '#22c55e', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }} />
        </button>
      ) : (
        /* Expanded canvas */
        <div
          className="mfc-wrap"
          style={{ background: 'linear-gradient(135deg,#3b0764,#5b21b6)', borderRadius: '16px', overflow: 'hidden', width: '240px', border: '2px solid rgba(251,191,36,.3)' }}
        >
          {/* Header */}
          <div style={{ background: 'rgba(0,0,0,.3)', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '2px 7px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} /> LIVE
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.65)', fontWeight: '600', flex: 1 }}>Mini Canvas</span>
            <button className="mfc-btn" onClick={clearCanvas}>🗑</button>
            <button className="mfc-btn" onClick={() => setMinimized(true)}>–</button>
          </div>

          {/* Canvas */}
          <div style={{ background: '#fff', height: '150px', position: 'relative', cursor: tool === 'erase' ? 'cell' : 'crosshair' }}>
            
        {/* Destination toggle */}
        <div style={{ display:'flex', gap:4, padding:'5px 8px', borderBottom:'1px solid rgba(255,255,255,.1)', flexShrink:0 }}>
          {['everyone','rooms'].map(opt => (
            <button key={opt} onClick={() => setDestination(opt)} style={{ flex:1, padding:'3px 0', borderRadius:6, border:'1.5px solid', borderColor: destination===opt?'#fbbf24':'rgba(255,255,255,.15)', background: destination===opt?'#fbbf24':'transparent', color: destination===opt?'#1a0a3e':'rgba(255,255,255,.7)', fontSize:'.65rem', fontWeight:700, cursor:'pointer' }}>
              {opt === 'everyone' ? 'Everyone' : 'My Rooms'}
            </button>
          ))}
        </div>
        {confirmMsg && <div style={{ background:'#d1fae5', color:'#065f46', fontSize:'.68rem', fontWeight:700, padding:'3px 8px', textAlign:'center' }}>{confirmMsg}</div>}
        {showRoomPicker && (
          <div style={{ position:'absolute', bottom:'100%', right:0, marginBottom:6, background:'#fff', borderRadius:12, padding:'10px', width:220, boxShadow:'0 8px 32px rgba(0,0,0,.25)', border:'1.5px solid #fbbf24', zIndex:500 }}>
            <div style={{ fontSize:'.78rem', fontWeight:800, color:'#1a0a3e', marginBottom:6 }}>Choose a room</div>
            {MOCK_ROOMS.map(room => (
              <button key={room.id} onClick={() => dropToRoom(room)} style={{ width:'100%', display:'flex', alignItems:'center', gap:6, padding:'7px 8px', borderRadius:8, border:'1px solid #f3f4f6', background:'#fafafa', cursor:'pointer', marginBottom:3, fontFamily:'inherit' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: room.isOnline?'#22c55e':'#d1d5db', flexShrink:0 }}/>
                <div style={{ flex:1, textAlign:'left' }}>
                  <div style={{ fontSize:'.75rem', fontWeight:700, color:'#1a0a3e' }}>{room.name}</div>
                  {room.online.length > 0 && <div style={{ fontSize:'.6rem', color:'#9ca3af' }}>{room.online.join(', ')} online</div>}
                </div>
              </button>
            ))}
            <button onClick={() => {setShowRoomPicker(false); setPendingProduct(null);}} style={{ width:'100%', padding:'5px', borderRadius:8, border:'1px solid #f3f4f6', background:'#fff', color:'#9ca3af', fontSize:'.7rem', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          </div>
        )}
        <div
          ref={containerRef}
          style={{ position: 'relative', flex: 1 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <canvas
              ref={canvasRef}
              width={240}
              height={150}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              onMouseDown={startDraw}
              onMouseMove={doDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={doDraw}
              onTouchEnd={endDraw}
            />
          <CanvasOverlayLayer canvasId="mini-preview" />
        </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '11px', color: 'rgba(124,58,237,.2)', fontWeight: '600' }}>✏️ Quick draw here</span>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ background: 'rgba(0,0,0,.2)', padding: '6px 8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button className={`mfc-chip ${tool === 'draw' ? 'on' : ''}`} onClick={() => setTool('draw')}>✏️</button>
            <button className={`mfc-chip ${tool === 'erase' ? 'on' : ''}`} onClick={() => setTool('erase')}>🧹</button>
            
        {miniAudios.length > 0 && (
          <div style={{ padding:'4px 8px', borderTop:'1px solid rgba(255,255,255,.1)' }}>
            {miniAudios.slice(-1).map(a => (
              <AudioMessage key={a.id} url={a.url} duration={a.dur} sender="You" time="" isMe={true}/>
            ))}
          </div>
        )}
        <div style={{ padding:'4px 8px', borderTop:'1px solid rgba(255,255,255,.1)' }}>
          <VoiceRecorder canvasId="mini-canvas" onAudioReady={onMiniAudio} userName="You"/>
        </div>
        <button
              style={{ marginLeft: 'auto', background: 'rgba(251,191,36,.2)', border: '1px solid rgba(251,191,36,.3)', color: '#fbbf24', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => document.getElementById('collabSection')?.scrollIntoView({ behavior: 'smooth' })}
            >↑ Open Full</button>
          </div>
        </div>
      )}
    </div>
  );
}
