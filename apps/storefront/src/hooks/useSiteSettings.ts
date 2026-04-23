'use client';

import { useState, useEffect } from 'react';

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

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage first
    const saved = localStorage.getItem('storshoes_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        console.error('Failed to parse settings');
      }
    }
    setLoading(false);

    // Listen for changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storshoes_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings({ ...defaultSettings, ...parsed });
        } catch {
          console.error('Failed to parse settings');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { settings, loading, defaultSettings };
}

export type { SiteSettings };
