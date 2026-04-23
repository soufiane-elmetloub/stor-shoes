import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, Package, Tag, Layers, CircleDollarSign, PencilLine, ShieldCheck, ShieldOff } from 'lucide-react';
import { getImageUrl, productsApi } from '../services/api';
import toast from 'react-hot-toast';

const formatDateTime = (value?: string) => {
  if (!value) return 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'غير متوفر';
  return date.toLocaleString('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function InventoryProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await productsApi.getById(id);
        setProduct(data);
      } catch {
        toast.error('تعذر تحميل تفاصيل المنتج');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const stats = useMemo(() => {
    const variants = product?.variants || [];
    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    const outOfStock = variants.filter((v: any) => v.stock === 0).length;
    const lowStock = variants.filter((v: any) => v.stock > 0 && v.stock <= 3).length;
    return {
      variantsCount: variants.length,
      totalStock,
      outOfStock,
      lowStock,
    };
  }, [product]);

  if (loading) {
    return <div className="loading-spinner" style={{ padding: '4rem 0' }}><div className="spinner" /></div>;
  }

  if (!product) {
    return (
      <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>المنتج غير متوفر</h3>
        <p style={{ color: '#64748b', marginTop: '0.6rem' }}>قد يكون تم حذفه أو لا تملك صلاحية الوصول.</p>
        <button className="btn btn-outline" onClick={() => navigate('/inventory')}>رجوع للمخزون</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '3rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/inventory')} style={{ padding: '0.5rem' }} title="الرجوع">
            <ArrowRight size={18} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', color: '#000' }}>تفاصيل المنتج والمخزون</h2>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>صفحة مفصلة لبيانات المنتج والمقاسات والمخزون</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/products/edit/${product.id}`)}>
          <PencilLine size={16} /> تعديل المنتج
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ borderRadius: '0.9rem', overflow: 'hidden', background: '#f1f5f9', minHeight: '260px' }}>
            {product.images?.[0]?.url ? (
              <img src={getImageUrl(product.images[0].url)} alt={product.name || 'Product'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package color="#94a3b8" size={28} />
              </div>
            )}
          </div>

          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', lineHeight: 1.25 }}>{product.nameAr || product.name || 'منتج غير معروف'}</h3>
            <p style={{ margin: '0.45rem 0 0.9rem', color: '#64748b' }}>{product.category?.nameAr || product.category?.name || 'بدون تصنيف'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem' }}><CircleDollarSign size={14} style={{ verticalAlign: 'middle' }} /> السعر</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{Number(product.salePrice || product.price || 0).toLocaleString('en-US')} MAD</div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem' }}><Layers size={14} style={{ verticalAlign: 'middle' }} /> المقاسات</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{stats.variantsCount}</div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem' }}><Package size={14} style={{ verticalAlign: 'middle' }} /> إجمالي المخزون</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{stats.totalStock}</div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.3rem' }}><CalendarDays size={14} style={{ verticalAlign: 'middle' }} /> تاريخ الإضافة</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{formatDateTime(product.createdAt)}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {product.brand && <span style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#075985', padding: '0.28rem 0.65rem', borderRadius: '999px' }}><Tag size={12} style={{ verticalAlign: 'middle' }} /> {product.brand}</span>}
              <span style={{ fontSize: '0.78rem', background: product.isActive ? '#dcfce7' : '#f1f5f9', color: product.isActive ? '#166534' : '#475569', padding: '0.28rem 0.65rem', borderRadius: '999px' }}>
                {product.isActive ? <ShieldCheck size={12} style={{ verticalAlign: 'middle' }} /> : <ShieldOff size={12} style={{ verticalAlign: 'middle' }} />} {product.isActive ? 'نشط' : 'غير نشط'}
              </span>
              {product.isFeatured && (
                <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#92400e', padding: '0.28rem 0.65rem', borderRadius: '999px' }}>
                  منتج مميز
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>مقاسات المنتج والمخزون</h4>
            <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
              نفد: {stats.outOfStock} | منخفض: {stats.lowStock}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
              {(product.variants || []).map((v: any) => {
                const isLowStock = v.stock > 0 && v.stock <= 3;
                const isOutOfStock = v.stock === 0;
                return (
                  <div key={v.id} style={{ border: `1px solid ${isOutOfStock ? '#fecaca' : '#dbeafe'}`, borderRadius: '0.75rem', padding: '0.85rem', background: isOutOfStock ? '#fef2f2' : isLowStock ? '#fff7ed' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>المقاس: {v.size}</div>
                      <div style={{ fontSize: '0.75rem', color: v.isActive === false ? '#64748b' : '#16a34a' }}>
                        {v.isActive === false ? 'معطل' : 'مفعل'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#334155' }}>المخزون المتاح: <strong>{v.stock || 0}</strong></div>
                    {v.color && <div style={{ marginTop: '0.25rem', fontSize: '0.82rem', color: '#64748b' }}>اللون: {v.color}</div>}
                    {v.sku && <div style={{ marginTop: '0.25rem', fontSize: '0.76rem', color: '#94a3b8' }}>SKU: {v.sku}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
