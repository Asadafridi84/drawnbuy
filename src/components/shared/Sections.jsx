import { useState, useEffect } from 'react';
import { SPONSORS, HOW_STEPS } from '../../data';
import { getSponsorIcon } from '../../data/sponsorIcons';
import { useUIStore } from '../../store';
import { validateAffiliateUrl } from '../../utils/security';
import styles from './Sections.module.css';

const API = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// ─── Sponsors ─────────────────────────────────────────────────────────────────
export function Sponsors() {
  const [liveIcons, setLiveIcons] = useState({});

  useEffect(() => {
    fetch(`${API}/api/icons/sponsors`)
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object') setLiveIcons(data); })
      .catch(() => {});
  }, []);

  const getIcon = (key) => liveIcons[key] || getSponsorIcon(key);

  return (
    <section className={styles.sponsors}>
      <div className={styles.inner}>
        <p className={styles.sponsorsLabel}>Trusted Partners</p>
        <div className={styles.sponsorsGrid}>
          {SPONSORS.map((s, i) => (
            <a
              key={i}
              href={validateAffiliateUrl(s.url) ? s.url : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sponsorCard}
              style={{ '--sponsor-color': s.color }}
              aria-label={s.name}
            >
              {getIcon(s.svgIcon)
                ? <span className={styles.sponsorSvg} dangerouslySetInnerHTML={{ __html: getIcon(s.svgIcon) }} />
                : <span className={styles.sponsorEmoji}>{s.emoji}</span>
              }
              <div>
                <div className={styles.sponsorName}>{s.name}</div>
                <div className={styles.sponsorTag}>{s.tagline}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
export function HowItWorks() {
  return (
    <section className={styles.how} id="how-it-works">
      <div className={styles.inner}>
        <div className={styles.howHeader}>
          <div className={styles.badge}>How It Works</div>
          <h2 className={styles.howTitle}>From Sketch to Shopping in 5 Steps</h2>
        </div>
        <div className={styles.steps}>
          {HOW_STEPS.map((step, i) => (
            <div key={i} className={styles.step}>
              {i < HOW_STEPS.length - 1 && <div className={styles.connector} aria-hidden="true" />}
              <div className={styles.stepNum}>{step.step}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
export function ShareModal() {
  const { shareModalOpen, setShareModalOpen, addToast } = useUIStore();
  if (!shareModalOpen) return null;

  const roomLink = `https://drawnbuy.com/canvas/${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const copy = () => {
    navigator.clipboard.writeText(roomLink).then(() => addToast('Link copied! 🔗', 'success'));
  };

  return (
    <div className={styles.overlay} onClick={() => setShareModalOpen(false)} role="dialog" aria-modal="true" aria-label="Share canvas">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => setShareModalOpen(false)} aria-label="Close">✕</button>
        <div className={styles.modalIcon}>🔗</div>
        <h2 className={styles.modalTitle}>Share Your Canvas</h2>
        <p className={styles.modalSub}>Invite friends to draw and shop together in real time</p>
        <div className={styles.linkBox}>
          <input readOnly value={roomLink} className={styles.linkInput} aria-label="Share link" />
          <button className={styles.copyBtn} onClick={copy}>Copy</button>
        </div>
        <div className={styles.shareButtons}>
          <button className={styles.shareBtn} style={{ background: '#1877f2' }}>📘 Facebook</button>
          <button className={styles.shareBtn} style={{ background: '#25d366' }}>📱 WhatsApp</button>
          <button className={styles.shareBtn} style={{ background: '#000' }}>🐦 X/Twitter</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type] || ''}`} onClick={() => removeToast(t.id)} role="alert">
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>🎨 DrawNBuy</span>
            <p className={styles.footerTagline}>Draw it. Find it. Buy it.</p>
            <p className={styles.footerDesc}>The world's first social shopping canvas. Collaborate, discover, and shop with friends in real time.</p>
            <div className={styles.socials}>
              {[
                { label: 'Instagram', icon: '📸', url: 'https://instagram.com' },
                { label: 'TikTok',    icon: '🎵', url: 'https://tiktok.com' },
                { label: 'YouTube',   icon: '▶️',  url: 'https://youtube.com' },
                { label: 'X',         icon: '🐦', url: 'https://twitter.com' },
                { label: 'LinkedIn',  icon: '💼', url: 'https://linkedin.com' },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>
          <div className={styles.footerLinks}>
            <FooterCol title="Company" links={['About', 'How It Works', 'Affiliate Program', 'Privacy Policy', 'Terms of Service']} />
            <FooterCol title="Explore" links={['Canvas', 'Products', 'Deals', 'Categories', 'Sponsors']} />
            <FooterCol title="Support" links={['Help Center', 'Contact Us', 'Security', 'GDPR', 'Cookies']} />
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 DrawNBuy. All rights reserved. Registered in Sweden (enskild firma).</p>
          <p className={styles.affiliate}>DrawNBuy participates in affiliate programs and may earn commissions from qualifying purchases.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div className={styles.footerCol}>
      <h4 className={styles.colTitle}>{title}</h4>
      {links.map(l => <a key={l} href="#" className={styles.colLink}>{l}</a>)}
    </div>
  );
}
