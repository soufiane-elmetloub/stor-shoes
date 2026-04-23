import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, getImageUrl } from '../services/api';
import { Search, AlertTriangle, Package, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PRODUCTS_PER_PAGE = 15;

export default function InventoryPage() {
  const navigate = useNavigate();
  const [inventoryByProduct, setInventoryByProduct] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [hideDisabled, setHideDisabled] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => { loadInventory(); }, [search, showLowOnly, hideDisabled]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      // Load a large batch then paginate by product on client side to keep each product matrix complete.
      const { data } = await inventoryApi.getAll({ 
        page: 1,
        limit: 1000,
        search: search || undefined, 
        lowStock: showLowOnly || undefined,
        hideDisabled: hideDisabled || undefined
      });
      
      // Group variants by Product
      const groups = data.data.reduce((acc: any, variant: any) => {
        const prodId = variant.productId || variant.product?.id || variant.id; // fallback
        if (!acc[prodId]) {
           acc[prodId] = { product: variant.product, variants: [] };
        }
        acc[prodId].variants.push(variant);
        return acc;
      }, {});
      
      const groupedProductsCount = Object.keys(groups).length;
      const computedTotalPages = Math.max(1, Math.ceil(groupedProductsCount / PRODUCTS_PER_PAGE));
      setInventoryByProduct(groups);
      setTotalPages(computedTotalPages);
      setPage((prev) => Math.min(prev, computedTotalPages));
    } catch { 
      toast.error('فشل تحميل المخزون'); 
    } finally { 
      setLoading(false); 
    }
  };

  const groupedProducts = Object.values(inventoryByProduct) as Array<{ product: any; variants: any[] }>;
  const paginatedProducts = groupedProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  return (
    <div style={{ paddingBottom: '3rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .inventory-products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }
        @media (max-width: 1400px) {
          .inventory-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 1100px) {
          .inventory-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 700px) {
          .inventory-products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#000', margin: 0 }}>
          📦 مصفوفة المقاسات والمخزون
        </h2>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
          إدارة أرصدة وأحجام منتجاتك، تفعيلها أو إيقافها بضغطة زر.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="form-input" style={{ paddingRight: '3rem', height: '48px', fontSize: '1rem', borderRadius: '12px' }} placeholder="ابحث باسم الحذاء، الماركة..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: showLowOnly ? '#fee2e2' : '#fff', padding: '0 1.25rem', height: '48px', borderRadius: '12px', border: '1px solid', borderColor: showLowOnly ? '#fecaca' : '#e2e8f0', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <AlertTriangle size={18} color={showLowOnly ? '#ef4444' : '#94a3b8'} />
          <input type="checkbox" checked={showLowOnly} onChange={(e) => { setShowLowOnly(e.target.checked); setPage(1); }} style={{ display: 'none' }} />
          <span style={{ fontWeight: 600, color: showLowOnly ? '#b91c1c' : '#475569' }}>مخزون منخفض فقط</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: hideDisabled ? '#f1f5f9' : '#fff', padding: '0 1.25rem', height: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <input type="checkbox" checked={hideDisabled} onChange={(e) => { setHideDisabled(e.target.checked); setPage(1); }} style={{ display: 'none' }} />
          <span style={{ fontWeight: 600, color: '#475569' }}>{hideDisabled ? 'إظهار المقاسات المعطلة' : 'إخفاء المقاسات المعطلة'}</span>
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="loading-spinner" style={{ padding: '4rem 0' }}><div className="spinner" /></div>
        ) : Object.keys(inventoryByProduct).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
            <Package size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#0f172a', fontWeight: 600, fontSize: '1.25rem' }}>لا توجد منتجات</h3>
            <p style={{ color: '#64748b' }}>لم يتم العثور على أي مقاسات متطابقة مع بحثك.</p>
          </div>
        ) : (
          <div className="inventory-products-grid">
            {paginatedProducts.map(({ product, variants }, index) => {
              const productId = String(product?.id || `product-${index}`);
              const totalStock = variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
              const lowStockCount = variants.filter((v: any) => v.stock > 0 && v.stock <= 3).length;

              return (
                <div
                  key={productId}
                  style={{
                    background: '#fff',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 10px rgba(15,23,42,0.05)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/inventory/${productId}`)}
                    style={{
                      width: '100%',
                      textAlign: 'right',
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: '100%', aspectRatio: '16 / 11', background: '#f1f5f9' }}>
                      {product?.images?.[0] ? (
                        <img src={getImageUrl(product.images[0].url)} alt={product.name || 'Product'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package color="#94a3b8" />
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: '0.35rem', lineHeight: 1.3 }}>
                        {product?.nameAr || product?.name || 'منتج غير معروف'}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                        {product?.category?.nameAr || product?.category?.name || 'بدون تصنيف'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                          المخزون: {totalStock}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: lowStockCount > 0 ? '#b45309' : '#475569' }}>
                          {lowStockCount > 0 ? `منخفض: ${lowStockCount}` : `${variants.length} مقاس`}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>
                        عرض التفاصيل الكاملة
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '2rem 0' }}>
          <button
            className="btn btn-outline"
            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            title="الصفحة السابقة"
          >
            <ChevronRight size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`} style={{ width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: page === i + 1 ? 700 : 500 }} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button
            className="btn btn-outline"
            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            title="الصفحة التالية"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
