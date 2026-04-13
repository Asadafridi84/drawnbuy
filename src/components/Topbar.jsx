import { useState } from 'react';
import { COUNTRIES } from '../data';

export default function Topbar() {
  const [country, setCountry] = useState(COUNTRIES[0]);

  return (
    <div style={{
      background: 'linear-gradient(90deg,#0d0520,#3b0764 40%,#0d0520)',
      padding: '7px 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: 'rgba(255,255,255,.65)',
      borderBottom: '1px solid rgba(124,58,237,.3)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes tbShimmer { 0%{left:-100%} 100%{left:200%} }
        .topbar::after {
          content:''; position:absolute; bottom:0; left:-100%; width:60%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(103,232,249,.6),transparent);
          animation:tbShimmer 4s ease-in-out infinite;
        }
        .tb-link { color:#67e8f9; text-decoration:none; font-weight:600; cursor:pointer; }
        .tb-link:hover { color:#fff; }
        .country-sel {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          color: rgba(255,255,255,.8);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          outline: none;
        }
        .currency-badge {
          background: rgba(251,191,36,.2);
          border: 1px solid rgba(251,191,36,.3);
          color: #fbbf24;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }
      `}</style>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span>🌍 {country.name}&apos;s #1 Social Shopping Canvas</span>
        <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
        <span>🔒 Secure &amp; trusted</span>
        <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
        <span>🚚 Free returns on orders over 500 kr</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select
          className="country-sel"
          value={country.code}
          onChange={e => setCountry(COUNTRIES.find(c => c.code === e.target.value))}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
        <span className="currency-badge">{country.currency}</span>
        <a className="tb-link">Help</a>
        <a className="tb-link">Track Order</a>
        <a className="tb-link">Sell on DrawNBuy</a>
      </div>
    </div>
  );
}
