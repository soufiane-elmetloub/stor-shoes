'use client';

import Link from 'next/link';
import { getImageUrl } from '@/lib/api';

const CATEGORY_IMAGES: Record<string, string> = {
  sneakers: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&h=300&fit=crop&auto=format',
  formal: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&h=300&fit=crop&auto=format',
  boots: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=300&h=300&fit=crop&auto=format',
  sandals: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=300&h=300&fit=crop&auto=format',
  sports: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop&auto=format',
};

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

const normalizeImageUrl = (url?: string) => {
  if (!url) return '';
  const normalized = url.replace(/\\/g, '/').trim();
  if (normalized.startsWith('http')) return normalized;
  return getImageUrl(normalized.startsWith('/') ? normalized : `/${normalized}`);
};

export default function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <div className="cat-scroll-container">
      <div className="cat-scroll-track">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/products?category=${cat.id}`} style={{ textDecoration: 'none' }} aria-label={`View ${cat.name} category`}>
            <div className="cat-circle" style={{ position: 'relative' }}>
              <img
                src={normalizeImageUrl(cat.image) || CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.sneakers}
                alt={cat.name}
                className="cat-image"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.sneakers;
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              <div className="cat-overlay">
                <span className="cat-name">{cat.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        /* ── Desktop ── */
        .cat-scroll-container {
          width: 100%;
          /* NO overflow:hidden here — it would clip the scroll track */
          overflow: visible;
        }
        .cat-scroll-track {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .cat-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid transparent;
          background: #f1f5f9;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          flex-shrink: 0;
        }
        .cat-circle:hover {
          transform: scale(1.08);
          border-color: #e2e8f0;
          box-shadow: 0 6px 24px rgba(0,0,0,0.1);
        }
        .cat-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .cat-circle:hover .cat-image {
          transform: scale(1.12);
        }
        .cat-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%, transparent 100%);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 1.1rem;
        }
        .cat-name {
          color: white;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 6px rgba(0,0,0,0.5);
        }

        /* ── Mobile: full-bleed horizontal scroll ── */
        @media (max-width: 768px) {
          .cat-scroll-container {
            /*
             * Break out of the parent section's padding so the scroll area
             * goes edge-to-edge and items are NEVER clipped at the sides.
             * The negative margin equals the parent section's horizontal padding (1.5rem).
             */
            margin-left: -1.5rem;
            margin-right: -1.5rem;
            width: calc(100% + 3rem);

            overflow-x: auto;
            overflow-y: visible;          /* must be visible so circles aren't clipped */
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;

            /* hide scrollbar visually */
            scrollbar-width: none;        /* Firefox */
            -ms-overflow-style: none;     /* IE/Edge */
          }
          .cat-scroll-container::-webkit-scrollbar {
            display: none;                /* Chrome/Safari */
          }
          .cat-scroll-track {
            justify-content: flex-start;
            flex-wrap: nowrap;
            gap: 1rem;
            /*
             * Inline padding gives the "peek" effect on first/last items
             * without triggering any clipping on the container.
             */
            padding: 0.5rem 1.5rem 0.75rem;
          }
          .cat-circle {
            width: 100px;
            height: 100px;
            scroll-snap-align: start;
            border-width: 1.5px;
          }
          .cat-overlay {
            padding-bottom: 0.8rem;
          }
          .cat-name {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
