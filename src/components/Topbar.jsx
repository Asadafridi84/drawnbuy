import { useState, useEffect } from 'react';
import { COUNTRIES } from '../data';

const GEO_DATA = {
  SE: { tag:"Sweden's #1 Social Shopping Canvas",    currency:'SEK', threshold:'500 SEK',  langs:'EN / SV' },
  NO: { tag:"Norway's #1 Social Shopping Canvas",    currency:'NOK', threshold:'500 NOK',  langs:'EN / NO' },
  DK: { tag:"Denmark's #1 Social Shopping Canvas",   currency:'DKK', threshold:'200 DKK',  langs:'EN / DA' },
  FI: { tag:"Finland's #1 Social Shopping Canvas",   currency:'EUR', threshold:'40',      langs:'EN / FI' },
  DE: { tag:"Germany's #1 Social Shopping Canvas",   currency:'EUR', threshold:'40',      langs:'EN / DE' },
  FR: { tag:"France's #1 Social Shopping Canvas",    currency:'EUR', threshold:'40',      langs:'EN / FR' },
  ES: { tag:"Spain's #1 Social Shopping Canvas",     currency:'EUR', threshold:'40',      langs:'EN / ES' },
  IT: { tag:"Italy's #1 Social Shopping Canvas",     currency:'EUR', threshold:'40',      langs:'EN / IT' },
  NL: { tag:"Netherlands #1 Social Shopping Canvas", currency:'EUR', threshold:'40',      langs:'EN / NL' },
  GB: { tag:"UK's #1 Social Shopping Canvas",        currency:'GBP', threshold:'£30',      langs:'EN' },
  US: { tag:"America's #1 Social Shopping Canvas",   currency:'USD', threshold:'',      langs:'EN' },
  AU: { tag:"Australia's #1 Social Shopping Canvas", currency:'AUD', threshold:'A',     langs:'EN' },
  CA: { tag:"Canada's #1 Social Shopping Canvas",    currency:'CAD', threshold:'C',     langs:'EN / FR' },
  IN: { tag:"India's #1 Social Shopping Canvas",     currency:'INR', threshold:'₹2000',    langs:'EN / HI' },
  BR: { tag:"Brazil's #1 Social Shopping Canvas",    currency:'BRL', threshold:'R',    langs:'EN / PT' },
  JP: { tag:"Japan's #1 Social Shopping Canvas",     currency:'JPY', threshold:'¥5000',    langs:'EN / JA' },
  PL: { tag:"Poland's #1 Social Shopping Canvas",    currency:'PLN', threshold:'150 PLN',  langs:'EN / PL' },
};

const LANG_MAP = {SV:'SE',EN:'GB',DE:'DE',FR:'FR',ES:'ES',IT:'IT',NL:'NL',NO:'NO',DA:'DK',FI:'FI',PT:'BR',HI:'IN',AR:'AE',PL:'PL',JA:'JP'};

export default function Topbar() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [geo, setGeo] = useState(GEO_DATA['SE']);

  useEffect(() => {
    const lang = (navigator.language || 'sv').toUpperCase().split('-')[0];
    const code = LANG_MAP[lang] || 'SE';
    const detected = COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
    setCountry(detected);
    setGeo(GEO_DATA[code] || GEO_DATA['SE']);
  }, []);

  const handleCountryChange = (code) => {
    const c = COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
    setCountry(c);
    setGeo(GEO_DATA[code] || GEO_DATA['SE']);
  };

  return (
    <div className="topbar" style={{
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
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>{country.flag} {geo.tag}</span>
        <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
        <span>🔒 Secure &amp; trusted</span>
        <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
        <span><span className="live-dot"></span>🚚 Free delivery over {geo.threshold}</span>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color:'rgba(255,255,255,.4)', fontSize:'10px' }}>{geo.langs}</span>
        <span style={{ color:'rgba(255,255,255,.3)' }}>|</span>
        <select
          className="country-sel"
          value={country.code}
          onChange={e => handleCountryChange(e.target.value)}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
        <span className="currency-badge">💱 {geo.currency}</span>
        <span style={{ color:'rgba(255,255,255,.3)' }}>|</span>
        <a className="tb-link">Track Order</a>
        <a className="tb-link">Blog</a>
        <a className="tb-link">Sell on DrawNBuy</a>
        <a className="tb-link" href="mailto:hello@drawnbuy.com" style={{color:'rgba(255,255,255,.4)',fontSize:'10px'}}>📧 hello@drawnbuy.com</a>
      </div>
    </div>
  );
}
