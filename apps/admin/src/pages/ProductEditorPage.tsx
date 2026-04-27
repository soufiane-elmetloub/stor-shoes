import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi, uploadsApi, inventoryApi, getImageUrl } from '../services/api';
import { ArrowRight, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [form, setForm] = useState({
    name: '', nameAr: '', description: '', brand: '', price: '', salePrice: '',
    categoryId: '', tags: '', isActive: true, isFeatured: false
  });
  const [variants, setVariants] = useState<any[]>([{ size: '40', stock: 10 }]);
  const [images, setImages] = useState<any[]>([]);
  const [localFiles, setLocalFiles] = useState<{file: File; previewUrl: string}[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditing && id) loadProduct(id);
  }, [id]);

  const loadCategories = async () => {
    try { const { data } = await categoriesApi.getAll(); setCategories(data); } catch {}
  };

  const loadProduct = async (productId: string) => {
    try {
      const { data } = await productsApi.getById(productId);
      setForm({
        name: data.name || '',
        nameAr: data.nameAr || '',
        description: data.description || '',
        brand: data.brand || '',
        price: String(data.price || ''),
        salePrice: data.salePrice ? String(data.salePrice) : '',
        categoryId: data.categoryId || '',
        tags: data.tags?.join(', ') || '',
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      });
      const activeVariants = (data.variants || []).filter((v: any) => v.isActive !== false);
      setVariants(activeVariants.length ? activeVariants.map((v:any) => ({...v})) : [{ size: '40', stock: 10 }]);
      setImages(data.images || []);
    } catch {
      toast.error('فشل تحميل تفاصيل المنتج');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedSalePrice = form.salePrice.trim();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      // Send null explicitly when discount is removed so backend clears it.
      salePrice: normalizedSalePrice === '' ? null : parseFloat(normalizedSalePrice),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
    };
    
    // Process variants: split comma-separated sizes into individual variants
    let processedVariants: any[] = [];
    variants.filter(v => v.size).forEach(v => {
      if (v.id) {
        processedVariants.push({ ...v, stock: parseInt(v.stock) || 0 });
      } else {
        const sizes = String(v.size).split(/[,،-]/).map(s => s.trim()).filter(s => s);
        sizes.forEach(s => {
          processedVariants.push({ size: s, sku: `SKU-${Date.now().toString(36).toUpperCase()}-${s}`, stock: parseInt(v.stock) || 0 });
        });
      }
    });
    
    if (!isEditing) {
      (payload as any).variants = processedVariants;
    }
    try {
      let productIdToUse = id;
      if (isEditing && id) {
        await productsApi.update(id, payload);
        
        // Update or Add variants seamlessly
        for (const v of processedVariants) {
          if (v.id) {
            await inventoryApi.updateStock(v.id, v.stock);
          } else {
            await productsApi.addVariant(id, { size: v.size, sku: v.sku, stock: v.stock });
          }
        }
        
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        const { data } = await productsApi.create(payload);
        // data could fall under different structured responses, usually data.id
        productIdToUse = data.id || data.data?.id; 
        toast.success('تم إضافة المنتج');
      }

      if (productIdToUse && localFiles.length > 0) {
        setUploadingImage(true);
        for (const local of localFiles) {
          try {
            const { data: uploadData } = await uploadsApi.uploadImage(local.file);
            await productsApi.addImage(productIdToUse, { url: uploadData.url, alt: form.name });
          } catch {
            toast.error('فشل رفع بعض الصور');
          }
        }
        setUploadingImage(false);
      }
      navigate('/products');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    if (!id) {
       const newLocals = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
       setLocalFiles(prev => [...prev, ...newLocals]);
       return;
    }

    setUploadingImage(true);
    try {
      for (const file of files) {
        const { data: uploadData } = await uploadsApi.uploadImage(file);
        const url = uploadData.url;
        await productsApi.addImage(id, { url, alt: form.name });
      }
      toast.success('تم رفع الصورة بنجاح');
      loadProduct(id);
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async (img: any) => {
    if (img.id) {
      if (!confirm('هل تريد حذف هذه الصورة؟')) return;
      try {
        await productsApi.removeImage(img.id);
        toast.success('تم حذف الصورة');
        if (id) loadProduct(id);
      } catch { toast.error('فشل حذف الصورة'); }
    } else {
      setLocalFiles(prev => prev.filter(l => l.previewUrl !== img.previewUrl));
    }
  };

  const handleRemoveVariant = async (index: number) => {
    const v = variants[index];
    if (v.id) {
      if (!confirm('هل أنت متأكد من حذف هذا المقاس نهائياً؟')) return;
      try {
        await productsApi.removeVariant(v.id);
        toast.success('تم حذف المقاس');
        setVariants(variants.filter((_, i) => i !== index));
      } catch { toast.error('فشل حذف المقاس'); }
    } else {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/products')} style={{ padding: '0.5rem' }}>
          <ArrowRight size={20} />
        </button>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#000' }}>
            {isEditing ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>قم بملء تفاصيل المنتج وتحديد خيارات العرض</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Main Details */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <form id="product-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>الاسم (عربي) *</label>
                <input className="form-input" style={{ background: '#f8fafc' }} value={form.nameAr} onChange={(e) => setForm({...form, nameAr: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>الاسم (English) *</label>
                <input className="form-input" style={{ background: '#f8fafc' }} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>السعر الأساسي (MAD) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>سعر التخفيض (اختياري)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.salePrice} onChange={(e) => setForm({...form, salePrice: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>التصنيف *</label>
                <select className="form-input" style={{ background: '#f8fafc' }} value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})} required>
                  <option value="">اختر تصنيف</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nameAr || c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>الماركة (Brand)</label>
                <input className="form-input" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>المقاسات والكميات</h4>
                <button type="button" onClick={() => setVariants([...variants, { size: '', stock: 10 }])} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                  <Plus size={14} /> إضافة مقاس
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>المقاس</label>
                      <input className="form-input" value={v.size} onChange={(e) => { const newV = [...variants]; newV[i].size = e.target.value; setVariants(newV); }} disabled={!!v.id} placeholder="مثلا: 40 أو مقاسات متعددة 40,41,42" required />
                      {v.id && <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>لا يمكن تغيير اسم المقاس المسجل. احذفه (🗑️) إذا أردت إزالته</span>}
                      {!v.id && <span style={{ fontSize: '0.65rem', color: '#3b82f6' }}>يمكنك إدخال مقاس واحد أو وضع فاصلة (,) بين عدة مقاسات</span>}
                    </div>
                    <div style={{ width: '120px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>الكمية المتاحة</label>
                      <input type="number" min="0" className="form-input" value={v.stock} onChange={(e) => { const newV = [...variants]; newV[i].stock = e.target.value; setVariants(newV); }} required />
                    </div>
                    <div style={{ marginTop: '1.25rem' }}>
                      <button type="button" className="btn btn-outline" style={{ padding: '0.55rem', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleRemoveVariant(i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: '1.5rem', gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>الوصف الكامل للمنتج</label>
              <textarea className="form-input" style={{ background: '#f8fafc', minHeight: '120px' }} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>الوسوم (مفصولة بفاصلة)</label>
              <input className="form-input" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="مثال: أحذية، رياضي، شتوي" />
            </div>
          </form>
        </div>

        {/* Sidebar Actions / Media */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, color: '#000', marginBottom: '1rem' }}>صور المنتج</h3>
            <div>
              {(() => {
                const allImages = [...images, ...localFiles];
                const mainImage = allImages[0];
                const subImages = allImages.slice(1);
                
                return (
                  <div>
                    {/* Main Image */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>الصورة الرئيسية للمنتج</label>
                      {mainImage ? (
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid #000', aspectRatio: '4/3', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                          <img src={mainImage.url ? getImageUrl(mainImage.url) : mainImage.previewUrl} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {mainImage.previewUrl && <div style={{ position: 'absolute', top: 0, left: 0, padding: '0.3rem 0.6rem', background: '#f59e0b', color: '#fff', fontSize: '0.75rem', fontWeight: 600, borderBottomRightRadius: '8px' }}>متوقعة (لم تحفظ)</div>}
                          <button type="button" onClick={() => handleRemoveImage(mainImage)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', cursor: 'pointer', aspectRatio: '4/3', transition: 'all 0.2s' }}>
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                          <ImageIcon size={32} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>إضافة صورة رئيسية</span>
                          <span style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>اختر أفضل صورة للمنتج</span>
                        </label>
                      )}
                    </div>

                    {/* Secondary Images */}
                    {allImages.length > 0 && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>الصور الفرعية الإضافية</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                          {subImages.map((img, i) => (
                            <div key={img.id || i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '1/1' }}>
                              <img src={img.url ? getImageUrl(img.url) : img.previewUrl} alt="Sub" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {img.previewUrl && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', padding: '0.2rem', textAlign: 'center' }}>انتظار</div>}
                              <button type="button" onClick={() => handleRemoveImage(img)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer' }}><X size={12} /></button>
                            </div>
                          ))}
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', aspectRatio: '1/1', transition: 'all 0.2s' }}>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                            <Plus size={20} style={{ color: '#94a3b8' }} />
                            <span style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.2rem' }}>إضافة المزيد</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, color: '#000', marginBottom: '1rem' }}>الحالة والنشر</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer', marginBottom: '0.5rem' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} /> 
              <span style={{ fontWeight: 500 }}>منتج نشط ومتاح للبيع</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}>
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({...form, isFeatured: e.target.checked})} style={{ width: '18px', height: '18px' }} /> 
              <span style={{ fontWeight: 500, color: '#92400e' }}>منتج مميز (في القائمة الرئيسية)</span>
            </label>
            <button form="product-form" type="submit" disabled={uploadingImage} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.75rem' }}>
              {uploadingImage ? 'جاري المعالجة...' : isEditing ? 'تحديث وتخزين' : 'حفظ المنتج المكتمل'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
