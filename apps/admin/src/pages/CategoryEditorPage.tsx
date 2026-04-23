import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categoriesApi, uploadsApi, getImageUrl } from '../services/api';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', nameAr: '', description: '', image: '', isActive: true };

export default function CategoryEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const { data } = await categoriesApi.getById(id);
        setForm({
          name: data.name || '',
          nameAr: data.nameAr || '',
          description: data.description || '',
          image: data.image || '',
          isActive: data.isActive !== false,
        });
      } catch {
        toast.error('تعذر تحميل التصنيف');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const resolveImageUrl = (path?: string) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/').trim();
    return getImageUrl(normalized.startsWith('/') ? normalized : `/${normalized}`);
  };

  const previewTitle = useMemo(() => form.nameAr || form.name || 'اسم التصنيف', [form.nameAr, form.name]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const { data } = await uploadsApi.uploadImage(file);
      setForm((prev) => ({ ...prev, image: data.url }));
      toast.success('تم رفع الصورة بنجاح');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit && id) {
        await categoriesApi.update(id, form);
        toast.success('تم تحديث التصنيف');
      } else {
        await categoriesApi.create(form);
        toast.success('تم إضافة التصنيف');
      }
      navigate('/categories');
    } catch {
      toast.error('تعذر حفظ التصنيف');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <h2>{isEdit ? '✏️ تعديل التصنيف' : '➕ إضافة تصنيف جديد'}</h2>
        <Link to="/categories" className="btn btn-outline"><ArrowLeft size={16} /> رجوع</Link>
      </div>

      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.07)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', minHeight: '630px' }}>
          <form onSubmit={handleSubmit} style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">الاسم (English)</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم (عربي)</label>
              <input className="form-input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">وصف مختصر</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">صورة خلفية التصنيف</label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  <ImagePlus size={16} />
                  {uploadingImage ? 'جاري الرفع...' : 'اختيار صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
                {form.image && (
                  <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, image: '' })}>حذف الصورة</button>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.45rem' }}>
                هذه الصورة ستظهر كخلفية للتصنيف في واجهة المتجر.
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نشط
            </label>

            <div style={{ marginTop: 'auto', position: 'sticky', bottom: 0, background: '#fff', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '190px' }} disabled={saving}>
                {saving ? 'جاري الحفظ...' : (isEdit ? 'تحديث التصنيف' : 'إضافة التصنيف')}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/categories')}>إلغاء</button>
            </div>
          </form>

          <div style={{ padding: '1.4rem', borderLeft: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.8rem' }}>معاينة ما سيظهر للمشتري</div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden', background: '#fff' }}>
              <div style={{ height: '230px', background: '#e2e8f0', position: 'relative' }}>
                {form.image ? (
                  <img
                    src={resolveImageUrl(form.image)}
                    alt={form.name || 'category image'}
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
                <div style={{ width: '100%', height: '100%', display: form.image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                  اختر صورة خلفية
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.58), rgba(15,23,42,0.15))' }} />
                <div style={{ position: 'absolute', right: '0.85rem', bottom: '0.85rem', color: '#fff' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{previewTitle}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.92 }}>{form.description || 'وصف التصنيف سيظهر هنا'}</div>
                </div>
              </div>
              <div style={{ padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>حالة التصنيف</span>
                <span className={`badge ${form.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>{form.isActive ? 'نشط' : 'معطل'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
