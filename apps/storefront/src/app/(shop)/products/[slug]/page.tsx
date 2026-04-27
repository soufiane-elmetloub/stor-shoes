'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { trackProductView } from '@/components/AnalyticsTracker';
import { getImageUrl } from '@/lib/api';
import type { Product, ProductVariant, ProductImage } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (slug) {
      fetch(`${API_URL}/products/slug/${slug}`).then(r => r.json()).then(data => {
        setProduct(data);
        // Track product view for analytics
        if (data.id) {
          trackProductView(data.id);
        }
        if (data.variants?.length) {
          setSelectedSize(data.variants[0].size);
          setSelectedColor(data.variants[0].color || '');
        }
        if (data.categoryId) {
          fetch(`${API_URL}/products?categoryId=${data.categoryId}&limit=4&isActive=true`)
            .then(r => r.json()).then(res => setRelatedProducts((res.data || []).filter((p: Product) => p.id !== data.id).slice(0, 4)));
        }
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div className="skeleton" style={{ height: 500, borderRadius: '1rem' }} />
        <div><div className="skeleton" style={{ height: 30, width: '60%', marginBottom: '1rem' }} /><div className="skeleton" style={{ height: 40, width: '30%' }} /></div>
      </div>
    </div>
  );

  if (!product) return <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}><h1>Product not found</h1><Link href="/products" style={{ color: '#3b82f6' }}>Back to Products</Link></div>;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedMainImageUrl = getImageUrl(product.images?.[selectedImage]?.url || product.images?.[0]?.url || '');
  const uniqueColors = [...new Map(variants.map((v: ProductVariant) => [v.color, v])).values()] as ProductVariant[];
  const uniqueSizes = [...new Set(variants.filter((v: ProductVariant) => !selectedColor || v.color === selectedColor).map((v: ProductVariant) => v.size))] as string[];
  const selectedVariant = variants.find((v: ProductVariant) => v.size === selectedSize && (!selectedColor || v.color === selectedColor));
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedVariant.id) return;
    addItem({
      productId: product.id, variantId: selectedVariant.id,
      name: product.name, image: getImageUrl(product.images?.[0]?.url || ''),
      size: selectedSize, color: selectedColor,
      price: Number(product.salePrice || product.price), quantity,
      stock: selectedVariant.stock,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Produits', href: '/products' },
          ...(product.category?.name ? [{ label: product.category.name, href: `/products?category=${product.category?.slug || product.categoryId || ''}` }] : []),
          { label: product.name },
        ]}
      />

      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }
        .gallery-container {
          display: flex;
          gap: 0.75rem;
        }
        .thumb-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 64px;
          flex-shrink: 0;
        }
        .details-container {
          width: 100%;
          max-width: 400px;
          margin-left: 6rem;
        }
        
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .gallery-container {
            flex-direction: column-reverse;
          }
          .thumb-list {
            flex-direction: row;
            width: 100%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 0.5rem;
          }
          .thumb-list button {
            scroll-snap-align: start;
            width: 70px !important;
            height: 70px !important;
            flex-shrink: 0;
          }
          .details-container {
            margin-left: 0;
            max-width: 100%;
          }
          .product-detail-price-row {
            gap: 0.3rem !important;
            flex-wrap: nowrap !important;
            white-space: nowrap !important;
          }
          .product-detail-price-current {
            font-size: 1rem !important;
          }
          .product-detail-price-original {
            font-size: 0.68rem !important;
          }
          .product-detail-price-badge {
            font-size: 0.6rem !important;
            padding: 0.05rem 0.35rem !important;
          }
        }
        @media (max-width: 380px) {
          .product-detail-price-current {
            font-size: 0.88rem !important;
          }
          .product-detail-price-original {
            font-size: 0.6rem !important;
          }
          .product-detail-price-badge {
            font-size: 0.55rem !important;
            padding: 0.05rem 0.3rem !important;
          }
        }
      `}</style>

      <div className="product-grid">

        {/* ── Image Gallery ── */}
        <div className="gallery-container">

          {/* Vertical thumbnails */}
          {product.images?.length > 1 && (
            <div className="thumb-list">
              {product.images.map((img: ProductImage, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  aria-label={`Select product image ${i + 1}`}
                  style={{
                    width: 64, height: 64, borderRadius: '0.5rem', overflow: 'hidden',
                    cursor: 'pointer', padding: 0, background: '#f1f5f9',
                    border: selectedImage === i ? '2px solid #000000' : '2px solid transparent',
                    opacity: selectedImage === i ? 1 : 0.55,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}>
                  <Image
                    src={getImageUrl(img.url)}
                    alt={`View ${i + 1}`}
                    width={64}
                    height={64}
                    sizes="64px"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Prev / Next arrows */}
            {product.images?.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(i => (i - 1 + product.images.length) % product.images.length)}
                  aria-label="Show previous product image"
                  style={{
                    position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)',
                    zIndex: 2, width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)', border: '1px solid #e2e8f0',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 700, color: '#000', backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}>
                  ‹
                </button>
                <button onClick={() => setSelectedImage(i => (i + 1) % product.images.length)}
                  aria-label="Show next product image"
                  style={{
                    position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)',
                    zIndex: 2, width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)', border: '1px solid #e2e8f0',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 700, color: '#000', backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}>
                  ›
                </button>
              </>
            )}

            {/* Main image container */}
            <div style={{ borderRadius: '1rem', overflow: 'hidden', background: '#f8fafc', position: 'relative', paddingTop: '100%', cursor: 'zoom-in' }}>
              {selectedMainImageUrl ? (
                <Image
                  key={selectedImage}
                  src={selectedMainImageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  preload
                  decoding="async"
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', transition: 'transform 0.4s ease, opacity 0.3s ease',
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  Image indisponible
                </div>
              )}
              {/* Dot indicators */}
              {product.images?.length > 1 && (
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.35rem' }}>
                  {product.images.map((_: ProductImage, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      aria-label={`Go to image ${i + 1}`}
                      style={{
                        width: selectedImage === i ? 20 : 6, height: 6,
                        borderRadius: 9999, border: 'none', cursor: 'pointer',
                        background: selectedImage === i ? '#000000' : 'rgba(0,0,0,0.25)',
                        transition: 'all 0.3s ease', padding: 0,
                      }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="details-container">
          {product.brand && (
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#000000', margin: 0, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.2, letterSpacing: '-0.01em' }}>{product.brand}</h1>
          )}
          <p style={{ fontSize: '0.9rem', fontWeight: 400, color: '#000000', marginTop: '0.25rem', marginBottom: 0, fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.4 }}>{product.name}</p>

          <div className="product-detail-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'nowrap' }}>
            <span className="product-detail-price-current" style={{ fontSize: '1.4rem', fontWeight: 300, color: '#000000', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
              {Number(product.salePrice || product.price).toLocaleString('en-US')} MAD
            </span>
            {hasDiscount && (
              <>
                <span className="product-detail-price-original" style={{ fontSize: '0.85rem', color: '#475569', textDecoration: 'line-through', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300, whiteSpace: 'nowrap' }}>{Number(product.price).toLocaleString('en-US')} MAD</span>
                <span className="product-detail-price-badge" style={{ background: '#b91c1c', color: '#ffffff', padding: '0.1rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap' }}>
                  Promotion
                </span>
              </>
            )}
          </div>

          {uniqueColors.length > 0 && uniqueColors.some((v: ProductVariant) => v.color && v.color.trim() !== '') && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.72rem', marginBottom: '0.4rem', display: 'block', color: '#000000', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Color: <span style={{ fontWeight: 400, textTransform: 'none' }}>{selectedColor}</span>
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {uniqueColors.filter((v: ProductVariant) => v.color && v.color.trim() !== '').map((v: ProductVariant) => (
                  <button key={v.color} onClick={() => setSelectedColor(v.color || '')}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: v.colorHex || '#ccc',
                      border: selectedColor === v.color ? '2px solid #000000' : '1.5px solid #d1d5db',
                      cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease',
                      boxShadow: selectedColor === v.color ? '0 0 0 3px white, 0 0 0 5px #000000' : 'none' }} title={v.color} />
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.72rem', marginBottom: '0.4rem', display: 'block', color: '#000000', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>Size</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {uniqueSizes.map((size) => {
                const variant = variants.find((v: ProductVariant) => v.size === size && (!selectedColor || v.color === selectedColor));
                const inStock = variant && variant.stock > 0;
                const isSelected = selectedSize === size;
                return (
                  <button key={size} onClick={() => inStock && setSelectedSize(size)}
                    style={{
                      minWidth: 44, minHeight: 44, padding: '0 1rem',
                      borderRadius: '1.0rem',
                      border: isSelected ? '1.5px solid #000000' : '1px solid #000000',
                      cursor: inStock ? 'pointer' : 'not-allowed',
                      background: isSelected ? '#000000' : (!inStock ? 'linear-gradient(to top right, transparent calc(50% - 1px), #a1a1aa, transparent calc(50% + 1px))' : 'transparent'),
                      color: isSelected ? '#ffffff' : inStock ? '#000000' : '#a1a1aa',
                      fontWeight: 600, fontSize: '0.78rem',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      textDecoration: 'none',
                      position: 'relative',
                      opacity: inStock ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                    }}>
                    {size}
                  </button>
                );
              })}
            </div>
            {variants.length === 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                Ce produit n&apos;a pas encore de tailles disponibles.
              </p>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.72rem', marginBottom: '0.4rem', display: 'block', color: '#000000', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quantité</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #000000', borderRadius: '0.5rem', width: 140, overflow: 'hidden', justifyContent: 'space-between' }}>
              <button onClick={() => {
                  if (quantity > 1) setQuantity(q => q - 1);
                  setShowStockWarning(false);
                }}
                aria-label="Decrease quantity"
                style={{ flex: 1, minHeight: 44, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', system-ui, sans-serif", transition: 'background 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >−</button>
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#000000', fontFamily: "'Inter', system-ui, sans-serif", borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', lineHeight: '44px' }}>{quantity}</span>
              <button onClick={() => {
                   const stock = selectedVariant?.stock || 0;
                   if (quantity < stock) {
                       setQuantity(q => q + 1);
                       setShowStockWarning(false);
                   } else {
                       setShowStockWarning(true);
                   }
                }}
                aria-label="Increase quantity"
                style={{ flex: 1, minHeight: 44, border: 'none', background: 'transparent', cursor: (quantity >= (selectedVariant?.stock || 0)) ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 600, color: (quantity >= (selectedVariant?.stock || 0)) ? '#cbd5e1' : '#000000', fontFamily: "'Inter', system-ui, sans-serif", transition: 'background 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>
            {showStockWarning && (
              <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif', animation: 'fadeIn 0.2s ease'" }}>
                Un article seulement a été ajouté à votre panier en raison de la disponibilité.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '1rem', position: 'relative' }}>
            <button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0}
              aria-label="Ajouter au panier"
              style={{
                width: '100%', minHeight: 44, borderRadius: '0.5rem', border: '1.5px solid #000000', cursor: 'pointer',
                background: '#000000', color: '#ffffff', fontWeight: 600, fontSize: '0.75rem',
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '0.06em', textTransform: 'uppercase',
                opacity: (!selectedVariant || selectedVariant.stock === 0) ? 0.5 : 1,
                transition: 'all 0.3s ease',
              }}>
              {addedToCart ? '✓ Ajouté au panier' : 'Ajouter au panier'}
            </button>
            <button
              disabled={!selectedVariant || selectedVariant.stock === 0}
              aria-label="Achetez avec paiement à la livraison"
              onClick={() => {
                if (!selectedVariant || !selectedVariant.id) return;
                const params = new URLSearchParams({
                  productId: product.id,
                  variantId: selectedVariant.id,
                  name: product.name,
                  image: getImageUrl(product.images?.[0]?.url || ''),
                  size: selectedSize,
                  color: selectedColor || '',
                  price: String(Number(product.salePrice || product.price)),
                  quantity: String(quantity),
                });
                router.push(`/commande?${params.toString()}`);
              }}
              style={{
                width: '100%', minHeight: 44, borderRadius: '0.5rem', border: '1.5px solid #000000', cursor: 'pointer',
                background: 'transparent', color: '#000000', fontWeight: 600, fontSize: '0.75rem',
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '0.06em', textTransform: 'uppercase',
                opacity: (!selectedVariant || selectedVariant.stock === 0) ? 0.5 : 1,
                transition: 'all 0.3s ease',
              }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <Image src="/icons/shopping-cart.png" alt="" width={13} height={13} style={{ transition: 'filter 0.3s ease' }} unoptimized />
                Achetez avec paiement à la livraison
              </span>
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Related Products</h2>
          <div className="product-grid-container">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
