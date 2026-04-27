import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductDrop } from '../hooks/useProductDrop';
import { useSocket } from '../hooks/useSocket';
import { useCanvasStore } from '../store/canvas';
import { useCollabStore, useUIStore } from '../store';
import { useAuthStore } from '../store/auth';
import CanvasOverlayLayer from './CanvasOverlayLayer';
import { CHAT_MSGS } from '../data';

const EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥳','🎉','🔥','💯','👏','✨','💜','💛','🩵','🛍️','🎨','👟','👗','💄','⌚','📱','💻','🎮','🏠','🍕','🛒','💪','🧸','📚'];

export default function CollabCanvas({ onShare }) {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || 'main';

  const canvasRef = useRef(null);
  const [tool, setTool] = useState('draw');
  const [color, setColor] = useState('#7c3aed');
  const [size, setSize] = useState('md');
  // localMsgs holds messages sent by the current user (immediate feedback).
  // socketMsgs holds messages arriving from remote users via the socket store.
  // Both are merged for display.
  const [localMsgs, setLocalMsgs] = useState(CHAT_MSGS);
  const socketMsgs = useCollabStore(s => s.messages);
  const [chatInput, setChatInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const drawingRef = useRef(false); // sync ref — avoids React async state issue
  const lastPos = useRef(null);
  const msgsRef = useRef(null);

  const colors = ['#7c3aed','#fbbf24','#67e8f9','#ef4444','#22c55e','#f97316','#000000','#ffffff'];
  const sizes = { sm: 2, md: 4, lg: 8 };

  // Combine local + socket messages for display, keeping chronological order
  const msgs = [
    ...localMsgs,
    ...socketMsgs.map(m => ({ name: m.sender, me: false, text: m.text, time: m.time })),
  ];

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [localMsgs, socketMsgs]);

  // Socket setup
  const participants = useCollabStore(s => s.participants);

  const user = useAuthStore(s => s.user);
  const { connect, sendDraw, sendMessage, sendProductDrop, onRemoteDraw, onCanvasState } = useSocket();
  useEffect(() => {
    const username = user?.name || 'Guest';
    connect(roomId, username);

    // Replay a single incoming draw stroke onto the canvas
    const unsubDraw = onRemoteDraw((d) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = d.color || '#000';
      ctx.lineWidth = d.width || 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      ctx.stroke();
    });

    // Replay full canvas history when joining a room that already has strokes
    onCanvasState((events) => {
      const canvas = canvasRef.current;
      if (!canvas || !Array.isArray(events)) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      events.forEach((d) => {
        if (d.type !== 'draw') return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = d.color || '#000';
        ctx.lineWidth = d.width || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.stroke();
      });
    });

    return () => { unsubDraw?.(); };
  }, [roomId]); // re-join when room param changes

  // Product drop + overlay — passes sendProductDrop to emit to remote clients
  const canvasContainerRef = useRef(null);
  const { onDragOver, onDrop } = useProductDrop('main-collab', canvasContainerRef, [], sendProductDrop);
  const addSticker = useCanvasStore(s => s.addSticker);
  const addToast = useUIStore(s => s.addToast);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    addToast('Room link copied! Send it to your friends 🔗', 'success');
  };

  const saveCanvasPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Composite: white bg + drawing + branding watermark
    const out = document.createElement('canvas');
    out.width  = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);

    // Drawing layer
    ctx.drawImage(canvas, 0, 0);

    // Watermark pill — bottom-right
    const wm = 'DrawNBuy 🛍️  drawnbuy.com';
    ctx.font = 'bold 15px "Space Grotesk", sans-serif';
    const tw = ctx.measureText(wm).width;
    const ph = 28, pw = tw + 24, px = out.width - pw - 14, py = out.height - ph - 12;
    ctx.fillStyle = 'rgba(124,58,237,0.88)';
    const r = 14;
    ctx.beginPath();
    ctx.moveTo(px + r, py);
    ctx.lineTo(px + pw - r, py);
    ctx.arcTo(px + pw, py, px + pw, py + r, r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.arcTo(px + pw, py + ph, px + pw - r, py + ph, r);
    ctx.lineTo(px + r, py + ph);
    ctx.arcTo(px, py + ph, px, py + ph - r, r);
    ctx.lineTo(px, py + r);
    ctx.arcTo(px, py, px + r, py, r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(wm, px + 12, py + 19);

    const dataUrl = out.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = 'drawnbuy-canvas.png';
    a.href = dataUrl;
    a.click();
    addToast('Canvas saved with branding 💾', 'success');
  };

  const shareCanvasScreenshot = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const out = document.createElement('canvas');
    out.width  = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);

    // Watermark
    const wm = 'DrawNBuy 🛍️  drawnbuy.com';
    ctx.font = 'bold 15px "Space Grotesk", sans-serif';
    const tw = ctx.measureText(wm).width;
    const ph = 28, pw = tw + 24, px = out.width - pw - 14, py = out.height - ph - 12;
    ctx.fillStyle = 'rgba(124,58,237,0.88)';
    const r = 14;
    ctx.beginPath();
    ctx.moveTo(px + r, py);
    ctx.lineTo(px + pw - r, py);
    ctx.arcTo(px + pw, py, px + pw, py + r, r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.arcTo(px + pw, py + ph, px + pw - r, py + ph, r);
    ctx.lineTo(px + r, py + ph);
    ctx.arcTo(px, py + ph, px, py + ph - r, r);
    ctx.lineTo(px, py + r);
    ctx.arcTo(px, py, px + r, py, r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(wm, px + 12, py + 19);

    // Try Web Share API first (mobile), fallback to clipboard copy
    out.toBlob(async (blob) => {
      if (!blob) { addToast('Could not capture canvas', 'error'); return; }
      const file = new File([blob], 'drawnbuy-canvas.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Shopping together on DrawNBuy 🛍️',
            text: 'Shopping together on DrawNBuy 🛍️  — Draw it. Find it. Buy it.',
          });
          addToast('Canvas shared! 📸', 'success');
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {/* fall through to clipboard */}
        }
      }
      // Clipboard fallback
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        addToast('Canvas screenshot copied to clipboard 📋', 'success');
      } catch {
        // Last resort: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'drawnbuy-canvas.png';
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        addToast('Canvas saved as PNG 💾', 'success');
      }
    }, 'image/png');
  };
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [touchCursor, setTouchCursor] = useState(null); // {x,y} relative to canvas container
  const STICKER_EMOJIS = ['🔥','❤️','👍','😍','💯','⭐','🛒','💰','✅','🎉','🤩','💅'];
  const dropSticker = (emoji) => {
    addSticker('main-collab', {
      id: Date.now().toString(),
      emoji,
      x: 80 + Math.random() * 300,
      y: 60 + Math.random() * 200,
      ownerId: user?.id || 'guest',
    });
    setShowStickerPicker(false);
  };

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY };
  };

  const startDraw = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    drawingRef.current = true;
    const pos = getPos(e, canvas);
    lastPos.current = pos;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (e.touches) {
      const r = canvas.getBoundingClientRect();
      setTouchCursor({ x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top });
    }
  };

  const doDraw = e => {
    if (!drawingRef.current) return; // sync check
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.clearRect(pos.x - 12, pos.y - 12, 24, 24);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = sizes[size];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Emit this segment so remote clients see it in real time
      if (lastPos.current) {
        sendDraw({
          x1: lastPos.current.x,
          y1: lastPos.current.y,
          x2: pos.x,
          y2: pos.y,
          color,
          width: sizes[size],
        });
      }
    }
    lastPos.current = pos;
    if (e.touches) {
      const r = canvasRef.current.getBoundingClientRect();
      setTouchCursor({ x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top });
    }
  };

  const endDraw = () => { drawingRef.current = false; setTouchCursor(null); };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendMsg = () => {
    const text = chatInput.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    // Add to local list immediately for instant feedback
    setLocalMsgs(m => [...m, { name: 'You', me: true, text, time }]);
    // Emit to all other users in the room via socket
    sendMessage(text);
    setChatInput('');
  };

  return (
    <div id="collabSection" style={{
      background: 'linear-gradient(135deg,#3b0764,#5b21b6)',
      padding: '1.2rem 2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes invpulse { 0%,100%{box-shadow:0 4px 20px rgba(249,115,22,.45)} 50%{box-shadow:0 6px 32px rgba(249,115,22,.8),0 0 0 8px rgba(249,115,22,.1)} }
        @keyframes pulseLive2 { 0%,100%{opacity:1} 50%{opacity:.75} }
        @keyframes tdot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        @keyframes wwave { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.6)} }
        @keyframes blinkdot { 0%,100%{opacity:1} 50%{opacity:.2} }
        .collab-orb { position:absolute; top:-60px; right:-60px; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle,rgba(103,232,249,.08),transparent 70%); pointer-events:none; }
        .collab-inner { max-width:1200px; margin:0 auto; }
        .collab-head { display:flex; flex-direction:row; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:.6rem; }
        .invite-btn {
          background:linear-gradient(135deg,#f59e0b,#f97316); color:#fff; border:none;
          border-radius:10px; padding:8px 20px; font-family:'Space Grotesk',sans-serif;
          font-size:13px; font-weight:800; cursor:pointer; animation:invpulse 2.5s infinite;
          white-space:nowrap;
        }
        .invite-btn:hover { transform:translateY(-2px) scale(1.03); }
        .live-count-badge {
          background:rgba(34,197,94,.2); border:1px solid rgba(34,197,94,.4); color:#4ade80;
          font-size:10px; font-weight:800; padding:2px 8px; border-radius:20px;
          display:inline-flex; align-items:center; gap:4px;
        }
        .live-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:pulseLive2 1.5s infinite; display:inline-block; }
        .collab-grid { display:grid; grid-template-columns:1fr 305px; gap:14px; }
        .cv-panel { border:2px solid rgba(251,191,36,.4); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; }
        .cv-top { background:rgba(0,0,0,.3); padding:8px 12px; display:flex; align-items:center; gap:8px; }
        .cv-tools { background:rgba(0,0,0,.25); padding:7px 10px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .t-chip {
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
          color:rgba(255,255,255,.8); border-radius:7px; padding:5px 10px; font-size:11px;
          font-weight:700; cursor:pointer; font-family:inherit; transition:.1s;
        }
        .t-chip.on,.t-chip:hover { background:rgba(251,191,36,.22); border-color:#fbbf24; color:#fbbf24; }
        .cv-area { background:#fff; min-height:480px; position:relative; flex:1; }
        .cv-area canvas { position:absolute; inset:0; width:100%; height:100%; }
        .cv-hint { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; transition:opacity .4s; }
        .chat-panel { background:rgba(0,0,0,.28); border-radius:16px; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(255,255,255,.08); }
        .ctabs { display:flex; border-bottom:1px solid rgba(255,255,255,.08); }
        .ctab { flex:1; padding:.55rem; text-align:center; font-size:.72rem; font-weight:800; color:rgba(255,255,255,.4); cursor:pointer; border-bottom:2px solid transparent; transition:.15s; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit; }
        .ctab.on { color:#67e8f9; border-bottom-color:#67e8f9; }
        .who-bar { padding:.4rem .75rem; border-bottom:1px solid rgba(255,255,255,.08); display:flex; gap:.35rem; align-items:center; flex-wrap:wrap; }
        .who-pill { display:flex; align-items:center; gap:.22rem; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:2px 7px; font-size:.65rem; color:rgba(255,255,255,.75); font-weight:600; }
        .msgs { flex:1; overflow-y:auto; padding:.6rem; display:flex; flex-direction:column; gap:.45rem; max-height:380px; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,.1) transparent; }
        .mw { display:flex; flex-direction:column; max-width:90%; }
        .mw.me { align-self:flex-end; align-items:flex-end; }
        .mw.them { align-self:flex-start; align-items:flex-start; }
        .mname { font-size:.58rem; color:rgba(255,255,255,.4); margin-bottom:2px; font-weight:700; text-transform:uppercase; }
        .mbbl { padding:.4rem .65rem; border-radius:10px; font-size:.75rem; line-height:1.45; }
        .mw.me .mbbl { background:rgba(251,191,36,.2); color:#fde68a; border-bottom-right-radius:3px; }
        .mw.them .mbbl { background:rgba(103,232,249,.15); color:#a5f3fc; border-bottom-left-radius:3px; }
        .mtime { font-size:.58rem; color:rgba(255,255,255,.25); margin-top:2px; }
        .chat-inp { border-top:1px solid rgba(255,255,255,.08); padding:.55rem; display:flex; flex-direction:column; gap:.35rem; }
        .cinp-row { display:flex; gap:.4rem; align-items:flex-end; }
        .cinp { flex:1; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:9px; padding:.42rem .65rem; color:#fff; font-size:.75rem; resize:none; outline:none; font-family:inherit; max-height:65px; }
        .cinp::placeholder { color:rgba(255,255,255,.35); }
        .cinp:focus { border-color:rgba(103,232,249,.4); }
        .sbtn { background:#fbbf24; color:#3b0764; border:none; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:.85rem; font-weight:800; flex-shrink:0; }
        .emoji-btn { background:rgba(255,255,255,.15); border:1.5px solid rgba(255,255,255,.3); border-radius:8px; padding:5px 10px; font-size:18px; cursor:pointer; transition:.15s; flex-shrink:0; }
        .emoji-picker { position:absolute; bottom:100%; left:0; background:#fff; border:1.5px solid #ede9fe; border-radius:14px; padding:.7rem; box-shadow:0 8px 40px rgba(124,58,237,.25); z-index:9998; width:260px; max-height:200px; overflow-y:auto; }
        .emoji-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:2px; }
        .ep-em { font-size:20px; cursor:pointer; padding:5px; border-radius:8px; text-align:center; transition:.1s; display:flex; align-items:center; justify-content:center; }
        .ep-em:hover { background:#f4f0ff; transform:scale(1.2); }
        @media(max-width:900px) { .collab-grid { grid-template-columns:1fr; } }

        /* ── Mobile canvas UX ── */
        @media(max-width:768px) {
          /* Larger touch targets for all tool chips */
          .t-chip {
            min-height:44px; padding:10px 14px; font-size:13px;
          }
          /* Larger colour swatches */
          .cv-top .color-swatch {
            width:26px !important; height:26px !important;
          }
          /* Larger size pickers */
          .cv-top .size-chip {
            width:36px !important; height:32px !important;
          }
          /* Slide-up chat panel */
          .chat-panel {
            position:fixed !important;
            bottom:0; left:0; right:0;
            border-radius:20px 20px 0 0 !important;
            z-index:200;
            max-height:60vh;
            transform:translateY(calc(100% - 52px));
            transition:transform .35s cubic-bezier(.32,1,.56,1);
            box-shadow:0 -8px 40px rgba(0,0,0,.5);
            border:1px solid rgba(255,255,255,.15) !important;
          }
          .chat-panel.open {
            transform:translateY(0);
          }
          .chat-panel-drag {
            height:20px; display:flex; align-items:center; justify-content:center;
            cursor:pointer; flex-shrink:0;
          }
          .chat-panel-drag::before {
            content:''; width:36px; height:4px; border-radius:2px;
            background:rgba(255,255,255,.3); display:block;
          }
          /* Touch cursor dot */
          .touch-cursor {
            position:absolute; width:20px; height:20px; border-radius:50%;
            border:2px solid rgba(124,58,237,.7);
            background:rgba(124,58,237,.2);
            pointer-events:none; transform:translate(-50%,-50%);
            transition:opacity .15s, transform .1s;
            z-index:10;
          }
        }
        .presence-bubbles { display:flex; align-items:center; }
        .presence-av { width:26px; height:26px; border-radius:50%; border:2px solid rgba(255,255,255,.5); display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:#fff; margin-left:-6px; transition:.2s; flex-shrink:0; }
        .presence-av:first-child { margin-left:0; }
        .presence-av:hover { transform:translateY(-3px) scale(1.1); z-index:5; }
        .presence-more { background:rgba(255,255,255,.18); border:2px solid rgba(255,255,255,.35); color:#fff; font-size:9px; font-weight:800; }
      `}</style>

      <div className="collab-orb" />

      <div className="collab-inner">
        {/* Header */}
        <div className="collab-head">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              🎨 Collaborative Canvas
              <span className="live-count-badge"><span className="live-dot" /> {participants.length > 0 ? participants.length : 247} drawing now</span>
            </h2>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', margin: '3px 0 0' }}>Draw together, find products, shop as a team</p>
          </div>
          <button className="invite-btn" onClick={copyRoomLink}>🔗 Invite Friends &amp; Family</button>
        </div>

        {/* Grid */}
        <div className="collab-grid">
          {/* Canvas Panel */}
          <div className="cv-panel">
            <div className="cv-top">
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 9px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', animation: 'blinkdot 1s infinite', display: 'inline-block' }} /> LIVE
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['#7c3aed','#fbbf24','#67e8f9','#ef4444','#22c55e','#000'].map((c, i) => (
                  <div key={i} onClick={() => { setColor(c); setTool('draw'); }} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, cursor: 'pointer', border: `2px solid ${color===c?'#fff':'transparent'}`, transition: '.12s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                {['sm','md','lg'].map(s => (
                  <div key={s} onClick={() => setSize(s)} style={{ background: size===s?'rgba(251,191,36,.22)':'rgba(255,255,255,.1)', border: `1px solid ${size===s?'#fbbf24':'rgba(255,255,255,.15)'}`, borderRadius: '5px', width: '26px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span style={{ background: '#fff', borderRadius: '50%', display: 'block', width: s==='sm'?'4px':s==='md'?'7px':'10px', height: s==='sm'?'4px':s==='md'?'7px':'10px' }} />
                  </div>
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '12px', fontWeight: '600', marginLeft: 'auto' }}>Room: #{roomId}</span>

              {/* Live avatar bubbles */}
              {(() => {
                const visible = participants.slice(0, 4);
                const extra   = participants.length - 4;
                const initials = (name) => (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                return (
                  <div className="presence-bubbles" title={participants.map(p=>p.name).join(', ')}>
                    {visible.map(p => (
                      <div key={p.id} className="presence-av" style={{ background: p.color || '#7c3aed' }} title={p.name}>
                        {initials(p.name)}
                      </div>
                    ))}
                    {extra > 0 && (
                      <div className="presence-av presence-more">+{extra}</div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="cv-tools">
              {[['draw','✏️ Draw'],['erase','🧹 Erase']].map(([t,l]) => (
                <button key={t} className={`t-chip ${tool===t?'on':''}`} onClick={() => setTool(t)}>{l}</button>
              ))}
              <button className="t-chip" onClick={clearCanvas}>Clear</button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowStickerPicker(v => !v)}
                  style={{ background:'rgba(255,255,255,.15)', border:'1.5px solid #fbbf24', borderRadius:8, padding:'4px 10px', fontSize:'.75rem', fontWeight:700, cursor:'pointer', color:'#fff' }}
                >+ Sticker</button>
                {showStickerPicker && (
                  <div style={{ position:'absolute', top:'110%', left:0, background:'#fff', borderRadius:12, padding:8, boxShadow:'0 4px 20px rgba(0,0,0,.2)', display:'flex', gap:4, flexWrap:'wrap', width:220, zIndex:50, border:'1.5px solid #fbbf24' }}>
                    {STICKER_EMOJIS.map(e => (
                      <button key={e} onClick={() => dropSticker(e)} style={{ fontSize:22, background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6 }}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className="t-chip" style={{ marginLeft: 'auto' }} onClick={saveCanvasPng}>💾 Save</button>
              <button className="t-chip" onClick={shareCanvasScreenshot} style={{ background: 'rgba(251,191,36,.15)', borderColor: '#fbbf24', color: '#fbbf24' }}>📸 Share Canvas</button>
              <button className="t-chip" onClick={() => onShare?.()}>📤 Invite</button>
            </div>

            <div className="cv-area" style={{ cursor: tool==='erase'?'cell':'crosshair' }}>
              <div
                  ref={canvasContainerRef}
                  style={{ position: 'relative', flex: 1, width: '100%', height: '100%' }}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                >
                  <canvas
                ref={canvasRef}
                data-canvas-id="main-collab"
                width={1000}
                height={600}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                onMouseDown={startDraw}
                onMouseMove={doDraw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={doDraw}
                onTouchEnd={endDraw}
              />
                  <CanvasOverlayLayer canvasId="main-collab" />
                  {/* Touch cursor feedback dot */}
                  {touchCursor && (
                    <div className="touch-cursor" style={{ left: touchCursor.x, top: touchCursor.y, borderColor: color }} />
                  )}
                </div>
              <div className="cv-hint">
                <span style={{ fontSize: '13px', color: 'rgba(124,58,237,.2)', fontWeight: '600' }}>✏️ Draw or drag a product here — friends see it live!</span>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className={`chat-panel${chatOpen ? ' open' : ''}`}>
            {/* Mobile drag handle — tap to toggle open/close */}
            <div className="chat-panel-drag" onClick={() => setChatOpen(v => !v)} aria-label="Toggle chat" />
            <div className="ctabs">
              {[['chat','💬 Chat'],['products','🛍️ Products'],['rooms','🚪 Rooms']].map(([t,l]) => (
                <button key={t} className={`ctab ${activeTab===t?'on':''}`} onClick={() => setActiveTab(t)}>{l}</button>
              ))}
            </div>

            {activeTab === 'chat' && <>
            <div className="who-bar">
              <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.4)', fontWeight: '700' }}>In room:</span>
              {(participants.length > 0 ? participants : [
                { id: 'a', name: 'Anna', color: '#7c3aed' },
                { id: 'b', name: 'Maja', color: '#22c55e' },
                { id: 'c', name: 'You',  color: '#fbbf24' },
              ]).slice(0, 5).map(p => (
                <span key={p.id} className="who-pill">
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color || '#22c55e', display: 'inline-block' }} />
                  {p.name}
                </span>
              ))}
            </div>

            <div className="msgs" ref={msgsRef}>
              {msgs.map((m, i) => (
                <div key={i} className={`mw ${m.me ? 'me' : 'them'}`}>
                  {!m.me && <div className="mname">{m.name}</div>}
                  <div className="mbbl">{m.text}</div>
                  <div className="mtime">{m.time}</div>
                </div>
              ))}
            </div>

            <div className="chat-inp" style={{ position: 'relative' }}>
              {emojiOpen && (
                <div className="emoji-picker">
                  <div className="emoji-grid">
                    {EMOJIS.map(em => (
                      <div key={em} className="ep-em" onClick={() => { setChatInput(v => v + em); setEmojiOpen(false); }}>{em}</div>
                    ))}
                  </div>
                </div>
              )}
              <div className="cinp-row">
                <button className="emoji-btn" onClick={() => setEmojiOpen(o => !o)}>😊</button>
                <textarea
                  className="cinp"
                  placeholder="Message Anna & Maja… 😊"
                  value={chatInput}
                  rows={1}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                />
                <button className="sbtn" onClick={sendMsg}>→</button>
              </div>
            </div>
            </>}
            {activeTab === 'products' && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.5)', padding:'1rem', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:'.5rem' }}>🛍️</div>
                <div style={{ fontWeight:700, marginBottom:'.3rem' }}>Drag products here</div>
                <div style={{ fontSize:'.8rem' }}>Drag any product card from below onto the canvas</div>
              </div>
            )}
            {activeTab === 'rooms' && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.5)', padding:'1rem', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:'.5rem' }}>🚪</div>
                <div style={{ fontWeight:700, marginBottom:'.3rem' }}>Private Rooms</div>
                <div style={{ fontSize:'.8rem', marginBottom:'1rem' }}>Draw and shop with specific friends</div>
                <button onClick={() => window.location.href='/canvases'} style={{ background:'linear-gradient(90deg,#7c3aed,#5b21b6)', color:'#fff', border:'1.5px solid #fbbf24', borderRadius:8, padding:'8px 18px', cursor:'pointer', fontWeight:700 }}>Open Rooms →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
