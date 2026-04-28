import { useState } from 'react';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({ necessary: true, analytics: false, marketing: false });
  const [saved, setSaved] = useState(false);

  const save = () => {
    try {
      localStorage.setItem('drawnbuy_cookie_consent', JSON.stringify({ ...preferences, savedAt: Date.now() }));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: "'Space Grotesk', sans-serif", color: '#1a0a3e' }}>
      <style>{`
        .cp h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: .5rem; }
        .cp h2 { font-size: 1.1rem; font-weight: 800; margin: 1.75rem 0 .5rem; color: #7c3aed; }
        .cp p, .cp li { font-size: .95rem; line-height: 1.75; color: #374151; margin-bottom: .5rem; }
        .cp table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: .88rem; }
        .cp th { background: #f4f0ff; color: #1a0a3e; font-weight: 800; padding: 8px 12px; text-align: left; border: 1px solid #ede9fe; }
        .cp td { padding: 8px 12px; border: 1px solid #e5e7eb; color: #374151; vertical-align: top; }
        .cp .meta { font-size: .8rem; color: #9ca3af; margin-bottom: 2rem; }
        .cp .badge { display: inline-block; background: #f4f0ff; border: 1px solid #ede9fe; border-radius: 6px; padding: 4px 12px; font-size: .78rem; font-weight: 700; color: #7c3aed; margin-bottom: 1.5rem; }
        .cp a { color: #7c3aed; }
        .pref-card { background: #f9f7ff; border: 1.5px solid #ede9fe; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: .75rem; display: flex; align-items: flex-start; gap: 1rem; }
        .toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; inset: 0; background: #d1d5db; border-radius: 24px; cursor: pointer; transition: .2s; }
        .slider::before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .2s; }
        input:checked + .slider { background: #7c3aed; }
        input:checked + .slider::before { transform: translateX(20px); }
        input:disabled + .slider { opacity: .6; cursor: default; }
      `}</style>

      <div className="cp">
        <div style={{ marginBottom: '1rem' }}>
          <a href="/" style={{ color: '#7c3aed', fontSize: '.85rem', fontWeight: '700', textDecoration: 'none' }}>← Back to DrawNBuy</a>
        </div>
        <span className="badge">🍪 Cookie Preferences</span>
        <h1>Cookie Policy</h1>
        <p className="meta">Last updated: 28 April 2026 · EU Cookie Directive & ePrivacy Directive compliant</p>

        <p>DrawNBuy uses cookies and similar technologies. This policy explains what they are, which ones we use, and how you can control them. You can update your preferences at any time using the controls below.</p>

        <h2>What Are Cookies?</h2>
        <p>Cookies are small text files stored in your browser when you visit a website. They help us remember your preferences and understand how you use our service. Some cookies are essential for the website to work; others are optional.</p>

        <h2>Cookies We Use</h2>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Type</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>drawnbuy_session</code></td>
              <td>Necessary</td>
              <td>Keeps you logged in during your session</td>
              <td>Session</td>
            </tr>
            <tr>
              <td><code>drawnbuy_auth</code></td>
              <td>Necessary</td>
              <td>Stores your authentication token (httpOnly)</td>
              <td>7 days</td>
            </tr>
            <tr>
              <td><code>drawnbuy_cookie_consent</code></td>
              <td>Necessary</td>
              <td>Remembers your cookie preferences</td>
              <td>1 year</td>
            </tr>
            <tr>
              <td><code>_drawnbuy_analytics</code></td>
              <td>Analytics</td>
              <td>Anonymised usage statistics to improve the service</td>
              <td>1 year</td>
            </tr>
          </tbody>
        </table>

        <h2>Your Preferences</h2>

        <div className="pref-card">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', marginBottom: '.2rem' }}>Strictly Necessary Cookies</div>
            <div style={{ fontSize: '.85rem', color: '#6b7280' }}>Required for the website to function. Cannot be disabled. Includes login session and security cookies.</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked disabled />
            <span className="slider" />
          </label>
        </div>

        <div className="pref-card">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', marginBottom: '.2rem' }}>Analytics Cookies</div>
            <div style={{ fontSize: '.85rem', color: '#6b7280' }}>Help us understand how visitors interact with DrawNBuy. All data is anonymised and never sold.</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={e => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="pref-card">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '800', marginBottom: '.2rem' }}>Marketing Cookies</div>
            <div style={{ fontSize: '.85rem', color: '#6b7280' }}>Enable personalised product recommendations. We do not share data with advertising networks.</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={e => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
            />
            <span className="slider" />
          </label>
        </div>

        <button
          onClick={save}
          style={{ background: saved ? '#22c55e' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '.95rem', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', transition: '.2s', marginTop: '.5rem' }}
        >{saved ? '✓ Preferences saved!' : 'Save Preferences'}</button>

        <h2>Third-Party Cookies</h2>
        <p>Affiliate product links may lead to retailer websites that set their own cookies. DrawNBuy has no control over third-party cookies. Please review the privacy policies of the respective retailers.</p>

        <h2>Managing Cookies in Your Browser</h2>
        <p>You can also control cookies directly in your browser settings. Note that disabling all cookies may break authentication and some features.</p>

        <h2>Contact</h2>
        <p>Questions about cookies: <a href="mailto:privacy@drawnbuy.com">privacy@drawnbuy.com</a></p>
      </div>
    </div>
  );
}
