import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATS } from '../../data';
import { sanitizeInput } from '../../utils/security';
import styles from './CategoriesGrid.module.css';

export default function CategoriesGrid() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const filtered = CATS.filter(c =>
    c.name.toLowerCase().includes(sanitizeInput(search).toLowerCase())
  );

  return (
    <section className={styles.section} id="categories">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>🗂️ Browse Categories</h2>
          <p className={styles.subtitle}>Explore {CATS.length} product categories</p>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="search"
              placeholder="Search categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.search}
              aria-label="Search categories"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>No categories found for "{search}"</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`${styles.catCard} ${active === cat.name ? styles.activeCard : ''}`}
                onClick={() => setActive(active === cat.name ? null : cat.name)}
                style={{ animationDelay: `${i * 0.02}s` }}
              >
                <span className={styles.catEmoji}>{cat.emoji}</span>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
