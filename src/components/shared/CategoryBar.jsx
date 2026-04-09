import { useRef } from 'react';
import { CATS } from '../../data';
import { useUIStore } from '../../store';
import styles from './CategoryBar.module.css';

export default function CategoryBar() {
  const { activeCategory, setActiveCategory } = useUIStore();
  const barRef = useRef(null);

  const allCats = [{ name: 'All', emoji: '🌟' }, ...CATS];

  return (
    <div className={styles.bar} role="navigation" aria-label="Category filter">
      <div ref={barRef} className={styles.chips}>
        {allCats.map(cat => (
          <button
            key={cat.name}
            className={`${styles.chip} ${activeCategory === cat.name || (cat.name === 'All' && !activeCategory) ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat.name === 'All' ? null : cat.name)}
            aria-pressed={activeCategory === cat.name}
          >
            <span className={styles.chipEmoji}>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
