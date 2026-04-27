'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import HeroShoe from './HeroShoe';

const ArrowRightIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface HeroSettings {
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
}

const defaultHero: HeroSettings = {
  title: 'Step Into Your Best Style',
  subtitle: 'Premium sneakers, boots & formal shoes. Fast delivery, best prices.',
  buttonText: 'Shop Now →',
  image: '',
};

function getFullImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
  return url;
}

export default function DynamicHero() {
  const [hero, setHero] = useState<HeroSettings>(defaultHero);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch settings from API
    fetch(`${API_BASE_URL}/settings/site`)
      .then(res => res.json())
      .then(data => {
        console.log('[DynamicHero] API response:', data);
        if (data?.hero) {
          setHero({
            title: data.hero.title || defaultHero.title,
            subtitle: data.hero.subtitle || defaultHero.subtitle,
            buttonText: data.hero.buttonText || defaultHero.buttonText,
            image: data.hero.image || defaultHero.image,
          });
        }
      })
      .catch(err => {
        console.error('[DynamicHero] Failed to fetch settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const { title, subtitle, buttonText, image } = hero;
  const fullImageUrl = getFullImageUrl(image);

  // Check if Arabic
  const isArabic = /[\u0600-\u06FF]/.test(title);

  return (
    <section
      className="hero-section-container"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 35%, #2d2d2d 60%, #ffffff 100%)',
        color: 'white',
        padding: '5rem 1.5rem',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        clipPath: 'inset(0)',
        transform: 'translateZ(0)',
        isolation: 'isolate'
      }}
    >
        <>
          {/* Ambient Lighting - Hidden on mobile to prevent Safari Webkit overflow bleed bugs */}
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '55%',
              height: '100%',
              background:
                'radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 80%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '60%',
              height: '80%',
              background:
                'radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 50%, transparent 80%)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180,180,180,0.08) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />
        </>

      <div
        className="hero-grid"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: '3rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          textAlign: isArabic ? 'right' : 'left',
        }}
      >
        <div className="animate-fade-in-up" style={{ padding: '0 1rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              direction: isArabic ? 'rtl' : 'ltr',
            }}
          >
            {title.includes('<') ? (
              <span dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }} />
            ) : (
              title.split('\n').map((line, i) => (
                <span key={i}>
                  {i === 0 ? (
                    line
                  ) : (
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {line}
                    </span>
                  )}
                  {i === 0 && title.includes('\n') && <br />}
                </span>
              ))
            )}
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: fullImageUrl ? '#e2e8f0' : '#94a3b8',
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: 500,
              direction: isArabic ? 'rtl' : 'ltr',
            }}
          >
            {subtitle}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: isArabic ? 'flex-start' : 'flex-start' }}>
            <Link
              href="/products"
              className="shop-now-btn"
              aria-label={buttonText || "Shop Now"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '0.875rem 2rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                textDecoration: 'none',
              }}
            >
              {buttonText.replace('→', '').replace('->', '').trim()}
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <HeroShoe imageSrc={fullImageUrl} />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1.4fr 1fr !important;
            gap: 0.5rem !important;
            text-align: left !important;
          }
          .hero-grid > div:first-child {
            display: flex;
            flex-direction: column;
            align-items: flex-start !important;
            padding: 0 !important;
          }
          .hero-grid h1 {
            font-size: clamp(1.1rem, 4vw, 1.4rem) !important;
            margin-bottom: 0.5rem !important;
            max-width: 100% !important;
          }
          .hero-grid p {
            font-size: 0.7rem !important;
            margin-bottom: 0.75rem !important;
            line-height: 1.3 !important;
            max-width: 100% !important;
          }
          .shop-now-btn {
            font-size: 0.7rem !important;
            padding: 0.5rem 1rem !important;
          }
          .shop-now-btn svg {
            width: 14px !important;
            height: 14px !important;
          }
          .hero-grid > div > div {
            justify-content: flex-end !important;
          }
        }
      `}</style>
    </section>
  );
}
