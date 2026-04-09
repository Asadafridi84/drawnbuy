import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import styles from './ProfilePage.module.css';

const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ name: user.name || '', bio: user.bio || '' });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, bio: form.bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Update store user
      useAuthStore.setState(s => ({ user: { ...s.user, ...data } }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = user.name?.slice(0, 2).toUpperCase() || '??';
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-SE', { year: 'numeric', month: 'long' })
    : 'Recently';

  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>My Profile</span>
          </nav>

          <div className={styles.grid}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.avatarCard}>
                <div className={styles.avatar}>{initials}</div>
                <h2 className={styles.displayName}>{user.name}</h2>
                <p className={styles.email}>{user.email}</p>
                <p className={styles.joinDate}>Member since {joinDate}</p>
                <button className={styles.avatarUploadBtn} disabled title="Coming soon">
                  📷 Upload Photo
                </button>
              </div>

              <div className={styles.statsCard}>
                <h3 className={styles.statsTitle}>Your Stats</h3>
                <div className={styles.statRow}>
                  <span>🎨 Canvases</span><strong>—</strong>
                </div>
                <div className={styles.statRow}>
                  <span>👥 Collabs</span><strong>—</strong>
                </div>
                <div className={styles.statRow}>
                  <span>🛒 Products placed</span><strong>—</strong>
                </div>
                <div className={styles.statRow}>
                  <span>💬 Messages sent</span><strong>—</strong>
                </div>
              </div>

              <div className={styles.dangerCard}>
                <button className={styles.logoutBtn} onClick={logout}>
                  🚪 Log Out
                </button>
                <button className={styles.deleteBtn} disabled title="Contact support to delete your account">
                  🗑️ Delete Account
                </button>
              </div>
            </aside>

            {/* Main form */}
            <div className={styles.main}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                <p className={styles.sectionSub}>Update your name and bio. Your email cannot be changed.</p>

                {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
                {saved  && <div className={styles.successBanner}>✅ Profile saved!</div>}

                <form onSubmit={handleSave} className={styles.form} noValidate>
                  <div className={styles.field}>
                    <label htmlFor="name">Display Name</label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      maxLength={80}
                      placeholder="Your name"
                      disabled={saving}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={user.email} disabled />
                    <span className={styles.fieldHint}>Email changes are not supported yet.</span>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="bio">
                      Bio
                      <span className={styles.charCount}>{form.bio.length}/300</span>
                    </label>
                    <textarea
                      id="bio"
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      maxLength={300}
                      rows={3}
                      placeholder="Tell people what you shop for…"
                      disabled={saving}
                    />
                  </div>
                  <div className={styles.formFooter}>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                      {saving ? <span className={styles.spinner} /> : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security section */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Security</h2>
                <p className={styles.sectionSub}>Password management and security settings.</p>
                <div className={styles.securityRow}>
                  <div>
                    <strong>Password</strong>
                    <p>Last changed: Never</p>
                  </div>
                  <button className={styles.changePassBtn} disabled title="Coming soon">
                    Change Password
                  </button>
                </div>
                <div className={styles.securityRow}>
                  <div>
                    <strong>Two-Factor Authentication</strong>
                    <p>Add an extra layer of security</p>
                  </div>
                  <span className={styles.comingSoonBadge}>Coming soon</span>
                </div>
              </div>

              {/* GDPR */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Your Data</h2>
                <p className={styles.sectionSub}>
                  DrawNBuy stores your account data in Sweden and complies with GDPR.
                  You can request a copy or deletion of your data at any time.
                </p>
                <div className={styles.gdprButtons}>
                  <a href="mailto:privacy@drawnbuy.com?subject=Data Export Request" className={styles.gdprBtn}>
                    📦 Export My Data
                  </a>
                  <a href="mailto:privacy@drawnbuy.com?subject=Account Deletion Request" className={styles.gdprBtnDanger}>
                    🗑️ Delete My Data
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
