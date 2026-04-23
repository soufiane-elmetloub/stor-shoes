import { useState, useEffect } from 'react';

import { productsApi, categoriesApi, getImageUrl } from '../services/api';
import { Search, RefreshCw, ArchiveRestore, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ArchivePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadProducts(); loadCategories(); }, [page, search, selectedCategory]);

  const loadProducts = async () => {
    try {
      const { data } = await productsApi.getAll({ 
        page, 
        limit: 10, 
        search: search || undefined, 
        categoryId: selectedCategory || undefined,
        isActive: false // Explicitly only fetch deleted/inactive products
      });
      setProducts(data.data);
      setTotalPages(data.totalPages);
    } catch { toast.error('فشل تحميل أرشيف المنتجات'); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try { const { data } = await categoriesApi.getAll(); setCategories(data); } catch {}
  };

  const handleRestore = async (id: string) => {
    if (!confirm('هل تريد استعادة هذا المنتج ليكون نشطاً مرة أخرى؟')) return;
    try { 
      await productsApi.update(id, { isActive: true }); 
      toast.success('تمت استعادة المنتج بنجاح'); 
      loadProducts(); 
    }
    catch { toast.error('فشل استعادة المنتج'); }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف النهائي؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      await productsApi.deletePermanent(id);
      toast.success('تم حذف المنتج نهائياً');
      loadProducts();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'فشل الحذف النهائي';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArchiveRestore size={32} color="#64748b" />
          أرشيف المنتجات
        </h2>
        <p style={{ color: '#64748b', margin: 0, marginTop: '0.5rem' }}>
          هنا تظهر المنتجات التي تم حذفها، يمكنك استعادتها أو حذفها نهائياً.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="بحث في الأرشيف..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: '150px' }} value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}>
          <option value="">كل التصنيفات</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="data-table-wrapper" style={{ opacity: 0.9 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>التصنيف</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className="loading-spinner"><div className="spinner" /></div></td></tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  <ArchiveRestore size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
                  الأرشيف فارغ
                </td>
              </tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {p.images?.[0] ? (
                      <img src={getImageUrl(p.images[0].url)} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', filter: 'grayscale(100%)' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f1f5f9' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand || '-'}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge" style={{ background: '#f1f5f9' }}>{p.category?.nameAr || p.category?.name}</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{Number(p.salePrice || p.price).toLocaleString()} MAD</div>
                </td>
                <td>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>محذوف / معطل</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }} onClick={() => handleRestore(p.id)}>
                      <RefreshCw size={16} /> استعادة
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.8rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                      onClick={() => handlePermanentDelete(p.id)}
                    >
                      <Trash2 size={16} /> حذف نهائي
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
