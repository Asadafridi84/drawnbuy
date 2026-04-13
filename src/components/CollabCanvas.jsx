import { useState, useRef, useEffect } from 'react';
import { CHAT_MSGS } from '../data';

const EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥳','🎉','🔥','💯','👏','✨','💜','💛','🩵','🛍️','🎨','👟','👗','💄','⌚','📱','💻','🎮','🏠','🍕','🛒','💪','🧸','📚'];

export default function CollabCanvas() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('draw');
  const [color, setColor] = useState('#7c3aed');
  const [size, setSize] = useState('md');
  const [msgs, setMsgs] = useState(CHAT_MSGS);
  const [chatInput, setChatInput] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef(null);
  const msgsRef = useRef(null);

  const colors = ['#7c3aed','#fbbf24','#67e8f9','#ef4444','#22c55e','#f97316','#000000','#ffffff'];
  const sizes = { sm: 2, md: 4, lg: 8 };

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

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
      ctx.lineWidth = 24;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = sizes[size];
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    setMsgs(m => [...m, { name: 'You', me: true, text: chatInput.trim(), time: new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) }]);
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
      `}</style>

      <div className="collab-orb" />

      <div className="collab-inner">
        {/* Header */}
        <div className="collab-head">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              🎨 Collaborative Canvas
              <span className="live-count-badge"><span className="live-dot" /> 247 drawing now</span>
            </h2>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', margin: '3px 0 0' }}>Draw together, find products, shop as a team</p>
          </div>
          <button className="invite-btn">🔗 Invite Friends &amp; Family</button>
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
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.65)', fontSize: '12px', fontWeight: '600' }}>Room: #spring2026</span>
            </div>

            <div className="cv-tools">
              {[['draw','✏️ Draw'],['erase','🧹 Erase']].map(([t,l]) => (
                <button key={t} className={`t-chip ${tool===t?'on':''}`} onClick={() => setTool(t)}>{l}</button>
              ))}
              <button className="t-chip" onClick={clearCanvas}>🗑 Clear</button>
              <button className="t-chip" style={{ marginLeft: 'auto' }}>💾 Save</button>
              <button className="t-chip">📤 Share</button>
            </div>

            <div className="cv-area" style={{ cursor: tool==='erase'?'cell':'crosshair' }}>
              <canvas
                ref={canvasRef}
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
              <div className="cv-hint">
                <span style={{ fontSize: '13px', color: 'rgba(124,58,237,.2)', fontWeight: '600' }}>✏️ Draw or drag a product here — friends see it live!</span>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="ctabs">
              {[['chat','💬 Chat'],['products','🛍️ Products'],['rooms','🚪 Rooms']].map(([t,l]) => (
                <button key={t} className={`ctab ${activeTab===t?'on':''}`} onClick={() => setActiveTab(t)}>{l}</button>
              ))}
            </div>

            <div className="who-bar">
              <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.4)', fontWeight: '700' }}>In room:</span>
              {['Anna 🟢','Maja 🟢','You 🟢'].map(n => (
                <span key={n} className="who-pill"><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />{n}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
