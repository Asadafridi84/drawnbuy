import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore, useCartStore } from '../../store';
import { useAuthStore } from '../../store/auth';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Canvas', href: '/#canvas' },
  { label: 'Products', href: '/#products' },
  { label: 'Deals', href: '/#deals' },
  { label: 'Categories', href: '/#categories' },
  { label: 'How It Works', href: '/#how-it-works' },
];

export default function Navbar() {
  const { mobileMenuOpen, setMobileMenuOpen, setShareModalOpen } = useUIStore();
  const { items, setOpen: setCartOpen } = useCartStore();
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : null;

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} role="navigation">
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎨</span>
          <span className={styles.logoText}>
            Draw<span className={styles.logoAccent}>N</span>Buy
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a href={link.href} className={styles.link}>{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.shareBtn}
            onClick={() => setShareModalOpen(true)}
            aria-label="Share canvas"
          >
            <ShareIcon /> Share Canvas
          </button>

          <button className={styles.cartBtn} onClick={() => setCartOpen(true)} aria-label={`Cart: ${totalItems} items`}>
            🛒
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>

          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.avatarBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <span className={styles.avatarCircle}>{initials}</span>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownUser}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={() => navigate('/profile')}>👤 My Profile</button>
                  <button className={styles.dropdownItem} onClick={() => navigate('/my-canvases')}>🎨 My Canvases</button>
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>🚪 Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>Log In</Link>
              <Link to="/signup" className={styles.signupBtn}>Sign Up Free</Link>
            </>
          )}

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className={styles.mobileDivider} />
          {user ? (
            <>
              <div className={styles.mobileUser}>👤 {user.name}</div>
              <button className={styles.mobileLoginBtn} onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLoginBtn} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className={styles.mobileSignupBtn} onClick={() => setMobileMenuOpen(false)}>Sign Up Free 🚀</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}
