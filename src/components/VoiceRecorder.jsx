import { useState, useRef } from 'react';
import { useCanvasStore } from '../store/canvas';

export default function VoiceRecorder({ canvasId, onAudioReady, userName = 'You' }) {
  const [recording, setRecording] = useState(false);
  const [duration,  setDuration]  = useState(0);
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);
  const setRec    = useCanvasStore(s => s.setRecording);
  const clearRec  = useCanvasStore(s => s.clearRecording);

  const startRecording = async (e) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = ev => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        stream.getTracks().forEach(t => t.stop());
        clearRec(canvasId);
        onAudioReady(url, duration || 1);
        setDuration(0);
      };
      mr.start();
      setRecording(true);
      setRec(canvasId, { userId: 'me', userName });
      let secs = 0;
      timerRef.current = setInterval(() => { secs++; setDuration(secs); }, 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone to send voice messages.');
    }
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (mediaRef.current && recording) {
      clearInterval(timerRef.current);
      mediaRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: recording
            ? 'linear-gradient(90deg,#ef4444,#dc2626)'
            : 'linear-gradient(90deg,#7c3aed,#5b21b6)',
          border: '1.5px solid #fbbf24',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          animation: recording ? 'lp 1s infinite' : 'none',
        }}
        title="Hold to record voice message"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 14.93V20H9v2h6v-2h-2v-3.07A7 7 0 0 0 19 11h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93z"/>
        </svg>
      </button>
      {recording ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}/>
          <span style={{ fontSize: '.72rem', color: '#ef4444', fontWeight: 700 }}>
            Recording... {duration}s
          </span>
          <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)' }}>Release to send</span>
        </div>
      ) : (
        <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)' }}>
          Hold to record voice note
        </span>
      )}
    </div>
  );
}
