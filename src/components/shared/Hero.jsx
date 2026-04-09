import { useState, useEffect } from 'react';
import { HERO_ADS } from '../../data';
import { validateAffiliateUrl } from '../../utils/security';
import { useUIStore } from '../../store';
import styles from './Hero.module.css';

export default function Hero() {
  const { setShareModalOpen } = useUIStore();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFeaturedIndex(i => (i + 1) % HERO_ADS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className={styles.hero} id="hero">
      {/* Animated orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.orb3} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Left: CTA */}
        <div className={styles.content}>
          <div className={styles.badge}>
            🌍 World's First Social Shopping Canvas
          </div>
          <h1 className={styles.heading}>
            Draw it.<br />
            <span className={styles.accentGold}>Find it.</span><br />
            <span className={styles.accentCyan}>Buy it.</span>
          </h1>
          <p className={styles.subheading}>
            Sketch your wishlist on a real-time collaborative canvas, drag real products onto it,
            and shop with friends — all in one place.
          </p>
          <div className={styles.ctaRow}>
            <button
              className={styles.ctaPrimary}
              onClick={() => document.getElementById('canvas')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🎨 Start Drawing Free
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => setShareModalOpen(true)}
            >
              👥 Invite Friends
            </button>
          </div>
          <div className={styles.stats}>
            <Stat value="10K+" label="Active Canvases" />
            <Stat value="500K+" label="Products" />
            <Stat value="50K+" label="Happy Shoppers" />
          </div>
        </div>

        {/* Right: Product Grid */}
        <div className={styles.productGrid}>
          {HERO_ADS.slice(0, 10).map((p, i) => (
            <ProductCard key={i} product={p} featured={i === featuredIndex % 10} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function ProductCard({ product, featured }) {
  const handleClick = () => {
    if (validateAffiliateUrl(product.url)) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      className={`${styles.productCard} ${featured ? styles.featured : ''}`}
      onClick={handleClick}
      aria-label={`${product.name} — ${product.price}`}
    >
      <div className={styles.productEmoji}>{product.emoji}</div>
      <div className={styles.productBadge}>{product.badge}</div>
      <div className={styles.productName}>{product.name}</div>
      <div className={styles.productPrice}>{product.price}</div>
    </button>
  );
}
