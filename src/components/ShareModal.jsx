import { useState } from 'react';

export default function ShareModal({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const roomId = new URLSearchParams(window.location.search).get('room') || 'main';
  const link = `${window.location.origin}/?room=${roomId}`;

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = () => {
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,10,62,.75)',
        backdropFilter: 'blur(6px)', zIndex: 700, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px', padding: '1.75rem',
          width: '100%', maxWidth: '420px', position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'modalIn .25s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <style>{`
          @keyframes modalIn { from{opacity:0;transform:scale(.92) translateY(20px)} to{opacity:1;transform:none} }
          .sopt { display:flex; align-items:center; gap:.6rem; padding:.65rem .8rem; border:1.5px solid #e5e7eb; border-radius:10px; cursor:pointer; transition:.15s; background:#fff; }
          .sopt:hover { border-color:#7c3aed; background:#f4f0ff; }
          .sicon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; }
          .inv-input { flex:1; background:#fff; border:1.5px solid #e5e7eb; border-radius:8px; padding:.5rem .7rem; color:#1a0a3e; font-size:.8rem; outline:none; font-family:'Space Grotesk',sans-serif; }
          .inv-input:focus { border-color:#7c3aed; }
        `}</style>

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '.9rem' }}
        >✕</button>

        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1a0a3e', marginBottom: '.25rem' }}>🔗 Share Your Canvas</div>
        <div style={{ fontSize: '.85rem', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.5' }}>
          Invite friends & family to draw and shop together on your canvas in real time.
        </div>

        {/* Link box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: '#f9f7ff', border: '1.5px solid #ede9fe', borderRadius: '10px', padding: '.65rem .9rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '.78rem', color: '#7c3aed', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontWeight: '600' }}>{link}</span>
          <button
            onClick={copy}
            style={{ background: copied ? '#22c55e' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', fontSize: '.75rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: '.2s' }}
          >{copied ? '✓ Copied!' : 'Copy'}</button>
        </div>

        {/* Share options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', marginBottom: '1rem' }}>
          {[
            { bg: '#dcfce7', icon: '💬', label: 'WhatsApp', sub: 'Share via chat', url: `https://wa.me/?text=${encodeURIComponent('Join my DrawNBuy canvas! ' + link)}` },
            { bg: '#dbeafe', icon: '📱', label: 'SMS',       sub: 'Send a text',  url: `sms:?body=${encodeURIComponent('Join my DrawNBuy canvas! ' + link)}` },
            { bg: '#fef9c3', icon: '📧', label: 'Email',     sub: 'Send by email', url: `mailto:?subject=Join my DrawNBuy Canvas&body=${encodeURIComponent('Hey! Join my shopping canvas on DrawNBuy: ' + link)}` },
            { bg: '#f3e8ff', icon: '📷', label: 'QR Code',   sub: 'Scan to open',  url: null },
          ].map(opt => (
            <div key={opt.label} className="sopt" onClick={() => opt.label === 'QR Code' ? setShowQR(v => !v) : (opt.url && window.open(opt.url, '_blank'))}>
              <div className="sicon" style={{ background: opt.bg }}>{opt.icon}</div>
              <div>
                <div style={{ fontSize: '.78rem', fontWeight: '700', color: '#1a0a3e' }}>{opt.label}</div>
                <div style={{ fontSize: '.65rem', color: '#6b7280' }}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* QR Code */}
        {showQR && (
          <div style={{ textAlign: 'center', padding: '.75rem', background: '#f9f7ff', borderRadius: '10px', border: '1.5px solid #ede9fe', marginBottom: '.75rem' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`}
              alt="QR Code"
              style={{ width: 150, height: 150, borderRadius: 8, display: 'block', margin: '0 auto' }}
            />
            <div style={{ fontSize: '.72rem', color: '#7c3aed', fontWeight: '600', marginTop: '.4rem' }}>Scan to open canvas</div>
          </div>
        )}

        {/* Invite by email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: '.75rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '.7rem', color: '#9ca3af' }}>or invite directly</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <div style={{ display: 'flex', gap: '.5rem' }}>
          <input
            className="inv-input"
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
          />
          <button
            onClick={sendInvite}
            style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '8px', padding: '.5rem .9rem', fontSize: '.78rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
          >Invite →</button>
        </div>
        {sent && <div style={{ fontSize: '.72rem', color: '#22c55e', marginTop: '.3rem', fontWeight: '600' }}>✓ Invite sent!</div>}

        {/* Active rooms */}
        <div style={{ fontSize: '.9rem', fontWeight: '800', color: '#1a0a3e', margin: '.85rem 0 .6rem' }}>🚪 Active Rooms</div>
        {[
          { name: 'Spring Shopping 2026', members: 3, time: '2 min ago' },
          { name: 'Birthday Wishlist 🎂',  members: 5, time: '15 min ago' },
          { name: 'IKEA Haul Ideas',       members: 2, time: '1 hr ago' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.6rem .8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', marginBottom: '.4rem' }}>
            <div style={{ display: 'flex' }}>
              {['#7c3aed','#fbbf24','#22c55e'].slice(0, r.members).map((c, j) => (
                <div key={j} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, marginLeft: j > 0 ? '-6px' : 0, border: '2px solid #fff', fontSize: '.62rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{j + 1}</div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.8rem', fontWeight: '700', color: '#1a0a3e' }}>{r.name}</div>
              <div style={{ fontSize: '.65rem', color: '#6b7280' }}>{r.members} drawing now · {r.time}</div>
            </div>
            <button style={{ fontSize: '.72rem', fontWeight: '700', padding: '4px 11px', border: '1.5px solid #ede9fe', borderRadius: '7px', cursor: 'pointer', background: 'transparent', color: '#7c3aed', fontFamily: 'inherit' }}>Join →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
