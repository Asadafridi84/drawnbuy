export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: "'Space Grotesk', sans-serif", color: '#1a0a3e' }}>
      <style>{`
        .tp h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: .5rem; }
        .tp h2 { font-size: 1.1rem; font-weight: 800; margin: 1.75rem 0 .5rem; color: #7c3aed; }
        .tp p, .tp li { font-size: .95rem; line-height: 1.75; color: #374151; margin-bottom: .5rem; }
        .tp ul { padding-left: 1.5rem; margin-bottom: .75rem; }
        .tp a { color: #7c3aed; }
        .tp .meta { font-size: .8rem; color: #9ca3af; margin-bottom: 2rem; }
        .tp .badge { display: inline-block; background: #f4f0ff; border: 1px solid #ede9fe; border-radius: 6px; padding: 4px 12px; font-size: .78rem; font-weight: 700; color: #7c3aed; margin-bottom: 1.5rem; }
      `}</style>

      <div className="tp">
        <div style={{ marginBottom: '1rem' }}>
          <a href="/" style={{ color: '#7c3aed', fontSize: '.85rem', fontWeight: '700', textDecoration: 'none' }}>← Back to DrawNBuy</a>
        </div>
        <span className="badge">⚖️ Governed by Swedish Law</span>
        <h1>Terms of Service</h1>
        <p className="meta">Last updated: 28 April 2026 · Effective: 28 April 2026</p>

        <p>By accessing or using DrawNBuy ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>

        <h2>1. The Service</h2>
        <p>DrawNBuy provides a collaborative shopping canvas platform that allows users to draw, discover products, and shop together. The Service includes the website at drawnbuy.com, our web application, and any related features.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 13 years old to use the Service. If you are under 18, you must have parental consent. By using the Service, you represent that you meet these requirements.</p>

        <h2>3. User Accounts</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must provide accurate and current information when registering.</li>
          <li>You may not create accounts for others without permission.</li>
        </ul>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Upload or share illegal, harmful, or offensive content.</li>
          <li>Infringe any third-party intellectual property rights.</li>
          <li>Attempt to reverse-engineer, hack, or disrupt the Service.</li>
          <li>Scrape data or use automated tools without prior written consent.</li>
          <li>Impersonate other users or DrawNBuy staff.</li>
          <li>Use the Service for spamming or commercial solicitation without permission.</li>
        </ul>

        <h2>5. Affiliate Links and Products</h2>
        <p>DrawNBuy displays products and affiliate links from third-party retailers (Amazon, Zalando, H&M, etc.). When you click a product link and make a purchase, DrawNBuy may earn an affiliate commission at no additional cost to you. DrawNBuy is not the seller and is not responsible for product quality, pricing, availability, or retailer policies. Any purchase you make is solely between you and the retailer.</p>

        <h2>6. User Content</h2>
        <p>You retain ownership of drawings and content you create. By sharing content on DrawNBuy, you grant us a non-exclusive, royalty-free licence to display and transmit that content solely for the purpose of operating the Service. We do not claim ownership of your creations.</p>

        <h2>7. Intellectual Property</h2>
        <p>The DrawNBuy name, logo, design, and code are owned by DrawNBuy and protected by intellectual property laws. You may not use our brand assets without written permission.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses. Product prices and availability are provided by third-party retailers and may change without notice.</p>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by Swedish law, DrawNBuy shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months prior to the claim, or 100 SEK, whichever is greater.</p>

        <h2>10. Termination</h2>
        <p>We may suspend or terminate your account if you violate these Terms. You may delete your account at any time via your profile settings. Upon termination, your right to use the Service ceases immediately.</p>

        <h2>11. Governing Law and Disputes</h2>
        <p>These Terms are governed by the laws of Sweden. Any disputes shall be submitted to the Stockholm District Court (Stockholms tingsrätt) as the first instance, unless mandatory consumer protection laws in your country of residence provide otherwise.</p>

        <h2>12. Changes to Terms</h2>
        <p>We may update these Terms at any time. We will notify you of material changes at least 14 days in advance. Continued use of the Service after the effective date constitutes acceptance.</p>

        <h2>13. Contact</h2>
        <p>For questions about these Terms: <a href="mailto:legal@drawnbuy.com">legal@drawnbuy.com</a></p>
      </div>
    </div>
  );
}
