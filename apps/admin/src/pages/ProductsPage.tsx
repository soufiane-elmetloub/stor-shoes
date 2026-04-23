import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi, getImageUrl } from '../services/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const navigate = useNavigate();
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
        isActive: true
      });
      setProducts(data.data);
      setTotalPages(data.totalPages);
    } catch { toast.error('فشل تحميل المنتجات'); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try { const { data } = await categoriesApi.getAll(); setCategories(data); } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    try { await productsApi.delete(id); toast.success('تم حذف المنتج'); loadProducts(); }
    catch { toast.error('فشل حذف المنتج'); }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="page-header">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#000' }}>📦 إدارة المنتجات</h2>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}><Plus size={18} /> إضافة منتج</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="بحث عن منتج..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: '150px' }} value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}>
          <option value="">كل التصنيفات</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>التصنيف</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="loading-spinner"><div className="spinner" /></div></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>لا توجد منتجات</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {p.images?.[0] && <img src={getImageUrl(p.images[0].url)} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand || '-'}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge" style={{ background: '#f1f5f9' }}>{p.category?.nameAr || p.category?.name}</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{Number(p.salePrice || p.price).toLocaleString()} MAD</div>
                  {p.salePrice && <div style={{ fontSize: '0.7rem', color: '#94a3b8', textDecoration: 'line-through' }}>{Number(p.price).toLocaleString()} MAD</div>}
                </td>
                <td>
                  {(() => { const total = p.variants?.reduce((s: number, v: any) => s + v.stock, 0) || 0; return (
                    <span style={{ color: total <= 3 ? '#ef4444' : total <= 10 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{total}</span>
                  ); })()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {p.isActive ? <span className="badge badge-delivered">نشط</span> : <span className="badge badge-cancelled">معطل</span>}
                    {p.isFeatured && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>⭐ مميز</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} onClick={() => navigate(`/products/edit/${p.id}`)}><Edit size={16} /></button>
                    <button className="btn" style={{ padding: '0.4rem 0.6rem', background: '#fee2e2', color: '#ef4444' }} onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
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
