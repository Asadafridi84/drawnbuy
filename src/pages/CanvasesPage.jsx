import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useCollabStore } from '../store';
import { useUIStore } from '../store';
import { generateRoomId } from '../utils/security';
import styles from './CanvasesPage.module.css';

const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function CanvasesPage() {
  const { user } = useAuthStore();
  const { setRoomId } = useCollabStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCanvases();
  }, [user]);

  const fetchCanvases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/canvases`, {
        credentials: 'include',
      });
      const data = await res.json();
      setCanvases(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load canvases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createCanvas = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const roomId = generateRoomId();
      const res = await fetch(`${API}/api/canvases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName.trim(), roomId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCanvases(prev => [data, ...prev]);
      setNewName('');
      setShowNewForm(false);
      addToast(`🎨 "${data.name}" created!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const deleteCanvas = async (id, name) => {
    setConfirmDelete({ id, name });
  };

  const confirmDeleteCanvas = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    try {
      const res = await fetch(`${API}/api/canvases/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      setCanvases(prev => prev.filter(c => c.id !== id));
      addToast('Canvas deleted', 'info');
    } catch {
      addToast('Could not delete canvas', 'error');
    }
  };

  const openCanvas = (canvas) => {
    setRoomId(canvas.roomId);
    navigate('/');
    setTimeout(() => document.getElementById('canvas')?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  if (!user) return null;

  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/profile">Profile</Link>
            <span>›</span>
            <span>My Canvases</span>
          </nav>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>🎨 My Canvases</h1>
              <p className={styles.pageSubtitle}>{canvases.length} canvas{canvases.length !== 1 ? 'es' : ''} saved</p>
            </div>
            <button className={styles.newBtn} onClick={() => setShowNewForm(true)}>
              + New Canvas
            </button>
          </div>

          {/* New canvas form */}
          {showNewForm && (
            <div className={styles.newForm}>
              <form onSubmit={createCanvas} className={styles.newFormInner}>
                <input
                  type="text"
                  placeholder="Canvas name…"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  maxLength={80}
                  autoFocus
                  className={styles.newInput}
                />
                <button type="submit" className={styles.createBtn} disabled={creating || !newName.trim()}>
                  {creating ? '…' : 'Create'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowNewForm(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Canvas list */}
          {loading ? (
            <div className={styles.loading}>
              <span className={styles.loadingSpinner} />
              Loading your canvases…
            </div>
          ) : canvases.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎨</div>
              <h3>No canvases yet</h3>
              <p>Create your first canvas and start drawing!</p>
              <button className={styles.newBtn} onClick={() => setShowNewForm(true)}>
                + Create Canvas
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {canvases.map(canvas => (
                <CanvasCard
                  key={canvas.id}
                  canvas={canvas}
                  onOpen={() => openCanvas(canvas)}
                  onDelete={() => deleteCanvas(canvas.id, canvas.name)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Inline delete confirmation */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '2rem',
            maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '.75rem', textAlign: 'center' }}>🗑️</div>
            <h3 style={{ margin: '0 0 .5rem', fontSize: '1.1rem', fontWeight: '800', color: '#1a0a3e', textAlign: 'center' }}>
              Delete canvas?
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: '.9rem', textAlign: 'center', lineHeight: '1.5' }}>
              <strong style={{ color: '#1a0a3e' }}>"{confirmDelete.name}"</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1, padding: '.65rem', borderRadius: '9px', border: '1.5px solid #e5e7eb',
                  background: '#f9fafb', color: '#374151', fontWeight: '700',
                  fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCanvas}
                style={{
                  flex: 1, padding: '.65rem', borderRadius: '9px', border: 'none',
                  background: '#ef4444', color: '#fff', fontWeight: '700',
                  fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CanvasCard({ canvas, onOpen, onDelete }) {
  const updatedAt = new Date(canvas.updatedAt).toLocaleDateString('en-SE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={styles.card}>
      <div className={styles.cardThumb} onClick={onOpen}>
        {canvas.thumbnail
          ? <img src={canvas.thumbnail} alt={canvas.name} />
          : <div className={styles.thumbPlaceholder}>🎨</div>
        }
        {canvas.isPublic && <span className={styles.publicBadge}>🌍 Public</span>}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{canvas.name}</h3>
        <p className={styles.cardMeta}>
          Room: <code>{canvas.roomId}</code> · {updatedAt}
        </p>
        <div className={styles.cardActions}>
          <button className={styles.openBtn} onClick={onOpen}>
            🎨 Open
          </button>
          <button
            className={styles.shareCardBtn}
            onClick={() => {
              navigator.clipboard.writeText(`https://drawnbuy.com/canvas/${canvas.roomId}`);
            }}
            title="Copy room link"
          >
            🔗
          </button>
          <button className={styles.deleteCardBtn} onClick={onDelete} title="Delete">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
