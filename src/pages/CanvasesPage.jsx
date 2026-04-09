import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useCanvasStore } from '../store';
import { useUIStore } from '../store';
import { generateRoomId } from '../utils/security';
import styles from './CanvasesPage.module.css';

const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function CanvasesPage() {
  const { user, token } = useAuthStore();
  const { setRoomId } = useCanvasStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCanvases();
  }, [user]);

  const fetchCanvases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/canvases`, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/canvases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
