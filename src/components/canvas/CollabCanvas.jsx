import { useCanvasThumbnail } from '../../hooks/useCanvasThumbnail';
import { useAuthStore } from '../../store/auth';
const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasStore, useUIStore } from '../../store';
import { useSocket } from '../../hooks/useSocket';
import { sanitizeInput, generateRoomId } from '../../utils/security';
import styles from './CollabCanvas.module.css';

const COLORS = ['#7c3aed','#fbbf24','#67e8f9','#f43f5e','#10b981','#3b82f6','#000000','#ffffff'];
const EMOJIS = ['❤️','😍','🔥','👏','😂','💯','✨','🛒'];

export default function CollabCanvas() {
  const canvasRef = useRef(null);
  const chatRef = useRef(null);
  const socketInitRef = useRef(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [droppedProducts, setDroppedProducts] = useState([]);
  const [emojiPopup, setEmojiPopup] = useState(null);
  const [liveConnected, setLiveConnected] = useState(false);

  const {
    tool, color, strokeWidth, messages, participants,
    setTool, setColor, setStrokeWidth, addMessage,
    roomId, setRoomId,
  } = useCanvasStore();
  const { setShareModalOpen, addToast } = useUIStore();
  const socket = useSocket();
  const { user, token } = useAuthStore();
  const { capture, saveThumbnail } = useCanvasThumbnail(canvasRef);
  const [savedCanvasId, setSavedCanvasId] = useState(null);
  const [saving, setSaving] = useState(false);


  // ── Init canvas + room ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!roomId) setRoomId(generateRoomId());
  }, []);

  // ── Register socket event handlers once ───────────────────────────────────
  useEffect(() => {
    if (!roomId || socketInitRef.current) return;

    // Remote draw replay
    socket.onRemoteDraw((data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    // Remote canvas clear
    socket.onRemoteClear(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setDroppedProducts([]);
    });

    // Restore canvas state on join
    socket.onCanvasState((events) => {
      const canvas = canvasRef.current;
      if (!canvas || !events.length) return;
      const ctx = canvas.getContext('2d');
      events.forEach((e) => {
        if (e.type !== 'draw') return;
        ctx.beginPath();
        ctx.moveTo(e.x1, e.y1);
        ctx.lineTo(e.x2, e.y2);
        ctx.strokeStyle = e.color;
        ctx.lineWidth = e.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      });
    });

    socket.onConnect(() => setLiveConnected(true));
    socket.onDisconnect(() => setLiveConnected(false));

    socketInitRef.current = true;
  }, [roomId]);

  // ── Auto-scroll chat ───────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // ── Connect to live room ───────────────────────────────────────────────────
  const joinLive = () => {
    if (!roomId) return;
    socket.connect(roomId, 'You');
    addToast('🔗 Joining live room…', 'info');
  };

  // ── Drawing helpers ────────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setLastPos(getPos(e, canvas));
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 4 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Emit to other clients
    if (liveConnected) {
      socket.sendDraw({
        x1: lastPos.x, y1: lastPos.y,
        x2: pos.x, y2: pos.y,
        color: tool === 'eraser' ? '#ffffff' : color,
        width: tool === 'eraser' ? strokeWidth * 4 : strokeWidth,
      });
    }

    setLastPos(pos);
  }, [isDrawing, lastPos, tool, color, strokeWidth, liveConnected]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setDroppedProducts([]);
    if (liveConnected) socket.sendClear();
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `drawnbuy-${roomId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addToast('Canvas downloaded! 📥', 'success');
  };


  const saveCanvas = async () => {
    if (!user) { addToast('Log in to save canvases', 'info'); return; }
    if (saving) return;
    setSaving(true);
    try {
      if (savedCanvasId) {
        await saveThumbnail(savedCanvasId);
        addToast('Canvas saved! 💾', 'success');
      } else {
        const res = await fetch(`${API}/api/canvases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify({ name: `Canvas ${roomId}`, roomId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSavedCanvasId(data.id);
        await saveThumbnail(data.id);
        addToast('Canvas saved to My Canvases! 🎨', 'success');
      }
    } catch (err) {
      addToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Chat ───────────────────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = sanitizeInput(chatInput.trim());
    if (!text) return;
    const msg = {
      id: Date.now(),
      text,
      sender: 'You',
      time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    addMessage(msg);
    if (liveConnected) socket.sendMessage(text);
    setChatInput('');
  };

  const sendEmoji = (emoji) => {
    addMessage({
      id: Date.now(), text: emoji, sender: 'You',
      time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      type: 'emoji',
    });
    if (liveConnected) socket.sendEmoji(emoji);
    setEmojiPopup({ emoji, id: Date.now() });
    setTimeout(() => setEmojiPopup(null), 1500);
  };

  // ── Drag-drop products ─────────────────────────────────────────────────────
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/drawnbuy-product');
    if (!data) return;
    const product = JSON.parse(data);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;

    const ctx = canvas.getContext('2d');
    ctx.font = '32px serif';
    ctx.fillText(product.emoji, x * sx - 16, y * sy + 12);
    ctx.font = 'bold 11px Space Grotesk, sans-serif';
    ctx.fillStyle = '#7c3aed';
    ctx.fillText(product.name.slice(0, 14), x * sx - 20, y * sy + 28);

    setDroppedProducts(prev => [...prev, { ...product, x, y }]);
    addToast(`${product.emoji} ${product.name} added to canvas!`, 'success');
    if (liveConnected) socket.sendProductDrop(product, x * sx, y * sy);
  };

  return (
    <section className={styles.section} id="canvas">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🎨 Live Collaboration Canvas</h2>
            <p className={styles.subtitle}>Draw, drag products, and shop with friends in real time</p>
          </div>
          <div className={styles.roomRow}>
            <div className={styles.roomInfo}>
              <span className={styles.roomLabel}>Room</span>
              <span className={styles.roomId}>{roomId}</span>
              {liveConnected
                ? <span className={styles.liveBadge}>🟢 Live</span>
                : <button className={styles.joinLiveBtn} onClick={joinLive}>Join Live</button>
              }
            </div>
            <button className={styles.shareRoomBtn} onClick={() => setShareModalOpen(true)}>
              Invite 👥
            </button>
            <span className={styles.participantCount}>
              {participants.length + 1} online
            </span>
          </div>
        </div>

        <div className={styles.workspace}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <ToolBtn active={tool === 'pen'} onClick={() => setTool('pen')} label="Pen">✏️</ToolBtn>
            <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} label="Eraser">🧹</ToolBtn>
            <div className={styles.divider} />
            <div className={styles.colorGrid}>
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`${styles.colorDot} ${c === color ? styles.activeDot : ''}`}
                  style={{ background: c, border: c === '#ffffff' ? '1px solid #ddd' : 'none' }}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <div className={styles.divider} />
            <div className={styles.sizeRow}>
              {[2, 4, 8, 16].map(s => (
                <button
                  key={s}
                  className={`${styles.sizeBtn} ${s === strokeWidth ? styles.activeSize : ''}`}
                  onClick={() => setStrokeWidth(s)}
                  aria-label={`Size ${s}`}
                >
                  <span style={{ width: s+4, height: s+4, background: color, borderRadius: '50%', display: 'block' }} />
                </button>
              ))}
            </div>
            <div className={styles.divider} />
            <ToolBtn onClick={clearCanvas} label="Clear">🗑️</ToolBtn>
            <ToolBtn onClick={downloadCanvas} label="Download">⬇️</ToolBtn>
            <ToolBtn onClick={saveCanvas} label={saving ? 'Saving…' : (savedCanvasId ? 'Saved ✓' : 'Save')}>
              {saving ? '⏳' : savedCanvasId ? '✅' : '💾'}
            </ToolBtn>
          </div>

          {/* Canvas + Chat */}
          <div className={styles.canvasArea}>
            <div className={styles.canvasWrap} onDragOver={handleDragOver} onDrop={handleDrop}>
              <canvas
                ref={canvasRef}
                width={900}
                height={520}
                className={`${styles.canvas} ${tool === 'eraser' ? styles.eraserCursor : styles.penCursor}`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                aria-label="Drawing canvas"
              />
              {droppedProducts.length === 0 && (
                <div className={styles.dropHint} aria-hidden="true">
                  Drag products here from the strip below ↓
                </div>
              )}
              {emojiPopup && (
                <div className={styles.floatingEmoji} key={emojiPopup.id}>
                  {emojiPopup.emoji}
                </div>
              )}
              <div className={styles.participants}>
                <div className={styles.avatar} style={{ background: '#7c3aed' }}>Y</div>
                {participants.slice(0,4).map((p, i) => (
                  <div key={p.id} className={styles.avatar} style={{ background: p.color, marginLeft: -8 }}>
                    {p.name?.[0]?.toUpperCase() || '?'}
                  </div>
                ))}
                <span className={styles.onlineDot} />
              </div>
            </div>

            {/* Chat */}
            <div className={styles.chatPanel}>
              <div className={styles.chatHeader}>
                💬 Live Chat
                <span className={styles.onlineCount}>{participants.length + 1} online</span>
              </div>
              <div className={styles.messages} ref={chatRef}>
                {messages.length === 0 && (
                  <div className={styles.emptyChat}>Invite friends to chat! 👋</div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`${styles.message} ${msg.sender === 'You' ? styles.mine : ''}`}>
                    <span className={styles.msgSender}>{msg.sender}</span>
                    <span className={`${styles.msgText} ${msg.type === 'emoji' ? styles.emojiMsg : ''}`}>
                      {msg.text}
                    </span>
                    <span className={styles.msgTime}>{msg.time}</span>
                  </div>
                ))}
              </div>
              <div className={styles.emojiRow}>
                {EMOJIS.map(e => (
                  <button key={e} className={styles.emojiBtn} onClick={() => sendEmoji(e)}>{e}</button>
                ))}
              </div>
              <div className={styles.chatInput}>
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  maxLength={200}
                  aria-label="Chat input"
                />
                <button onClick={sendMessage} aria-label="Send">➤</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolBtn({ active, onClick, label, children }) {
  return (
    <button
      className={`${styles.toolBtn} ${active ? styles.activeToolBtn : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
