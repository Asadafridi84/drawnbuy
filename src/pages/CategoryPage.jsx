import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { DRAG_PRODUCTS, CATS } from '../data';
import { validateAffiliateUrl } from '../utils/security';
import { useCartStore, useUIStore } from '../store';
import Topbar from '../components/navbar/Topbar';
import Navbar from '../components/navbar/Navbar';
import { Footer, ToastContainer } from '../components/shared/Sections';
import styles from './CategoryPage.module.css';

export default function CategoryPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();

  // Match slug to category name (url-encoded, lowercase)
  const categoryName = useMemo(() => {
    return CATS.find(c =>
      c.name.toLowerCase().replace(/\s+/g, '-') === slug?.toLowerCase()
    )?.name || null;
  }, [slug]);

  const catData = useMemo(() =>
    CATS.find(c => c.name === categoryName), [categoryName]);

  // Get products for this category, pad with similar ones to reach 16
  const products = useMemo(() => {
    if (!categoryName) return [];
    const exact = DRAG_PRODUCTS.filter(p => p.cat === categoryName);
    if (exact.length >= 16) return exact.slice(0, 16);
    // Pad with other products to reach 16
    const others = DRAG_PRODUCTS.filter(p => p.cat !== categoryName);
    return [...exact, ...others].slice(0, 16);
  }, [categoryName]);

  // Related categories
  const related = CATS.filter(c => c.name !== categoryName).slice(0, 8);

  if (!categoryName) {
    return (
      <>
        <Topbar /><Navbar />
        <div className={styles.notFound}>
          <h1>Category not found</h1>
          <p>That category doesn't exist. <Link to="/">Browse all categories →</Link></p>
        </div>
        <Footer />
      </>
    );
  }

  const handleBuy = (product) => {
    if (validateAffiliateUrl(product.url)) {
      addToast('🛡️ Opening store…', 'info');
      setTimeout(() => window.open(product.url, '_blank', 'noopener,noreferrer'), 350);
    }
  };

  const handleAdd = (product) => {
    addItem(product);
    addToast(`${product.emoji} Added to cart!`, 'success');
  };

  const handleDragStart = (e, product) => {
    e.dataTransfer.setData('application/drawnbuy-product', JSON.stringify(product));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <>
      <Topbar />
      <Navbar />
      <main className={styles.page}>
        {/* Hero banner */}
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCrumb}>
              <Link to="/">Home</Link>
              <span>›</span>
              <Link to="/#categories">Categories</Link>
              <span>›</span>
              <span>{categoryName}</span>
            </div>
            <div className={styles.heroContent}>
              <span className={styles.heroEmoji}>{catData?.emoji}</span>
              <div>
                <h1 className={styles.heroTitle}>{categoryName}</h1>
                <p className={styles.heroSub}>
                  {products.length} products · Drag any item to your canvas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.container}>
          {/* Product grid */}
          <section className={styles.productsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {catData?.emoji} {categoryName} Products
              </h2>
              <button
                className={styles.canvasBtn}
                onClick={() => { navigate('/'); setTimeout(() => document.getElementById('canvas')?.scrollIntoView({ behavior: 'smooth' }), 200); }}
              >
                🎨 Open Canvas
              </button>
            </div>

            <div className={styles.grid}>
              {products.map((product, i) => (
                <div
                  key={`${product.id}-${i}`}
                  className={styles.card}
                  draggable
                  onDragStart={e => handleDragStart(e, product)}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className={styles.cardBadge}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                  </div>
                  <div className={styles.cardEmoji}>{product.emoji}</div>
                  <h3 className={styles.cardName}>{product.name}</h3>
                  <p className={styles.cardPrice}>{product.price}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.addBtn}
                      onClick={() => handleAdd(product)}
                    >
                      🛒 Add
                    </button>
                    <button
                      className={styles.buyBtn}
                      onClick={() => handleBuy(product)}
                    >
                      Buy →
                    </button>
                  </div>
                  <div className={styles.dragHint}>⠿ drag to canvas</div>
                </div>
              ))}
            </div>
          </section>

          {/* Related categories */}
          <section className={styles.relatedSection}>
            <h2 className={styles.sectionTitle}>Browse Other Categories</h2>
            <div className={styles.relatedGrid}>
              {related.map(cat => (
                <Link
                  key={cat.name}
                  to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={styles.relatedCard}
                >
                  <span className={styles.relatedEmoji}>{cat.emoji}</span>
                  <span className={styles.relatedName}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <Footer />
        <ToastContainer />
      </main>
    </>
  );
}
