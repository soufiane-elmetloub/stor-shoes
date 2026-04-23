import { useState, useEffect } from 'react';
import { categoriesApi, getImageUrl } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await categoriesApi.getAll(true);
      // إظهار فقط التصنيفات النشطة في لوحة التحكم
      setCategories(data.filter((c: any) => c.isActive !== false));
    }
    catch { toast.error('فشل تحميل التصنيفات'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا التصنيف؟')) return;
    try {
      await categoriesApi.delete(id);
      toast.success('تم الحذف');
      // إزالة التصنيف مباشرة من القائمة (تحديث متفائل)
      setCategories(prev => prev.filter(c => c.id !== id));
      // ثم إعادة التحميل للتأكد من المزامنة
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل الحذف');
    }
  };

  const resolveImageUrl = (path?: string) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/').trim();
    return getImageUrl(normalized.startsWith('/') ? normalized : `/${normalized}`);
  };

  return (
    <div>
      <div className="page-header">
        <h2>📂 إدارة التصنيفات</h2>
        <button className="btn btn-primary" onClick={() => navigate('/categories/new')}><Plus size={18} /> تصنيف جديد</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : categories.map((c) => (
          <div key={c.id} style={{ background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: 'all 0.3s ease' }}>
            <div style={{ height: '120px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.9rem', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              {c.image ? (
                <img
                  src={resolveImageUrl(c.image)}
                  alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = 'none';
                    const fallback = el.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : (
                <></>
              )}
              <div style={{ width: '100%', height: '100%', display: c.image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                بدون صورة خلفية
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#1e293b' }}>{c.nameAr || c.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.name}</p>
              </div>
              {c.isActive ? <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}>نشط</span> : <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>معطل</span>}
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.75rem 0', lineHeight: '1.5' }}>{c.description || 'بدون وصف'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.825rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                {c.productCount || 0} منتج
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate(`/categories/edit/${c.id}`)}><Edit size={14} /></button>
                <button style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
