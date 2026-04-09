import { useCartStore, useUIStore } from '../../store';
import { validateAffiliateUrl } from '../../utils/security';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, removeItem, addItem, clearCart, isOpen, setOpen } = useCartStore();
  const { addToast } = useUIStore();

  const total = items.reduce((sum, item) => {
    const price = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    return sum + price * item.qty;
  }, 0);

  const handleCheckout = () => {
    addToast('🛡️ Secure checkout coming soon!', 'info');
  };

  const handleBuyItem = (item) => {
    if (validateAffiliateUrl(item.url)) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            🛒 Cart
            {items.length > 0 && (
              <span className={styles.count}>{items.reduce((s, i) => s + i.qty, 0)}</span>
            )}
          </h2>
          <div className={styles.headerActions}>
            {items.length > 0 && (
              <button className={styles.clearBtn} onClick={clearCart}>
                Clear all
              </button>
            )}
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close cart">
              ✕
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🛒</span>
              <p>Your cart is empty</p>
              <small>Add products from the canvas or product strips</small>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map(item => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemEmoji}>{item.emoji}</div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>{item.price}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        −
                      </button>
                      <span className={styles.qty}>{item.qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => addItem(item)}
                        aria-label={`Add another ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.buyItemBtn}
                      onClick={() => handleBuyItem(item)}
                      aria-label={`Buy ${item.name}`}
                    >
                      Buy →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Estimated total</span>
              <span className={styles.totalValue}>
                {total.toLocaleString('sv-SE')} kr
              </span>
            </div>
            <p className={styles.totalNote}>
              Final prices set by individual retailers
            </p>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              🔒 Secure Checkout
            </button>
            <button
              className={styles.shareCartBtn}
              onClick={() => {
                navigator.clipboard.writeText(
                  items.map(i => `${i.emoji} ${i.name} — ${i.price}`).join('\n')
                );
                addToast('Cart copied to clipboard! 📋', 'success');
              }}
            >
              📋 Share Cart List
            </button>
          </div>
        )}
      </div>
    </>
  );
}
