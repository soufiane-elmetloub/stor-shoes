import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <img src="/logoe2.jpeg" alt="StorShoes" width={100} height={44} style={{ width: 100, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#cccccc', maxWidth: 240 }}>
              Your favorite destination for trendy footwear. We offer the latest styles at the best prices with fast delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quick Links</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Shopping Cart', href: '/cart' },
                { label: 'Contact Us', href: '/contact' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ fontSize: '0.875rem', color: '#cccccc', transition: 'color 0.2s' }}
                  className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contact Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: '#cccccc' }}>
              <span>📸 @storshoes_official</span>
              <span>📞 +212 612 345 678</span>
              <span>📧 info@storshoes.com</span>
              <span>📍 Casablanca, Morocco</span>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h2 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Business Hours</h2>
            <div style={{ fontSize: '0.875rem', lineHeight: 2, color: '#cccccc' }}>
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
          <span style={{ fontSize: '0.8rem', color: '#555555' }}>
            © {new Date().getFullYear()} StorShoes. All rights reserved.
          </span>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #ffffff !important; }
      `}</style>
    </footer>
  );
}
