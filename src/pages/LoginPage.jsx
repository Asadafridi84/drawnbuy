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
        <Link to="/" className={styles.logo}>🎨 DrawNBuy</Link>
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
