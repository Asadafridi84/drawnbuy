import { useState, useRef, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';
import AudioMessage from './AudioMessage';
import RecordingIndicator from './RecordingIndicator';

const EMOJI_LIST = ['😀','❤️','👍','🔥','😍','🎉','💯','😂','👏','🙏','💪','✨','🛒','⭐','🤩','💅'];

export default function CanvasChatPanel({ canvasId, initialMessages = [], style = {} }) {
  const [msgs, setMsgs]           = useState(initialMessages);
  const [text, setText]           = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const now = () => {
    const d = new Date();
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  const sendText = () => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), type: 'text', text, sender: 'You', time: now(), isMe: true }]);
    setText('');
    setShowEmoji(false);
  };

  const sendEmoji = (e) => {
    setMsgs(m => [...m, { id: Date.now(), type: 'text', text: e, sender: 'You', time: now(), isMe: true }]);
    setShowEmoji(false);
  };

  const onAudioReady = (url, duration) => {
    setMsgs(m => [...m, { id: Date.now(), type: 'audio', url, duration, sender: 'You', time: now(), isMe: true }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: 16, overflow: 'hidden', ...style }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}/>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '.88rem', flex: 1 }}>Canvas Chat</span>
        <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)' }}>{msgs.length} messages</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: m.isMe ? 'row-reverse' : 'row', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.isMe ? '#7c3aed' : '#5b21b6', color: '#fff', fontSize: '.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {m.sender[0]}
            </div>
            {m.type === 'audio'
              ? <AudioMessage url={m.url} duration={m.duration} sender={m.sender} time={m.time} isMe={m.isMe}/>
              : (
                <div style={{ background: m.isMe ? 'linear-gradient(90deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.12)', borderRadius: 12, padding: '6px 10px', maxWidth: '75%', border: '1px solid rgba(251,191,36,.2)' }}>
                  {!m.isMe && <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>{m.sender}</div>}
                  <div style={{ fontSize: '.85rem', color: '#fff', lineHeight: 1.4 }}>{m.text}</div>
                  <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', marginTop: 2, textAlign: m.isMe ? 'right' : 'left' }}>{m.time}</div>
                </div>
              )
            }
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Recording indicator */}
      <RecordingIndicator canvasId={canvasId}/>

      {/* Input area */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,.1)', flexShrink: 0 }}>
        {/* Text + emoji row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, position: 'relative' }}>
          <button
            onClick={() => setShowEmoji(v => !v)}
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid #fbbf24', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
          >😊</button>
          {showEmoji && (
            <div style={{ position: 'absolute', bottom: '110%', left: 0, background: '#fff', borderRadius: 12, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 4, width: 220, boxShadow: '0 4px 20px rgba(0,0,0,.2)', zIndex: 50, border: '1.5px solid #fbbf24' }}>
              {EMOJI_LIST.map(e => (
                <button key={e} onClick={() => sendEmoji(e)} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}>{e}</button>
              ))}
            </div>
          )}
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendText()}
            placeholder="Say something..."
            style={{ flex: 1, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '6px 10px', color: '#fff', fontSize: '.82rem', outline: 'none' }}
          />
          <button
            onClick={sendText}
            style={{ background: 'linear-gradient(90deg,#7c3aed,#5b21b6)', border: '1.5px solid #fbbf24', borderRadius: 10, width: 34, height: 34, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        {/* Voice row */}
        <VoiceRecorder canvasId={canvasId} onAudioReady={onAudioReady} userName="You"/>
      </div>
    </div>
  );
}
