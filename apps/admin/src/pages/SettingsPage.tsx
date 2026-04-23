import { useState, useEffect, useRef } from 'react';
import {
  Palette, Image as ImageIcon, Type, Layout, Upload, Eye, Save, RotateCcw,
  Monitor, Smartphone, Tablet, X, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadsApi, settingsApi } from '../services/api';

interface SiteSettings {
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
  };
  features: {
    title: string;
    items: { title: string; description: string; icon: string }[];
  };
  banners: {
    promo: { title: string; subtitle: string; image: string; active: boolean };
    secondary: { title: string; subtitle: string; image: string; active: boolean };
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
}

const defaultSettings: SiteSettings = {
  hero: {
    title: 'أحذية عصرية بأناقة مغربية 🇲🇦',
    subtitle: 'اكتشف تشكيلتنا الفريدة من الأحذية العصرية والرياضية بجودة عالية وأسعار تنافسية',
    buttonText: 'تسوق الآن',
    image: '/images/hero-shoes.jpg',
  },
  features: {
    title: 'لماذا تختار StorShoes؟',
    items: [
      { title: 'توصيل سريع', description: 'توصيل لجميع المدن المغربية خلال 24-48 ساعة', icon: 'truck' },
      { title: 'جودة مضمونة', description: 'أحذية أصلية 100% مع ضمان استبدال', icon: 'shield' },
      { title: 'دفع آمن', description: 'الدفع عند الاستلام أو بالبطاقة البنكية', icon: 'credit-card' },
      { title: 'خدمة عملاء', description: 'دعم على مدار الساعة عبر الواتساب', icon: 'headphones' },
    ],
  },
  banners: {
    promo: { title: 'تخفيضات الصيف', subtitle: 'خصم يصل إلى 50%', image: '/images/banner-summer.jpg', active: true },
    secondary: { title: 'مجموعة جديدة', subtitle: 'أحدث صيحات الموضة', image: '/images/banner-new.jpg', active: true },
  },
  colors: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#f59e0b',
  },
  contact: {
    phone: '+212 5XX-XXXXXX',
    email: 'contact@storshoes.ma',
    address: 'الدار البيضاء، المغرب',
    whatsapp: '+212 6XX-XXXXXX',
  },
  social: {
    facebook: 'https://facebook.com/storshoes',
    instagram: 'https://instagram.com/storshoes',
    tiktok: 'https://tiktok.com/@storshoes',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'hero' | 'features' | 'banners' | 'colors' | 'contact' | 'social'>('hero');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('storshoes_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (for immediate admin preview)
      localStorage.setItem('storshoes_settings', JSON.stringify(settings));

      // Save to API (for storefront)
      await settingsApi.updateSite(settings);

      toast.success('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('فشل حفظ الإعدادات في السيرفر');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من إعادة الإعدادات الافتراضية؟')) {
      setSettings(defaultSettings);
      toast.success('تمت إعادة الإعدادات الافتراضية');
    }
  };

  const updateHero = (key: keyof typeof settings.hero, value: string) => {
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const updateFeature = (index: number, key: keyof typeof settings.features.items[0], value: string) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.map((item, i) => i === index ? { ...item, [key]: value } : item),
      },
    }));
  };

  const updateBanner = (banner: 'promo' | 'secondary', key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      banners: {
        ...prev.banners,
        [banner]: { ...prev.banners[banner], [key]: value },
      },
    }));
  };

  const updateColor = (key: keyof typeof settings.colors, value: string) => {
    setSettings(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };

  const updateContact = (key: keyof typeof settings.contact, value: string) => {
    setSettings(prev => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
  };

  const updateSocial = (key: keyof typeof settings.social, value: string) => {
    setSettings(prev => ({ ...prev, social: { ...prev.social, [key]: value } }));
  };

  // Image Upload Handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File, type: 'hero' | 'banner-promo' | 'banner-secondary') => {
    console.log('📤 Uploading file:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميغا');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadsApi.uploadImage(file);
      console.log('✅ Upload response:', response.data);

      const imageUrl = response.data.url || response.data.path || response.data.imageUrl;
      console.log('🖼️ Image URL:', imageUrl);

      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      if (type === 'hero') {
        updateHero('image', imageUrl);
      } else if (type === 'banner-promo') {
        updateBanner('promo', 'image', imageUrl);
      } else if (type === 'banner-secondary') {
        updateBanner('secondary', 'image', imageUrl);
      }

      toast.success('تم رفع الصورة بنجاح!');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('فشل رفع الصورة - تحقق من الـ Console');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'hero', label: '🖼️ الصورة الرئيسية', icon: ImageIcon },
    { id: 'features', label: '✨ المميزات', icon: Layout },
    { id: 'banners', label: '📢 البانرات', icon: Monitor },
    { id: 'colors', label: '🎨 الألوان', icon: Palette },
    { id: 'contact', label: '📞 معلومات التواصل', icon: Type },
    { id: 'social', label: '📱 التواصل الاجتماعي', icon: Smartphone },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>🎨 إدارة الواجهة</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            تخصيص شكل ومظهر متجرك بدون كود
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={18} />
            {showPreview ? 'إخفاء المعاينة' : 'معاينة'}
          </button>
          <button className="btn btn-outline" onClick={handleReset}>
            <RotateCcw size={18} />
            إعادة تعيين
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Settings Panel */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: activeTab === tab.id ? '#000' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Hero Settings */}
          {activeTab === 'hero' && (
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <h3>🖼️ إعدادات الصورة الرئيسية (Hero)</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {/* Hero Image Upload */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>📷 الصورة الرئيسية</label>

                  {/* Image Preview & Upload */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Preview Box */}
                    <div
                      style={{
                        width: 320,
                        height: 180,
                        borderRadius: '0.75rem',
                        background: settings.hero.image ? 'transparent' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: '2px dashed #cbd5e1',
                        position: 'relative',
                      }}
                    >
                      {settings.hero.image ? (
                        <>
                          <img
                            src={settings.hero.image}
                            alt="Hero"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {/* Remove Button */}
                          <button
                            onClick={() => updateHero('image', '')}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="حذف الصورة"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                          <ImageIcon size={48} />
                          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>لا توجد صورة</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      {/* Drag & Drop Zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) handleImageUpload(file, 'hero');
                        }}
                        style={{
                          padding: '1.5rem',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '0.75rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: '#f8fafc',
                        }}
                      >
                        <Upload size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
                        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.25rem' }}>
                          اضغط أو اسحب صورة هنا
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          JPG, PNG, WebP - بحد أقصى 5 ميغا
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'hero');
                          e.target.value = '';
                        }}
                      />

                      {uploading && (
                        <div style={{ marginTop: '0.75rem', color: '#3b82f6', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="spinner" style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          جاري رفع الصورة...
                        </div>
                      )}

                      {/* Or URL Input */}
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                          أو أدخل رابط الصورة
                        </label>
                        <input
                          className="form-input"
                          value={settings.hero.image}
                          onChange={(e) => updateHero('image', e.target.value)}
                          placeholder="https://example.com/hero.jpg"
                          dir="ltr"
                        />
                      </div>

                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                        💡 يفضل استخدام صورة بأبعاد 1920×600 بكسل للحصول على أفضل عرض
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Text */}
                <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>📝 نصوص Hero</h4>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>العنوان الرئيسي</label>
                    <input
                      className="form-input"
                      value={settings.hero.title}
                      onChange={(e) => updateHero('title', e.target.value)}
                      placeholder="أحذية عصرية..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>النص الفرعي</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={settings.hero.subtitle}
                      onChange={(e) => updateHero('subtitle', e.target.value)}
                      placeholder="اكتشف تشكيلتنا..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>نص الزر</label>
                    <input
                      className="form-input"
                      value={settings.hero.buttonText}
                      onChange={(e) => updateHero('buttonText', e.target.value)}
                      placeholder="تسوق الآن"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <h3>✨ إعدادات المميزات</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>عنوان القسم</label>
                  <input
                    className="form-input"
                    value={settings.features.title}
                    onChange={(e) => setSettings(prev => ({ ...prev, features: { ...prev.features, title: e.target.value } }))}
                  />
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {settings.features.items.map((feature, index) => (
                    <div key={index} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#3b82f6' }}>الميزة #{index + 1}</div>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <input
                          className="form-input"
                          placeholder="العنوان"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        />
                        <input
                          className="form-input"
                          placeholder="الوصف"
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Banners Settings */}
          {activeTab === 'banners' && (
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <h3>📢 إعدادات البانرات</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {/* Promo Banner */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.banners.promo.active}
                      onChange={(e) => updateBanner('promo', 'active', e.target.checked)}
                    />
                    <span style={{ fontWeight: 600 }}>بانر التخفيضات</span>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <input
                      className="form-input"
                      placeholder="العنوان"
                      value={settings.banners.promo.title}
                      onChange={(e) => updateBanner('promo', 'title', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="النص الفرعي"
                      value={settings.banners.promo.subtitle}
                      onChange={(e) => updateBanner('promo', 'subtitle', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="رابط الصورة"
                      value={settings.banners.promo.image}
                      onChange={(e) => updateBanner('promo', 'image', e.target.value)}
                    />
                  </div>
                </div>

                {/* Secondary Banner */}
                <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.banners.secondary.active}
                      onChange={(e) => updateBanner('secondary', 'active', e.target.checked)}
                    />
                    <span style={{ fontWeight: 600 }}>بانر ثانوي</span>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <input
                      className="form-input"
                      placeholder="العنوان"
                      value={settings.banners.secondary.title}
                      onChange={(e) => updateBanner('secondary', 'title', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="النص الفرعي"
                      value={settings.banners.secondary.subtitle}
                      onChange={(e) => updateBanner('secondary', 'subtitle', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="رابط الصورة"
                      value={settings.banners.secondary.image}
                      onChange={(e) => updateBanner('secondary', 'image', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Colors Settings */}
          {activeTab === 'colors' && (
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <h3>🎨 إعدادات الألوان</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { key: 'primary', label: 'اللون الأساسي', desc: 'اللون الرئيسي للأزرار والعناصر المهمة' },
                    { key: 'secondary', label: 'اللون الثانوي', desc: 'لون النصوص والعناوين' },
                    { key: 'accent', label: 'لون التمييز', desc: 'لون العروض والتنبيهات' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                      <input
                        type="color"
                        value={settings.colors[key as keyof typeof settings.colors]}
                        onChange={(e) => updateColor(key as keyof typeof settings.colors, e.target.value)}
                        style={{ width: 50, height: 50, border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div>
                        <code style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>
                          {settings.colors[key as keyof typeof settings.colors]}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Settings */}
          {activeTab === 'contact' && (
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <h3>📞 معلومات التواصل</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>رقم الهاتف</label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={settings.contact.phone}
                      onChange={(e) => updateContact('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>البريد الإلكتروني</label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={settings.contact.email}
                      onChange={(e) => updateContact('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>العنوان</label>
                    <input
                      className="form-input"
                      value={settings.contact.address}
                      onChange={(e) => updateContact('address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>واتساب</label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={settings.contact.whatsapp}
                      onChange={(e) => updateContact('whatsapp', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Settings */}
          {activeTab === 'social' && (
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <h3>📱 روابط التواصل الاجتماعي</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Facebook</label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={settings.social.facebook}
                      onChange={(e) => updateSocial('facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instagram</label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={settings.social.instagram}
                      onChange={(e) => updateSocial('instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>TikTok</label>
                    <input
                      className="form-input"
                      dir="ltr"
                      value={settings.social.tiktok}
                      onChange={(e) => updateSocial('tiktok', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div>
            <div className="data-table-wrapper" style={{ position: 'sticky', top: '1rem' }}>
              <div className="data-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>👁️ معاينة حية</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { id: 'desktop', icon: Monitor },
                    { id: 'tablet', icon: Tablet },
                    { id: 'mobile', icon: Smartphone },
                  ].map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPreviewMode(id as typeof previewMode)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        background: previewMode === id ? '#000' : '#e2e8f0',
                        color: previewMode === id ? '#fff' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f1f5f9' }}>
                <div
                  style={{
                    width: previewMode === 'mobile' ? 375 : previewMode === 'tablet' ? 768 : '100%',
                    margin: '0 auto',
                    background: '#fff',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'width 0.3s ease',
                  }}
                >
                  {/* Mini Hero Preview */}
                  <div style={{ position: 'relative', height: 200, background: settings.colors.primary }}>
                    {settings.hero.image && (
                      <img src={settings.hero.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '1rem' }}>
                      <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{settings.hero.title}</h4>
                      <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>{settings.hero.subtitle.slice(0, 60)}...</p>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem', padding: '0.5rem 1rem', background: settings.colors.accent, color: '#fff', border: 'none', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                        {settings.hero.buttonText}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Mini Features Preview */}
                  <div style={{ padding: '1rem' }}>
                    <h5 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>{settings.features.title}</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {settings.features.items.slice(0, 4).map((f, i) => (
                        <div key={i} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{f.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini Banner Preview */}
                  {settings.banners.promo.active && (
                    <div style={{ margin: '0 1rem 1rem', padding: '1rem', background: settings.colors.accent, borderRadius: '0.375rem', color: '#fff', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{settings.banners.promo.title}</div>
                      <div style={{ fontSize: '0.75rem' }}>{settings.banners.promo.subtitle}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
