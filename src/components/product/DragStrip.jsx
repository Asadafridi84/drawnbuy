import { useRef, useState } from 'react';
import { DRAG_PRODUCTS } from '../../data';
import { useCartStore, useUIStore } from '../../store';
import { validateAffiliateUrl } from '../../utils/security';
import styles from './DragStrip.module.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name', label: 'Name A–Z' },
];

function parsePrice(str) {
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

function sortProducts(products, sort) {
  const sorted = [...products];
  if (sort === 'price-asc') return sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  if (sort === 'price-desc') return sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  if (sort === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

export default function DragStrip() {
  const stripRef = useRef(null);
  const [sort, setSort] = useState('default');
  const [filter, setFilter] = useState('All');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const categories = ['All', ...new Set(DRAG_PRODUCTS.map(p => p.cat))];
  const filtered = filter === 'All' ? DRAG_PRODUCTS : DRAG_PRODUCTS.filter(p => p.cat === filter);
  const products = sortProducts(filtered, sort);

  // Horizontal scroll by mouse drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, scrollLeft: stripRef.current.scrollLeft });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    stripRef.current.scrollLeft = dragStart.scrollLeft - dx;
  };
  const handleMouseUp = () => setIsDragging(false);

  const scroll = (dir) => {
    stripRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <section className={styles.section} id="products">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🛍️ Drag Products to Canvas</h2>
            <p className={styles.subtitle}>Drag any product onto your canvas to visualise it</p>
          </div>
          <div className={styles.controls}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className={styles.sortSelect}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter chips */}
        <div className={styles.chips}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.chip} ${filter === cat ? styles.activeChip : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Strip */}
        <div className={styles.stripWrap}>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
          <div
            ref={stripRef}
            className={`${styles.strip} ${isDragging ? styles.grabbing : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {products.map(product => (
              <ProductChip
                key={product.id}
                product={product}
                onAdd={() => {
                  addItem(product);
                  addToast(`${product.emoji} Added to cart!`, 'success');
                }}
              />
            ))}
          </div>
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scroll(1)} aria-label="Scroll right">›</button>
        </div>
        <p className={styles.hint}>💡 Tip: Drag any card onto the canvas above to place it</p>
      </div>
    </section>
  );
}

function ProductChip({ product, onAdd }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify(product));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    if (validateAffiliateUrl(product.url)) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={styles.chip_card}
      draggable
      onDragStart={handleDragStart}
      role="listitem"
    >
      <div className={styles.chipEmoji}>{product.emoji}</div>
      <div className={styles.chipInfo}>
        <span className={styles.chipName}>{product.name}</span>
        <span className={styles.chipCat}>{product.cat}</span>
        <span className={styles.chipPrice}>{product.price}</span>
      </div>
      <div className={styles.chipActions}>
        <button className={styles.addBtn} onClick={onAdd} title="Add to cart">🛒</button>
        <button className={styles.buyBtn} onClick={handleBuy} title="Buy now">Buy →</button>
      </div>
      <div className={styles.dragHint}>⠿ drag</div>
    </div>
  );
}
