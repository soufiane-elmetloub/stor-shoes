'use client';

import ProductCard from '@/components/ProductCard';

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
      {products.map((product, index) => (
        <div key={product.id} style={{ position: 'relative', height: '100%' }}>
          {/* Rank badge */}
          {index < 3 && (
            <div className="rank-badge" style={{
              background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : '#cd7f32',
            }}>
              #{index + 1}
            </div>
          )}
          
          <ProductCard product={product} />
        </div>
      ))}

      <style>{`
        .rank-badge {
          position: absolute;
          top: -10px;
          left: -10px;
          z-index: 20;
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}
