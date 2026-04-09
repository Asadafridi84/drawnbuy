import { useState, useEffect } from 'react';
import { ADS } from '../../data';
import { validateAffiliateUrl } from '../../utils/security';
import styles from './AdStrip.module.css';

export default function AdStrip() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % ADS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const ad = ADS[current];

  const handleClick = () => {
    if (validateAffiliateUrl(ad.url)) {
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={styles.strip}
      style={{ background: ad.bg, color: ad.color }}
      role="banner"
      aria-label="Promotional offer"
    >
      <div className={styles.ticker}>
        {ADS.map((a, i) => (
          <button
            key={i}
            className={`${styles.ad} ${i === current ? styles.active : ''}`}
            onClick={handleClick}
            style={{ color: ad.color }}
          >
            {a.text}
          </button>
        ))}
      </div>
      <div className={styles.dots}>
        {ADS.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Ad ${i + 1}`}
            style={{ background: i === current ? ad.color : 'rgba(255,255,255,0.4)' }}
          />
        ))}
      </div>
    </div>
  );
}
