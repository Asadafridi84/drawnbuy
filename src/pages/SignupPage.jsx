import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import styles from './AuthPages.module.css';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldError, setFieldError] = useState('');
  const { register, loading, error, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/'); }, [user]);
  useEffect(() => () => clearError(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');

    if (form.password.length < 8) {
      return setFieldError('Password must be at least 8 characters.');
    }
    if (form.password !== form.confirm) {
      return setFieldError('Passwords do not match.');
    }

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    if (result.success) navigate('/');
  };

  const anyError = fieldError || error;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo} style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <defs>
              <linearGradient id="ss1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
              <linearGradient id="ss2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
              <linearGradient id="ss3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f4f0ff"/><stop offset="100%" stopColor="#ede9fe"/></linearGradient>
            </defs>
            <rect x="1.5" y="2" width="21" height="15" rx="3" fill="url(#ss1)"/>
            <rect x="3" y="3.5" width="18" height="12" rx="1.8" fill="url(#ss3)"/>
            <text x="5.2" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#7c3aed">D</text>
            <text x="10.8" y="11.8" fontFamily="Georgia,serif" fontSize="5" fontWeight="400" fill="#5b21b6">n</text>
            <text x="14.8" y="11.8" fontFamily="Georgia,serif" fontSize="6.5" fontWeight="700" fill="#67e8f9">B</text>
            <rect x="6.5" y="19.5" width="11" height="3" rx="1.5" fill="url(#ss2)"/>
            <circle cx="9.5" cy="22.8" r="0.85" fill="#3b0764"/><circle cx="14.5" cy="22.8" r="0.85" fill="#3b0764"/>
          </svg>
          <span style={{fontWeight:'800',fontSize:'20px',color:'#1a0a3e'}}>DrawNBuy</span>
        </Link>
        <h1 className={styles.title}>Create your canvas</h1>
        <p className={styles.sub}>Free forever · No credit card needed</p>

        {anyError && (
          <div className={styles.errorBanner} role="alert">
            ⚠️ {anyError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              disabled={loading}
              maxLength={80}
            />
          </div>
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <p className={styles.terms}>
            By signing up you agree to our{' '}
            <Link to="/terms" className={styles.switchLink}>Terms</Link>{' '}
            and{' '}
            <Link to="/privacy" className={styles.switchLink}>Privacy Policy</Link>.
          </p>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : '🚀 Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
