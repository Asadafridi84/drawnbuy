import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import styles from './AuthPages.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/'); }, [user]);
  useEffect(() => () => clearError(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo} style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <defs>
              <linearGradient id="ls1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
              <linearGradient id="ls2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
              <linearGradient id="ls3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4f0ff"/><stop offset="100%" stopColor="#ede9fe"/></linearGradient>
            </defs>
            <rect x="1.5" y="2" width="21" height="15" rx="3" fill="url(#ls1)"/>
            <rect x="3" y="3.5" width="18" height="12" rx="1.8" fill="url(#ls3)"/>
            <text x="5.2" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#7c3aed">D</text>
            <text x="10.8" y="11.8" fontFamily="Georgia,serif" fontSize="5" fontWeight="400" fill="#5b21b6">n</text>
            <text x="14.8" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#67e8f9">B</text>
            <rect x="6.5" y="19.5" width="11" height="3" rx="1.5" fill="url(#ls2)"/>
            <circle cx="9.5" cy="22.8" r="0.85" fill="#3b0764"/><circle cx="14.5" cy="22.8" r="0.85" fill="#3b0764"/>
          </svg>
          <span style={{fontWeight:'800',fontSize:'20px',color:'#1a0a3e'}}>DrawNBuy</span>
        </Link>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Log in to your canvas</p>

        {error && (
          <div className={styles.errorBanner} role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">
              Password
              <a href="#" className={styles.forgot}>Forgot password?</a>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Log In'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.switchLink}>Sign up free</Link>
        </p>

        <div className={styles.divider}><span>or continue with</span></div>
        <div className={styles.socialButtons}>
          <button className={styles.socialBtn} disabled>
            <GoogleIcon /> Google
          </button>
          <button className={styles.socialBtn} disabled>
            🍎 Apple
          </button>
        </div>
        <p className={styles.comingSoon}>Social login coming soon</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return <span style={{ fontSize: 14 }}>G</span>;
}
