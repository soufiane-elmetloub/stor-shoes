import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-container" style={{
      background: 'linear-gradient(135deg, #000000 0%, #111111 30%, #2a2a2a 65%, #f5f5f5 100%)',
      color: '#a0a0a0',
      padding: '4rem 1.5rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative radial glow */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: '45%', height: '100%',
        background: 'radial-gradient(ellipse at 90% 80%, rgba(255,255,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-wrapper" style={{ marginBottom: '1.25rem' }}>
              <img src="/logoe2.jpeg" alt="StorShoes" width={100} height={44} style={{ width: 100, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <p className="footer-text" style={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#cccccc', maxWidth: 240 }}>
              Your favorite destination for trendy footwear. We offer the latest styles at the best prices with fast delivery.
            </p>
          </div>

          {/* Quick Links & Contact Wrapper for Mobile */}
          <div className="footer-links-contact-wrapper" style={{ display: 'contents' }}>
            {/* Quick Links */}
            <div className="footer-section quick-links-section">
              <h2 className="footer-heading" style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quick Links</h2>
              <div className="footer-links-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Contact Us', href: '/contact' },
                ].map(link => (
                  <Link key={link.href} href={link.href} style={{ fontSize: '0.9rem', color: '#cccccc', transition: 'color 0.2s', padding: '0.2rem 0' }}
                    className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="footer-section contact-section">
              <h2 className="footer-heading" style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contact Us</h2>
              <div className="footer-links-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#cccccc' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📸</span> <span>@storshoes_official</span></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📞</span> <span>+212 612 345 678</span></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📧</span> <span>info@storshoes.com</span></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📍</span> <span>Fes, Morocco</span></span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="footer-section">
            <h2 className="footer-heading" style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.5rem', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Business Hours</h2>
            <div className="footer-links-wrapper" style={{ fontSize: '0.9rem', lineHeight: 2.2, color: '#cccccc' }}>
              <div>Mon – Sat: 9:00 AM – 9:00 PM</div>
              <div>Sunday: 10:00 AM – 6:00 PM</div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>
            © {new Date().getFullYear()} StorShoes. All rights reserved.
          </span>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #ffffff !important; }
        @media (max-width: 768px) {
          .footer-container {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          .footer-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 2.5rem !important;
          }
          .footer-links-contact-wrapper {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            gap: 1rem !important;
            width: 100% !important;
          }
          .quick-links-section, .contact-section {
            width: 48% !important; /* Take up half the space */
          }
          .footer-section, .footer-brand {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            width: 100%;
          }
          /* إذا كان الموقع باللغة العربية، قم بتغيير align-items إلى flex-end و text-align إلى right */
          html[dir="rtl"] .footer-section, html[dir="rtl"] .footer-brand {
            align-items: flex-start; /* flex-start with dir="rtl" aligns to right */
            text-align: right;
          }
          .footer-logo-wrapper {
            display: flex;
            justify-content: flex-start;
            width: 100%;
          }
          html[dir="rtl"] .footer-logo-wrapper {
            justify-content: flex-start; /* flex-start with dir="rtl" aligns to right */
          }
          .footer-text {
            max-width: 100% !important;
          }
          /* Adjust text size slightly for side-by-side layout on mobile */
          .quick-links-section .footer-link,
          .contact-section span {
            font-size: 0.8rem !important;
          }
          .footer-heading {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
