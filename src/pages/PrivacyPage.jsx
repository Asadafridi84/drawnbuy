export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: "'Space Grotesk', sans-serif", color: '#1a0a3e' }}>
      <style>{`
        .pp h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: .5rem; }
        .pp h2 { font-size: 1.1rem; font-weight: 800; margin: 1.75rem 0 .5rem; color: #7c3aed; }
        .pp p, .pp li { font-size: .95rem; line-height: 1.75; color: #374151; margin-bottom: .5rem; }
        .pp ul { padding-left: 1.5rem; margin-bottom: .75rem; }
        .pp a { color: #7c3aed; }
        .pp .meta { font-size: .8rem; color: #9ca3af; margin-bottom: 2rem; }
        .pp .badge { display: inline-block; background: #f4f0ff; border: 1px solid #ede9fe; border-radius: 6px; padding: 4px 12px; font-size: .78rem; font-weight: 700; color: #7c3aed; margin-bottom: 1.5rem; }
      `}</style>

      <div className="pp">
        <div style={{ marginBottom: '1rem' }}>
          <a href="/" style={{ color: '#7c3aed', fontSize: '.85rem', fontWeight: '700', textDecoration: 'none' }}>← Back to DrawNBuy</a>
        </div>
        <span className="badge">🔒 GDPR Compliant · IMY Registered</span>
        <h1>Privacy Policy</h1>
        <p className="meta">Last updated: 28 April 2026 · Effective: 28 April 2026 · Language: English</p>

        <p>DrawNBuy ("we", "us", "our") is committed to protecting your personal data in accordance with the EU General Data Protection Regulation (GDPR) and the Swedish Data Protection Act (2018:218). This policy explains what data we collect, why, and your rights.</p>

        <h2>1. Who We Are (Data Controller)</h2>
        <p>DrawNBuy is operated as an enskild firma registered in Sweden. Contact: <a href="mailto:privacy@drawnbuy.com">privacy@drawnbuy.com</a></p>

        <h2>2. Data We Collect</h2>
        <ul>
          <li><strong>Account data:</strong> Email address and display name when you create an account.</li>
          <li><strong>Canvas data:</strong> Drawings and product arrangements you save.</li>
          <li><strong>Chat messages:</strong> Text and voice messages sent in collaborative sessions (stored temporarily in-memory, not persisted to a database).</li>
          <li><strong>Usage data:</strong> Pages visited, features used, and session duration (anonymised analytics only).</li>
          <li><strong>Technical data:</strong> IP address, browser type, and device type for security and performance purposes.</li>
        </ul>

        <h2>3. Legal Basis for Processing</h2>
        <ul>
          <li><strong>Contract performance (Art. 6(1)(b) GDPR):</strong> Account creation and service delivery.</li>
          <li><strong>Legitimate interest (Art. 6(1)(f) GDPR):</strong> Security, fraud prevention, and service improvement.</li>
          <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> Non-essential cookies and marketing communications.</li>
        </ul>

        <h2>4. How We Use Your Data</h2>
        <ul>
          <li>To provide and maintain the DrawNBuy service.</li>
          <li>To enable real-time collaboration features.</li>
          <li>To send transactional emails (password reset, invite confirmations).</li>
          <li>To improve product recommendations and search results.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2>5. Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with:</p>
        <ul>
          <li><strong>Infrastructure providers:</strong> Vercel (hosting), Render (backend) — both operate under GDPR-compliant data processing agreements.</li>
          <li><strong>Analytics:</strong> Anonymised, aggregated data only.</li>
          <li><strong>Law enforcement:</strong> Only when legally required.</li>
        </ul>

        <h2>6. Affiliate Links</h2>
        <p>DrawNBuy participates in affiliate programmes (Amazon Associates and others). When you click a product link and make a purchase, we may earn a commission. Your purchase data is handled by the respective retailer under their own privacy policy. We do not receive your payment details.</p>

        <h2>7. Cookies</h2>
        <p>We use strictly necessary cookies for authentication and session management. Non-essential cookies (analytics) are only set after you give explicit consent. See our <a href="/cookies">Cookie Policy</a> for details.</p>

        <h2>8. Data Retention</h2>
        <ul>
          <li>Account data: Retained until account deletion or 3 years of inactivity.</li>
          <li>Canvas drawings: Retained until you delete them or your account.</li>
          <li>Chat messages: In-memory only; cleared when the room closes.</li>
          <li>Server logs: 30 days maximum.</li>
        </ul>

        <h2>9. Your Rights (GDPR)</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of your personal data.</li>
          <li><strong>Rectification</strong> — correct inaccurate data.</li>
          <li><strong>Erasure</strong> ("right to be forgotten") — delete your account and all associated data.</li>
          <li><strong>Restriction</strong> — limit how we process your data.</li>
          <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
          <li><strong>Object</strong> — object to processing based on legitimate interest.</li>
          <li><strong>Withdraw consent</strong> — at any time for consent-based processing.</li>
        </ul>
        <p>To exercise your rights, email <a href="mailto:privacy@drawnbuy.com">privacy@drawnbuy.com</a>. We will respond within 30 days. You may also lodge a complaint with <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">IMY (Integritetsskyddsmyndigheten)</a>.</p>

        <h2>10. Security</h2>
        <p>We implement industry-standard security measures including TLS encryption, bcrypt password hashing, CSRF protection, rate limiting, and Content Security Policy headers.</p>

        <h2>11. International Transfers</h2>
        <p>Your data is processed within the EU/EEA. Where third-party services operate outside the EEA (e.g., certain CDN nodes), we ensure adequate safeguards are in place via Standard Contractual Clauses.</p>

        <h2>12. Changes to This Policy</h2>
        <p>We will notify you of material changes via email or an in-app notice at least 14 days before the changes take effect.</p>

        <h2>13. Contact</h2>
        <p>For privacy questions: <a href="mailto:privacy@drawnbuy.com">privacy@drawnbuy.com</a></p>
        <p>Postal: DrawNBuy, Sweden (full address provided on request)</p>
      </div>
    </div>
  );
}
