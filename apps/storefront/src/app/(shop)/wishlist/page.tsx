'use client';

import Link from 'next/link';
import { useWishlist } from '@/lib/wishlist';

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
      <div className="product-grid-container">
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
              onClick={() => removeItem(item.productId)}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                zIndex: 10,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                color: '#ef4444',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Retirer des favoris"
            >
              <TrashIcon />
            </button>

            {/* Product Image */}
            <Link href={`/products/${item.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative', paddingTop: '100%', background: '#f8fafc', overflow: 'hidden' }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    width={300} height={300}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    No Image
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div style={{ padding: '1rem 1.25rem' }}>
              {item.brand && (
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.brand}
                </span>
              )}
              <Link href={`/products/${item.slug}`} style={{ textDecoration: 'none' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginTop: '0.25rem', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {item.name}
                </h2>
              </Link>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: item.originalPrice ? '#ef4444' : '#0f172a' }}>
                  {Number(item.originalPrice || item.price).toLocaleString('en-US')} MAD
                </span>
                {item.originalPrice && (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {Number(item.price).toLocaleString('en-US')} MAD
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <Link
                href={`/products/${item.slug}`}
                style={{
                  display: 'block',
                  marginTop: '1rem',
                  background: '#000',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  fontFamily: INTER,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#000';
                }}
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
