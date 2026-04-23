'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import type { ProductCategory } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SIZES = ['36','37','38','39','40','41','42','43','44','45'];
const INTER = "'Inter', system-ui, sans-serif";

// Sophisticated Product Skeleton Component
function ProductSkeleton({ index }: { index: number }) {
  return (
    <div 
      style={{
        background: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        animationDelay: `${index * 100}ms`,
      }}
      className="skeleton-card"
    >
      {/* Image skeleton */}
      <div style={{ position: 'relative', paddingTop: '100%', background: '#f8fafc', overflow: 'hidden' }}>
        <div 
          className="shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
        {/* Discount badge placeholder */}
        <div 
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '45px',
            height: '24px',
            borderRadius: '9999px',
            background: '#fee2e2',
          }}
          className="shimmer"
        />
      </div>
      
      {/* Content skeleton */}
      <div style={{ padding: '1rem 1.25rem' }}>
        {/* Brand */}
        <div 
          style={{ 
            width: '50px', 
            height: '12px', 
            borderRadius: '4px', 
            background: '#e2e8f0',
            marginBottom: '0.5rem',
          }}
          className="shimmer"
        />
        
        {/* Product name */}
        <div 
          style={{ 
            width: '85%', 
            height: '18px', 
            borderRadius: '4px', 
            background: '#e2e8f0',
            marginBottom: '0.75rem',
          }}
          className="shimmer"
        />
        <div 
          style={{ 
            width: '60%', 
            height: '18px', 
            borderRadius: '4px', 
            background: '#e2e8f0',
            marginBottom: '0.75rem',
          }}
          className="shimmer"
        />
        
        {/* Price */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div 
            style={{ 
              width: '70px', 
              height: '22px', 
              borderRadius: '4px', 
              background: '#e2e8f0',
            }}
            className="shimmer"
          />
          <div 
            style={{ 
              width: '50px', 
              height: '16px', 
              borderRadius: '4px', 
              background: '#e2e8f0',
            }}
            className="shimmer"
          />
        </div>
      </div>
    </div>
  );
}

// Loading Header Skeleton
function FiltersSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div 
        style={{ 
          width: '100px', 
          height: '20px', 
          borderRadius: '4px', 
          background: '#e2e8f0',
        }}
        className="shimmer"
      />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            style={{ 
              width: '140px', 
              height: '40px', 
              borderRadius: '0.5rem', 
              background: '#e2e8f0',
            }}
            className="shimmer"
          />
        ))}
      </div>
    </div>
  );
}

// Page Header Skeleton
function PageHeaderSkeleton() {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div 
        style={{ 
          width: '200px', 
          height: '35px', 
          borderRadius: '4px', 
          background: '#e2e8f0',
        }}
        className="shimmer"
      />
    </div>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', categoryId: searchParams.get('category') || '', size: '', sortBy: 'createdAt', sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetch(`${API_URL}/categories`).then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { loadProducts(); }, [page, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '36', isActive: 'true' });
      if (filters.search) params.set('search', filters.search);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.size) params.set('size', filters.size);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);
      const res = await fetch(`${API_URL}/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const selectedCategoryName = categories.find((c: ProductCategory) => c.id === filters.categoryId)?.name;
  const pageTitle = selectedCategoryName || 'All Products';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
          {total} products
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select style={{ padding: '0.625rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', minWidth: 140, outline: 'none' }}
            value={filters.categoryId} onChange={(e) => { setFilters({...filters, categoryId: e.target.value}); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map((c: ProductCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select style={{ padding: '0.625rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', minWidth: 120, outline: 'none' }}
            value={filters.size} onChange={(e) => { setFilters({...filters, size: e.target.value}); setPage(1); }}>
            <option value="">All Sizes</option>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={{ padding: '0.625rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', minWidth: 150, outline: 'none' }}
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => { const [sortBy, sortOrder] = e.target.value.split('-'); setFilters({...filters, sortBy, sortOrder: sortOrder as 'asc'|'desc'}); setPage(1); }}>
            <option value="createdAt-desc">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name</option>
            <option value="viewCount-desc">Most Viewed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <>
          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .skeleton-card {
              animation: fadeInUp 0.5s ease forwards;
              opacity: 0;
            }
            .shimmer {
              background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s ease-in-out infinite;
            }
          `}</style>
          
          {/* Loading Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
          }}>
            <div 
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                border: '3px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                animation: 'spin 0.8s linear infinite',
              }} 
            />
            <span style={{ 
              fontFamily: INTER, 
              fontSize: '0.95rem', 
              color: '#64748b',
              fontWeight: 500,
            }}>
              Chargement des produits...
            </span>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>

          <PageHeaderSkeleton />
          <FiltersSkeleton />
          
          {/* Products Grid Skeleton */}
          <div className="product-grid-container">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} index={i} />
            ))}
          </div>
        </>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <p style={{ fontSize: '1.1rem' }}>No products found</p>
          <button onClick={() => { setFilters({ search: '', categoryId: '', size: '', sortBy: 'createdAt', sortOrder: 'desc' }); setPage(1); }}
            style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid-container">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {totalPages > 1 && (() => {
        const getPages = () => {
          const pages: (number | string)[] = [];
          if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
          }
          return pages;
        };

        const goTo = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

        const btnBase: React.CSSProperties = {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 40, height: 40, borderRadius: '0.5rem',
          border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
          background: 'white', color: '#334155',
        };

        const activeBtn: React.CSSProperties = {
          ...btnBase,
          background: '#000000', color: '#ffffff', border: '1px solid #000000',
        };

        const disabledBtn: React.CSSProperties = {
          ...btnBase,
          opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none',
        };

        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '3rem' }}>
            {/* Previous */}
            <button
              style={page === 1 ? disabledBtn : btnBase}
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
            >
              ←
            </button>

            {getPages().map((p, i) =>
              typeof p === 'string' ? (
                <span key={`dots-${i}`} style={{ minWidth: 40, textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', userSelect: 'none' }}>…</span>
              ) : (
                <button
                  key={p}
                  style={p === page ? activeBtn : btnBase}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              style={page === totalPages ? disabledBtn : btnBase}
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        );
      })()}
    </div>
  );
}
