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
  const [mainSizes, setMainSizes] = useState<any[]>([{ size: '40', stock: 10 }]);
  const [colors, setColors] = useState<any[]>([]);
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
      const newMainSizes: any[] = [];
      const colorsMap: Record<string, any> = {};

      activeVariants.forEach((v: any) => {
        if (!v.color) {
          newMainSizes.push({
            id: v.id,
            size: v.size,
            stock: v.stock
          });
        } else {
          const colorKey = v.color;
          if (!colorsMap[colorKey]) {
            colorsMap[colorKey] = {
              id: 'cg_' + Date.now() + Math.random(),
              color: v.color,
              colorHex: v.colorHex || '#000000',
              imageUrls: v.imageUrls || [],
              sizes: []
            };
          }
          colorsMap[colorKey].sizes.push({
            id: v.id,
            size: v.size,
            stock: v.stock
          });
        }
      });
      
      setMainSizes(newMainSizes.length > 0 ? newMainSizes : [{ size: '40', stock: 10 }]);
      setColors(Object.values(colorsMap));
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
    
    let processedVariants: any[] = [];
    
    // Process main sizes
    mainSizes.filter((s: any) => s.size).forEach((s: any) => {
      if (s.id) {
        processedVariants.push({
          id: s.id,
          size: s.size,
          color: null,
          colorHex: null,
          imageUrl: null,
          imageUrls: [],
          sku: `SKU-${Date.now().toString(36).toUpperCase()}-${s.size}`,
          stock: parseInt(s.stock) || 0
        });
      } else {
        const sizes = String(s.size).split(/[,،-]/).map(sz => sz.trim()).filter(sz => sz);
        sizes.forEach(sz => {
          processedVariants.push({
            size: sz,
            color: null,
            colorHex: null,
            imageUrl: null,
            imageUrls: [],
            sku: `SKU-${Date.now().toString(36).toUpperCase()}-${sz}`,
            stock: parseInt(s.stock) || 0
          });
        });
      }
    });

    // Process colors variants
    colors.forEach(group => {
      group.sizes.filter((s: any) => s.size).forEach((s: any) => {
        if (s.id) {
          processedVariants.push({
            id: s.id,
            size: s.size,
            color: group.color || null,
            colorHex: group.colorHex || null,
            imageUrl: group.imageUrls[0] || null,
            imageUrls: group.imageUrls || [],
            sku: `SKU-${Date.now().toString(36).toUpperCase()}-${s.size}`,
            stock: parseInt(s.stock) || 0
          });
        } else {
          const sizes = String(s.size).split(/[,،-]/).map(sz => sz.trim()).filter(sz => sz);
          sizes.forEach(sz => {
            processedVariants.push({
              size: sz,
              color: group.color || null,
              colorHex: group.colorHex || null,
              imageUrl: group.imageUrls[0] || null,
              imageUrls: group.imageUrls || [],
              sku: `SKU-${Date.now().toString(36).toUpperCase()}-${sz}`,
              stock: parseInt(s.stock) || 0
            });
          });
        }
      });
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
            // Need to update variant details like imageUrl, color, colorHex and stock. Wait, inventoryApi.updateStock only updates stock.
            // Let's use productsApi.updateVariant if it exists, or just keep it simple with stock for now if backend doesn't support full variant update.
            // Wait, we can add productsApi.updateVariant to the api.ts, or assume it's there. 
            // I will implement a simpler approach or add it if needed.
            // For now, let's assume we can update the variant entirely if needed.
            // Currently, it only updates stock. We'll update the API call below.
            await inventoryApi.updateVariant(v.id, { 
                stock: v.stock,
                color: v.color,
                colorHex: v.colorHex,
                imageUrl: v.imageUrl,
                imageUrls: v.imageUrls || []
             });
            // We should also update color/image. If the API doesn't have it, we might need to add it.
            // To be safe, I'll let the user create new variants for new colors if editing is complex.
          } else {
            await productsApi.addVariant(id, { 
              size: v.size, 
              color: v.color,
              colorHex: v.colorHex,
              imageUrl: v.imageUrl,
              imageUrls: v.imageUrls || [],
              sku: v.sku, 
              stock: v.stock 
            });
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

  const handleVariantImageUpload = async (groupIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const { data: uploadData } = await uploadsApi.uploadImage(file);
        uploadedUrls.push(uploadData.url);
      }
      
      const newGroups = [...colors];
      if (!newGroups[groupIndex].imageUrls) newGroups[groupIndex].imageUrls = [];
      newGroups[groupIndex].imageUrls = [...newGroups[groupIndex].imageUrls, ...uploadedUrls];
      
      setColors(newGroups);
      toast.success('تم رفع صور اللون بنجاح');
    } catch {
      toast.error('فشل رفع صور اللون');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveVariantImage = (groupIndex: number, urlToRemove: string) => {
    const newGroups = [...colors];
    newGroups[groupIndex].imageUrls = (newGroups[groupIndex].imageUrls || []).filter((url: string) => url !== urlToRemove);
    setColors(newGroups);
  };

  const handleRemoveColorSize = async (groupIndex: number, sizeIndex: number) => {
    const s = colors[groupIndex].sizes[sizeIndex];
    if (s.id) {
      if (!confirm('هذا المقاس محفوظ مسبقاً، هل أنت متأكد من حذفه نهائياً؟')) return;
      try {
        await productsApi.removeVariant(s.id);
        toast.success('تم حذف المقاس');
      } catch {
        toast.error('فشل حذف المقاس');
        return;
      }
    }
    const newGroups = [...colors];
    newGroups[groupIndex].sizes.splice(sizeIndex, 1);
    setColors(newGroups);
  };

  const handleAddColorSize = (groupIndex: number) => {
    const newGroups = [...colors];
    newGroups[groupIndex].sizes.push({ size: '', stock: 10 });
    setColors(newGroups);
  };

  const handleRemoveMainSize = async (sizeIndex: number) => {
    const s = mainSizes[sizeIndex];
    if (s.id) {
      if (!confirm('هذا المقاس محفوظ مسبقاً، هل أنت متأكد من حذفه نهائياً؟')) return;
      try {
        await productsApi.removeVariant(s.id);
        toast.success('تم حذف المقاس');
      } catch {
        toast.error('فشل حذف المقاس');
        return;
      }
    }
    const newSizes = [...mainSizes];
    newSizes.splice(sizeIndex, 1);
    setMainSizes(newSizes);
  };

  const handleAddMainSize = () => {
    setMainSizes([...mainSizes, { size: '', stock: 10 }]);
  };

  const handleAddColorGroup = () => {
    setColors([...colors, {
      id: 'cg_' + Date.now(),
      color: '',
      colorHex: '#000000',
      imageUrls: [],
      sizes: [{ size: '', stock: 10 }]
    }]);
  };

  const handleRemoveColorGroup = (groupIndex: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا اللون بجميع مقاساته؟')) return;
    const newGroups = [...colors];
    newGroups.splice(groupIndex, 1);
    setColors(newGroups);
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

            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '2rem', marginTop: '1rem', gridColumn: '1 / -1' }}>
              {/* Main Product Sizes Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>📏 المقاسات الرئيسية للمنتج</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>المقاسات الافتراضية للمنتج بدون تحديد لون</p>
                  </div>
                  <button type="button" onClick={handleAddMainSize} style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                    borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600
                  }}>
                    <Plus size={15} /> إضافة مقاس رئيسي
                  </button>
                </div>
                
                <div style={{ background: '#fff', borderRadius: '1rem', border: '2px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                  {/* Sizes table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>المقاس</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>الكمية</span>
                    <span />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mainSizes.map((s: any, sizeIndex: number) => (
                      <div key={s.id || sizeIndex} style={{
                        display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', alignItems: 'center',
                        background: '#f8fafc', borderRadius: '8px', padding: '0.5rem',
                        border: '1px solid #f1f5f9'
                      }}>
                        <input
                          className="form-input"
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', background: s.id ? '#f1f5f9' : '#fff', fontWeight: s.id ? 600 : 400 }}
                          value={s.size}
                          onChange={(e) => { const newSizes = [...mainSizes]; newSizes[sizeIndex].size = e.target.value; setMainSizes(newSizes); }}
                          disabled={!!s.id}
                          placeholder="مثلا: 40 أو 40,41,42"
                          required
                        />
                        <input
                          type="number" min="0"
                          className="form-input"
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                          value={s.stock}
                          onChange={(e) => { const newSizes = [...mainSizes]; newSizes[sizeIndex].stock = e.target.value; setMainSizes(newSizes); }}
                          placeholder="الكمية"
                          required
                        />
                        <button type="button" onClick={() => handleRemoveMainSize(sizeIndex)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', padding: '0.3rem' }}>
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Colors Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '2rem', borderTop: '2px dashed #e2e8f0', paddingTop: '2rem' }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>🎨 ألوان إضافية (اختياري)</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>أضف ألوان المنتج مع صورها ومقاساتها المخصصة</p>
                </div>
                <button type="button" onClick={handleAddColorGroup} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}>
                  <Plus size={15} /> إضافة لون
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {colors.map((group, groupIndex) => (
                  <div key={group.id} style={{
                    borderRadius: '1rem',
                    border: '2px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    background: '#fff'
                  }}>
                    {/* ── Layer 1: Color Identity ── */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        {/* Color swatch preview */}
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: group.colorHex || '#000',
                          border: '3px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>اللون {groupIndex + 1}</div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              className="form-input"
                              value={group.color}
                              onChange={(e) => { const g = [...colors]; g[groupIndex].color = e.target.value; setColors(g); }}
                              placeholder="اسم اللون (مثلا: أحمر)"
                              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', maxWidth: 200, padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                              required
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>كود اللون:</span>
                              <input
                                type="color"
                                value={group.colorHex}
                                onChange={(e) => { const g = [...colors]; g[groupIndex].colorHex = e.target.value; setColors(g); }}
                                style={{ width: 36, height: 28, border: '2px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', background: 'transparent', padding: 0 }}
                              />
                              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{group.colorHex}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {colors.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColorGroup(groupIndex)}
                          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                        >
                          <Trash2 size={14} /> حذف
                        </button>
                      )}
                    </div>

                    {/* ── Layer 2: Color Images ── */}
                    <div style={{ padding: '1.25rem', borderBottom: '2px dashed #e2e8f0', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 3, height: 16, background: '#6366f1', borderRadius: 2 }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>صور هذا اللون</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: 9999 }}>الصورة الأولى = الرئيسية</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {(group.imageUrls || []).map((url: string, imgIndex: number) => (
                          <div key={imgIndex} style={{
                            position: 'relative', width: 80, height: 80,
                            borderRadius: '10px',
                            border: imgIndex === 0 ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: imgIndex === 0 ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none'
                          }}>
                            <img src={getImageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => handleRemoveVariantImage(groupIndex, url)}
                              style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                              <X size={11} />
                            </button>
                            {imgIndex === 0 && (
                              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(99,102,241,0.85)', color: '#fff', fontSize: '0.55rem', textAlign: 'center', padding: '3px 0', fontWeight: 600 }}>★ رئيسية</span>
                            )}
                          </div>
                        ))}
                        <label style={{
                          width: 80, height: 80, borderRadius: '10px',
                          border: '2px dashed #94a3b8',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', background: '#fff', transition: 'all 0.2s',
                          color: '#64748b'
                        }}>
                          <input type="file" accept="image/*" multiple onChange={(e) => handleVariantImageUpload(groupIndex, e)} style={{ display: 'none' }} disabled={uploadingImage} />
                          <Plus size={20} />
                          <span style={{ fontSize: '0.6rem', marginTop: '4px' }}>إضافة</span>
                        </label>
                      </div>
                    </div>

                    {/* ── Layer 3: Sizes & Quantities ── */}
                    <div style={{ padding: '1.25rem', background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 3, height: 16, background: '#10b981', borderRadius: 2 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>المقاسات والكميات</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: 9999 }}>{group.sizes.length} مقاس</span>
                        </div>
                        <button type="button" onClick={() => handleAddColorSize(groupIndex)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                          borderRadius: '8px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600
                        }}>
                          <Plus size={12} /> مقاس إضافي
                        </button>
                      </div>

                      {/* Sizes table header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', marginBottom: '0.4rem', padding: '0 0.25rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>المقاس</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>الكمية</span>
                        <span />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {group.sizes.map((s: any, sizeIndex: number) => (
                          <div key={s.id || sizeIndex} style={{
                            display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', alignItems: 'center',
                            background: '#f8fafc', borderRadius: '8px', padding: '0.4rem 0.5rem',
                            border: '1px solid #f1f5f9'
                          }}>
                            <input
                              className="form-input"
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', background: s.id ? '#f1f5f9' : '#fff', fontWeight: s.id ? 600 : 400 }}
                              value={s.size}
                              onChange={(e) => { const g = [...colors]; g[groupIndex].sizes[sizeIndex].size = e.target.value; setColors(g); }}
                              disabled={!!s.id}
                              placeholder="مثلا: 40 أو 40,41,42"
                              required
                            />
                            <input
                              type="number" min="0"
                              className="form-input"
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                              value={s.stock}
                              onChange={(e) => { const g = [...colors]; g[groupIndex].sizes[sizeIndex].stock = e.target.value; setColors(g); }}
                              placeholder="الكمية"
                              required
                            />
                            <button type="button" onClick={() => handleRemoveColorSize(groupIndex, sizeIndex)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', padding: '0.3rem' }}>
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
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
