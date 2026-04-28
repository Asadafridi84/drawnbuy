import { useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useCollabStore, useUIStore } from '../store';
import { useCanvasStore as useCanvasProductStore } from '../store/canvas';

// In production (Vercel) VITE_SERVER_URL must be set in the Vercel dashboard
// to your Render backend URL, e.g. https://drawnbuy-backend.onrender.com
// The localhost fallback is only for local development.
const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? 'https://drawnbuy-backend.onrender.com'
      : 'http://localhost:3001');

// Singleton socket — one connection per browser session
let socket = null;
// handlers that accept a single latest callback (overwrite semantics)
const handlers = {};
// handlers that accumulate multiple subscribers (array semantics)
const multiHandlers = { onRemoteDraw: [] };

function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function useSocket() {
  const { addMessage, setParticipants } = useCollabStore();
  const { addToast } = useUIStore();
  const addCard = useCanvasProductStore(s => s.addCard);

  // ── Connect & join room ───────────────────────────────────────────────────
  const connect = useCallback((roomId, username = 'Anonymous') => {
    const s = getSocket();
    if (s.connected) {
      s.emit('join-room', { roomId, username });
      return;
    }

    s.connect();

    s.once('connect', () => {
      console.log('[socket] connected', s.id);
      s.emit('join-room', { roomId, username });
      handlers.onConnect?.();
    });

    s.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason);
      handlers.onDisconnect?.();
      if (reason !== 'io client disconnect') {
        addToast('Connection lost. Reconnecting…', 'error');
      }
    });

    s.on('reconnect', () => {
      addToast('✅ Reconnected!', 'success');
      handlers.onConnect?.();
    });

    s.on('connect_error', (err) => {
      console.warn('[socket] error:', err.message);
    });

    // ── Incoming events ────────────────────────────────────────────────────
    s.on('draw', (data) => multiHandlers.onRemoteDraw.forEach(fn => fn(data)));
    s.on('canvas-cleared', () => handlers.onRemoteClear?.());
    s.on('canvas-state', (events) => handlers.onCanvasState?.(events));

    s.on('product-state', (products) => {
      if (!Array.isArray(products)) return;
      products.forEach((data) => {
        addCard(data.canvasId || 'main-collab', {
          id: data.id || Date.now().toString(),
          product: { name: data.name, price: data.price, img: data.img, url: data.url },
          x: data.x || 80,
          y: data.y || 60,
          ownerId: data.droppedBy || 'remote',
        });
      });
    });

    s.on('participants', (list) => setParticipants(list));
    s.on('user-joined', (user) => addToast(`${user.name} joined 👋`, 'info'));
    s.on('user-left', (user) => addToast(`${user.name} left`, 'info'));

    s.on('chat-message', (msg) => {
      if (msg.senderId === s.id) return; // don't echo own messages
      addMessage({
        ...msg,
        time: new Date(msg.time).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      });
    });

    s.on('emoji-reaction', ({ emoji, sender }) => {
      addMessage({
        id: Date.now(), text: emoji, sender,
        time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
        type: 'emoji',
      });
    });

    s.on('voice-message', (data) => {
      addMessage({
        id: Date.now(),
        type: 'voice',
        audioSrc: data.audioBase64,
        sender: data.senderName || 'Someone',
        time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      });
    });

    s.on('sticker-placed', (data) => {
      useCanvasProductStore.getState().addSticker(data.canvasId || 'main-collab', {
        id: data.id,
        emoji: data.emoji,
        x: data.x || 80,
        y: data.y || 60,
        ownerId: data.ownerId || 'remote',
      });
    });

    s.on('product-dropped', (data) => {
      addToast(`${data.emoji || '📦'} ${data.droppedBy || 'Someone'} placed ${data.name} on canvas!`, 'info');
      // Also render the product card on the remote client's canvas
      addCard(data.canvasId || 'main-collab', {
        id: data.id || Date.now().toString(),
        product: {
          name: data.name,
          price: data.price,
          img: data.img,
          url: data.url,
        },
        x: data.x || 80,
        y: data.y || 60,
        ownerId: data.droppedBy || 'remote',
      });
    });
  }, []);

  const disconnect = useCallback(() => {
    socket?.disconnect();
  }, []);

  // ── Outbound emitters ─────────────────────────────────────────────────────
  const sendDraw       = useCallback((d) => socket?.emit('draw', d), []);
  const sendClear      = useCallback(() => socket?.emit('clear-canvas'), []);
  const sendMessage    = useCallback((text) => socket?.emit('chat-message', { text }), []);
  const sendEmoji      = useCallback((emoji) => socket?.emit('emoji-reaction', { emoji }), []);
  const sendProductDrop = useCallback((product, x, y) => {
    socket?.emit('product-dropped', { ...product, x, y });
  }, []);
  const sendVoiceMessage = useCallback((audioBase64) => {
    socket?.emit('voice-message', { audioBase64 });
  }, []);
  const sendSticker = useCallback((sticker) => {
    socket?.emit('sticker-placed', sticker);
  }, []);

  // ── Handler registration ──────────────────────────────────────────────────
  // onRemoteDraw supports multiple subscribers; returns an unsubscribe function
  const onRemoteDraw  = useCallback((fn) => {
    multiHandlers.onRemoteDraw.push(fn);
    return () => {
      multiHandlers.onRemoteDraw = multiHandlers.onRemoteDraw.filter(f => f !== fn);
    };
  }, []);
  const onRemoteClear  = useCallback((fn) => { handlers.onRemoteClear = fn; }, []);
  const onCanvasState  = useCallback((fn) => { handlers.onCanvasState = fn; }, []);
  const onConnect      = useCallback((fn) => { handlers.onConnect = fn; }, []);
  const onDisconnect   = useCallback((fn) => { handlers.onDisconnect = fn; }, []);

  return {
    connect, disconnect,
    sendDraw, sendClear, sendMessage, sendEmoji, sendProductDrop, sendVoiceMessage, sendSticker,
    onRemoteDraw, onRemoteClear, onCanvasState, onConnect, onDisconnect,
    isConnected: () => socket?.connected ?? false,
  };
}
