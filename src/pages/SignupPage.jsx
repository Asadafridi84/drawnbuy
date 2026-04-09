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
        <Link to="/" className={styles.logo}>🎨 DrawNBuy</Link>
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
