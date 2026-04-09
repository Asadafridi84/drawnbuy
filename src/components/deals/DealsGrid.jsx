import { useState, useEffect } from 'react';
import { DEALS } from '../../data';
import { validateAffiliateUrl, formatCountdown } from '../../utils/security';
import { useUIStore } from '../../store';
import styles from './DealsGrid.module.css';

export default function DealsGrid() {
  const [timers, setTimers] = useState(() => DEALS.map(d => d.timeLeft));
  const { addToast } = useUIStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(t => (t > 0 ? t - 1 : 0)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = (deal) => {
    if (validateAffiliateUrl(deal.url)) {
      addToast('🛡️ Redirecting to secure checkout…', 'info');
      setTimeout(() => window.open(deal.url, '_blank', 'noopener,noreferrer'), 400);
    }
  };

  return (
    <section className={styles.section} id="deals">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.badge}>⚡ Flash Deals</div>
          <h2 className={styles.title}>Today's Best Deals</h2>
          <p className={styles.subtitle}>Limited-time offers — grab them before they're gone!</p>
        </div>

        <div className={styles.grid}>
          {DEALS.map((deal, i) => (
            <DealCard
              key={i}
              deal={deal}
              timeLeft={timers[i]}
              onBuy={() => handleBuy(deal)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({ deal, timeLeft, onBuy, index }) {
  const isUrgent = timeLeft < 3600;
  return (
    <div
      className={`${styles.card} ${isUrgent ? styles.urgent : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={styles.badgeRow}>
        <span className={styles.dealBadge}>{deal.badge}</span>
        {isUrgent && <span className={styles.urgentBadge}>🔥 Almost Gone!</span>}
      </div>

      <div className={styles.emoji}>{deal.emoji}</div>
      <h3 className={styles.name}>{deal.name}</h3>

      <div className={styles.prices}>
        <span className={styles.original}>{deal.originalPrice}</span>
        <span className={styles.sale}>{deal.salePrice}</span>
        <span className={styles.discount}>-{deal.discount}</span>
      </div>

      <div className={styles.countdown}>
        <span className={styles.countdownLabel}>⏱️ Ends in</span>
        <span className={`${styles.countdownValue} ${isUrgent ? styles.urgent : ''}`}>
          {timeLeft > 0 ? formatCountdown(timeLeft) : 'EXPIRED'}
        </span>
      </div>

      <button className={styles.buyBtn} onClick={onBuy}>
        Buy Now — {deal.salePrice}
      </button>
    </div>
  );
}
