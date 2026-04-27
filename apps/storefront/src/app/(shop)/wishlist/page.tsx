'use client';

import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist';
import { getImageUrl } from '@/lib/api';

const INTER = "'Inter', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

// Heart Icon
function HeartIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="#ec4899" stroke="#ec4899" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Trash Icon
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, totalItems } = useWishlist();

  if (totalItems === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <HeartIcon />
          </div>
          <h1 style={{ fontFamily: PLAYFAIR, fontSize: '1.75rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>
            Votre liste de favoris est vide
          </h1>
          <p style={{ fontFamily: INTER, fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Explorez nos produits et ajoutez vos articles préférés à votre liste de favoris.
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#000',
              color: '#fff',
              padding: '0.875rem 2rem',
              borderRadius: '9999px',
              fontFamily: INTER,
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#333';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Explorer les produits →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* ── Mobile-specific styles ── */}
      <style>{`
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .wishlist-card-info {
          padding: 1rem 1.25rem;
        }

        .wishlist-card-brand {
          font-size: 0.7rem;
        }

        .wishlist-card-name {
          font-size: 0.95rem;
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .wishlist-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .wishlist-price-current {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .wishlist-price-original {
          font-size: 0.8rem;
        }

        .wishlist-card-btn {
          display: block;
          margin-top: 1rem;
          background: #000;
          color: #fff;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          text-align: center;
          font-family: ${INTER};
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .wishlist-card-btn:hover {
          background: #333;
        }

        .wishlist-remove-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          z-index: 10;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          color: #ef4444;
        }

        .wishlist-remove-btn:hover {
          background: #fef2f2;
          transform: scale(1.1);
        }

        /* ─── Tablets & large phones (481px – 768px): 2 columns, tighter ─── */
        @media (max-width: 768px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.6rem;
          }

          .wishlist-card-info {
            padding: 0.6rem 0.7rem 0.75rem;
          }

          .wishlist-card-brand {
            font-size: 0.6rem;
          }

          .wishlist-card-name {
            font-size: 0.78rem;
            margin-top: 0.15rem;
            margin-bottom: 0.4rem;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .wishlist-price-row {
            gap: 0.25rem;
            flex-wrap: nowrap;
            white-space: nowrap;
          }

          .wishlist-price-current {
            font-size: 0.78rem;
          }

          .wishlist-price-original {
            font-size: 0.58rem;
          }

          .wishlist-card-btn {
            margin-top: 0.6rem;
            padding: 0.5rem 0.5rem;
            font-size: 0.7rem;
            border-radius: 0.4rem;
            letter-spacing: 0.02em;
          }

          .wishlist-remove-btn {
            width: 28px;
            height: 28px;
            top: 0.5rem;
            right: 0.5rem;
          }

          .wishlist-remove-btn svg {
            width: 13px;
            height: 13px;
          }
        }

        /* ─── Small phones (≤480px): single column, spacious cards ─── */
        @media (max-width: 480px) {
          .wishlist-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .wishlist-card-info {
            padding: 0.85rem 1rem;
          }

          .wishlist-card-brand {
            font-size: 0.65rem;
          }

          .wishlist-card-name {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            -webkit-line-clamp: unset;
          }

          .wishlist-price-row {
            gap: 0.4rem;
          }

          .wishlist-price-current {
            font-size: 1rem;
          }

          .wishlist-price-original {
            font-size: 0.72rem;
          }

          .wishlist-card-btn {
            margin-top: 0.75rem;
            padding: 0.65rem 1rem;
            font-size: 0.78rem;
            border-radius: 0.5rem;
          }

          .wishlist-remove-btn {
            width: 32px;
            height: 32px;
            top: 0.65rem;
            right: 0.65rem;
          }

          .wishlist-remove-btn svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: PLAYFAIR, fontSize: '2rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
          Mes favoris ({totalItems})
        </h1>
        <p style={{ fontFamily: INTER, fontSize: '0.9rem', color: '#6b7280' }}>
          Retrouvez tous vos articles préférés en un seul endroit.
        </p>
      </div>

      {/* Clear All Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button
          onClick={clearWishlist}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontFamily: INTER,
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <TrashIcon />
          Vider la liste
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="wishlist-grid">
        {items.map((item) => (
          <div
            key={item.productId}
            style={{
              background: 'white',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
            }}
          >
            {/* Remove Button */}
            <button
              className="wishlist-remove-btn"
              onClick={() => removeItem(item.productId)}
              title="Retirer des favoris"
            >
              <TrashIcon />
            </button>

            {/* Product Image — fixed 1:1 aspect ratio */}
            <Link href={`/products/${item.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ position: 'relative', aspectRatio: '1 / 1', background: '#f8fafc', overflow: 'hidden' }}>
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    width={400} height={400}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: INTER, fontSize: '0.85rem' }}>
                    No Image
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div className="wishlist-card-info">
              {item.brand && (
                <span className="wishlist-card-brand" style={{ fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  {item.brand}
                </span>
              )}
              <Link href={`/products/${item.slug}`} style={{ textDecoration: 'none' }}>
                <h2 className="wishlist-card-name" style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                  {item.name}
                </h2>
              </Link>
              <div className="wishlist-price-row">
                <span className="wishlist-price-current" style={{ color: item.originalPrice ? '#ef4444' : '#0f172a', whiteSpace: 'nowrap' }}>
                  {Number(item.originalPrice || item.price).toLocaleString('en-US')} MAD
                </span>
                {item.originalPrice && (
                  <span className="wishlist-price-original" style={{ color: '#94a3b8', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                    {Number(item.price).toLocaleString('en-US')} MAD
                  </span>
                )}
              </div>

              {/* View Product Button */}
              <Link
                href={`/products/${item.slug}`}
                className="wishlist-card-btn"
              >
                Voir le produit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
