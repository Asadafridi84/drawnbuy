import { useEffect } from 'react';
import { useGeoStore } from '../../store';
import { COUNTRIES } from '../../data';
import styles from './Topbar.module.css';

export default function Topbar() {
  const { country, countryData, setCountry, detectCountry } = useGeoStore();

  useEffect(() => {
    detectCountry();
  }, []);

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <span>🚀 DrawNBuy — The World's First Social Shopping Canvas</span>
      </div>
      <div className={styles.right}>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className={styles.countrySelect}
          aria-label="Select country"
        >
          {Object.entries(COUNTRIES).map(([code, data]) => (
            <option key={code} value={code}>
              {data.flag} {data.label}
            </option>
          ))}
        </select>
        <span className={styles.currency}>{countryData.currency}</span>
      </div>
    </div>
  );
}
