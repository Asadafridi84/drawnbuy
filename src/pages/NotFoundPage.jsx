import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.canvas}>
          <span className={styles.four}>4</span>
          <span className={styles.brush}>🎨</span>
          <span className={styles.four}>4</span>
        </div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.sub}>
          Looks like this canvas doesn't exist yet. Let's get you back to drawing!
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>🏠 Go Home</Link>
          <Link to="/#canvas" className={styles.canvasBtn}>🎨 Open Canvas</Link>
        </div>
      </div>
    </div>
  );
}
