import { useUIStore } from '../store';

const COLORS = {
  success: { bg: '#dcfce7', border: '#86efac', color: '#15803d', icon: '✅' },
  error:   { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626', icon: '⚠️' },
  warning: { bg: '#fef9c3', border: '#fde047', color: '#ca8a04', icon: '⚡' },
  info:    { bg: '#ede9fe', border: '#c4b5fd', color: '#7c3aed', icon: 'ℹ️' },
};

function Toast({ toast, onRemove }) {
  const style = COLORS[toast.type] || COLORS.info;
  return (
    <div
      onClick={() => onRemove(toast.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: style.bg, border: `1.5px solid ${style.border}`,
        color: style.color, borderRadius: '12px', padding: '12px 16px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,.10)',
        animation: 'toastIn .25s cubic-bezier(.34,1.56,.64,1)',
        maxWidth: '360px', wordBreak: 'break-word',
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <span style={{ opacity: .5, fontSize: '12px', flexShrink: 0 }}>✕</span>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(.96); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          zIndex: 9999, pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
}
