'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/lib/wishlist';
import { useState } from 'react';
import { getImageUrl } from '@/lib/api';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
    brand?: string;
    price: number;
    salePrice?: number;
    images: { url: string; alt?: string }[];
    variants: { stock: number }[];
    category?: { nameAr?: string; name: string };
  };
}

// Heart Icon Component
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? '#ef4444' : 'none'}
      stroke={filled ? '#ef4444' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) || 0;
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100) : 0;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    toggleItem({
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      brand: product.brand || '',
      price: product.price,
      originalPrice: product.salePrice,
      slug: product.slug,
    });
  };

  return (
    <>
    <style>{`
      .badge-responsive {
        font-size: 12px !important;
        padding: 0.3rem 0.75rem !important;
      }
      @media (max-width: 768px) {
        .badge-responsive {
          font-size: 10px !important;
          padding: 0.25rem 0.6rem !important;
        }
        .product-card-content-container {
          padding: 1rem !important; /* Increase padding on mobile */
        }
        .product-card-brand-text {
          font-size: 0.6rem !important;
          font-weight: 500 !important; /* Lighter font weight */
        }
        .product-card-title-text {
          margin-bottom: 1rem !important; /* More space before price */
        }
        .product-card-price-row {
          gap: 0.25rem !important;
          flex-wrap: nowrap !important;
          white-space: nowrap !important;
        }
        .product-card-price-current {
          font-size: 0.78rem !important;
        }
        .product-card-price-original {
          font-size: 0.58rem !important;
        }
      }
      @media (max-width: 380px) {
        .product-card-content-container {
          padding: 0.85rem !important;
        }
        .product-card-price-current {
          font-size: 0.7rem !important;
        }
        .product-card-price-original {
          font-size: 0.52rem !important;
        }
      }
    `}</style>
    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} aria-label={`View ${product.name} details`}>
      <article style={{
        background: 'white', borderRadius: '1rem', overflow: 'hidden',
        transition: 'all 0.3s ease', cursor: 'pointer',
        border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}>
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 10,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: inWishlist ? '#fef2f2' : 'rgba(255,255,255,0.9)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
          }}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={inWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon filled={inWishlist} />
        </button>

        <div style={{ position: 'relative', aspectRatio: '1/1', background: '#f8fafc', overflow: 'hidden' }}>
          {product.images?.[0] && (
            <Image
              src={getImageUrl(product.images[0].url)}
              alt={product.images[0].alt || `${product.name} - ${product.brand || 'Product'}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
              decoding="async"
              unoptimized
            />
          )}
          <ul aria-label="Product badges" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0, zIndex: 5 }}>
            {totalStock === 0 ? (
              <li style={{ background: '#111827', color: 'white', borderRadius: '9999px', fontWeight: 700 }} className="badge-responsive">
                Épuisé
              </li>
            ) : hasDiscount ? (
              <li style={{ background: '#ef4444', color: 'white', borderRadius: '9999px', fontWeight: 700 }} className="badge-responsive">
                Promotion
              </li>
            ) : null}
          </ul>
        </div>
        <div className="product-card-content-container" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {product.brand && (
            <span aria-label={`Brand: ${product.brand}`} className="product-card-brand-text" style={{ fontSize: '0.65rem', fontWeight: 600, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.brand}</span>
          )}
          <h3 aria-label={`Product name: ${product.name}`} className="product-card-title-text" style={{ 
            fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: '0 0 0.75rem 0', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {product.name}
          </h3>
          <div role="group" aria-label={`Price: ${Number(displayPrice).toLocaleString('en-US')} Moroccan Dirhams`} className="product-card-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', flexWrap: 'nowrap' }}>
            <span aria-label={`Current price ${Number(displayPrice).toLocaleString('en-US')} MAD`} className="product-card-price-current" style={{ fontSize: '1.15rem', fontWeight: 800, color: hasDiscount ? '#ef4444' : '#0f172a', whiteSpace: 'nowrap' }}>
              {Number(displayPrice).toLocaleString('en-US')} MAD
            </span>
            {hasDiscount && (
              <span aria-label={`Original price ${Number(product.price).toLocaleString('en-US')} MAD`} className="product-card-price-original" style={{ fontSize: '0.8rem', color: '#475569', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                {Number(product.price).toLocaleString('en-US')} MAD
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
    </>
  );
}
