'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  price: number;
  salePrice?: number;
  images: { url: string; alt?: string }[];
  variants: { stock: number }[];
}

export default function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="product-grid-container">
      {products.map((product, index) => {
        const hasDiscount = product.salePrice && product.salePrice < product.price;
        const discountPercent = hasDiscount ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100) : 0;
        const displayPrice = product.salePrice || product.price;

        return (
          <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <div className="bestseller-card">
              {/* Rank badge */}
              {index < 3 && (
                <div className="rank-badge" style={{
                  background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : '#cd7f32',
                }}>
                  #{index + 1}
                </div>
              )}

              {/* Image */}
              <div className="bestseller-img-wrap" style={{ position: 'relative', aspectRatio: '1/1' }}>
                {product.images?.[0] && (
                  <Image
                    src={getImageUrl(product.images[0].url)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                    loading="lazy"
                  />
                )}
                {hasDiscount && (
                  <span className="discount-tag">Promotion</span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 sm:p-5 bg-white relative flex flex-col flex-grow">
                {product.brand && (
                  <span className="text-[0.6rem] font-[500] sm:text-[0.65rem] sm:font-[600] text-blue-500 uppercase tracking-widest block mb-[0.35rem] whitespace-nowrap overflow-hidden text-ellipsis">{product.brand}</span>
                )}
                <h3 className="text-[0.85rem] sm:text-[0.95rem] font-[600] text-slate-900 leading-[1.4] mb-4 sm:mb-3"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.name}
                </h3>
                <div className="flex flex-nowrap items-baseline gap-1 sm:gap-2 mt-auto overflow-hidden">
                  <span className={`text-[0.75rem] sm:text-[1.05rem] font-[800] whitespace-nowrap ${hasDiscount ? 'text-red-500' : 'text-slate-900'}`}>
                    {Number(displayPrice).toLocaleString('en-US')}&nbsp;MAD
                  </span>
                  {hasDiscount && (
                    <span className="text-[0.6rem] sm:text-[0.75rem] text-slate-400 line-through whitespace-nowrap text-ellipsis overflow-hidden">
                      {Number(product.price).toLocaleString('en-US')}&nbsp;MAD
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      <style>{`
        .bestseller-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .bestseller-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
        }
        .bestseller-card:hover .bestseller-img {
          transform: scale(1.08);
        }
        .rank-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 2;
          color: white;
          font-weight: 800;
          font-size: 0.75rem;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .bestseller-img-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          overflow: hidden;
        }
        .bestseller-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .discount-tag {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #ef4444;
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
