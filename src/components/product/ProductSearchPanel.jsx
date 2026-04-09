import { useState, useMemo, useRef } from 'react';
import { DRAG_PRODUCTS, CATS } from '../../data';
import { sanitizeInput, validateAffiliateUrl } from '../../utils/security';
import { useCartStore, useUIStore } from '../../store';
import styles from './ProductSearchPanel.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: '⭐ Featured' },
  { value: 'price-asc', label: '💸 Price: Low → High' },
  { value: 'price-desc', label: '💰 Price: High → Low' },
  { value: 'name', label: '🔤 Name A–Z' },
];

function parsePrice(str) {
  return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
}

export default function ProductSearchPanel() {
  const [query, setQuery]     = useState('');
  const [sort, setSort]       = useState('featured');
  const [catFilter, setCat]   = useState('All');
  const [priceMax, setPriceMax] = useState(20000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef(null);
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  const categories = ['All', ...new Set(DRAG_PRODUCTS.map(p => p.cat))];

  const results = useMemo(() => {
    const q = sanitizeInput(query).toLowerCase();
    let list = DRAG_PRODUCTS.filter(p => {
      const matchQ   = !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
      const matchCat = catFilter === 'All' || p.cat === catFilter;
      const matchPx  = parsePrice(p.price) <= priceMax;
      return matchQ && matchCat && matchPx;
    });

    switch (sort) {
      case 'price-asc':  return [...list].sort((a,b) => parsePrice(a.price) - parsePrice(b.price));
      case 'price-desc': return [...list].sort((a,b) => parsePrice(b.price) - parsePrice(a.price));
      case 'name':       return [...list].sort((a,b) => a.name.localeCompare(b.name));
      default:           return list;
    }
  }, [query, sort, catFilter, priceMax]);

  const handleBuy = (product) => {
    if (validateAffiliateUrl(product.url)) {
      addToast('🛡️ Opening secure store…', 'info');
      setTimeout(() => window.open(product.url, '_blank', 'noopener,noreferrer'), 350);
    }
  };

  const handleAdd = (product) => {
    addItem(product);
    addToast(`${product.emoji} ${product.name} added to cart!`, 'success');
  };

  return (
    <section className={styles.section} id="search">
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🔍 Product Search</h2>
            <p className={styles.subtitle}>
              {results.length} product{results.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            className={styles.filterToggle}
            onClick={() => setFiltersOpen(o => !o)}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? '✕ Filters' : '⚙️ Filters'}
          </button>
        </div>

        {/* Search bar */}
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              ref={inputRef}
              type="search"
              placeholder="Search products, brands, categories…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search products"
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>
            )}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className={styles.sortSelect} aria-label="Sort">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              <div className={styles.filterChips}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.filterChip} ${catFilter === cat ? styles.activeChip : ''}`}
                    onClick={() => setCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                Max price: <strong>{priceMax.toLocaleString('sv-SE')} kr</strong>
              </label>
              <input
                type="range"
                min={100}
                max={20000}
                step={100}
                value={priceMax}
                onChange={e => setPriceMax(+e.target.value)}
                className={styles.priceSlider}
                aria-label="Maximum price"
              />
              <div className={styles.priceRange}>
                <span>100 kr</span>
                <span>20 000 kr</span>
              </div>
            </div>
          </div>
        )}

        {/* Results grid */}
        {results.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>No products found for <strong>"{query}"</strong>
              {catFilter !== 'All' && <> in <strong>{catFilter}</strong></>}
            </p>
            <button className={styles.resetBtn} onClick={() => { setQuery(''); setCat('All'); setPriceMax(20000); }}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={() => handleBuy(product)}
                onAdd={() => handleAdd(product)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, onBuy, onAdd, index }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify(product));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.5)}s` }}
      draggable
      onDragStart={handleDragStart}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardEmoji}>{product.emoji}</span>
        <span className={styles.cardCat}>{product.cat}</span>
      </div>
      <h3 className={styles.cardName}>{product.name}</h3>
      <p className={styles.cardPrice}>{product.price}</p>
      <div className={styles.cardActions}>
        <button className={styles.addToCartBtn} onClick={onAdd} aria-label={`Add ${product.name} to cart`}>
          🛒 Add
        </button>
        <button className={styles.buyNowBtn} onClick={onBuy} aria-label={`Buy ${product.name}`}>
          Buy →
        </button>
      </div>
      <div className={styles.dragHint}>⠿ drag to canvas</div>
    </div>
  );
}
