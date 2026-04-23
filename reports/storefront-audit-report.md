# تقرير فحص موقع StorShoes - واجهة المشتري

**تاريخ الفحص:** 16 أبريل 2026  
**المسار:** `apps/storefront`  
**الإطار:** Next.js 16 + React 19 + Tailwind CSS 4

---

## ملخص تنفيذي

الموقع يحتوي على بنية جيدة ولكن يوجد **15 نقطة رئيسية** تحتاج إلى تحسين تغطي: الأداء، تجربة المستخدم، SEO، الأمان، وسهولة الصيانة.

---

## 1. الأداء والتحسينات التقنية

### 1.1 استخدام صور خارجية بدون تحسين
**الموقع:** `HeroShoe.tsx:65`
```tsx
src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
```

**السبب:**
- الصور الخارجية تسبب بطء في التحميل
- لا يوجد lazy loading حقيقي للصورة الرئيسية
- لا يوجد placeholder أثناء التحميل

**الحل:**
```tsx
import Image from 'next/image';
// استخدم next/image مع priority للصورة الرئيسية
<Image
  src="/images/hero-shoe.webp"
  alt="StorShoes Hero"
  width={500}
  height={500}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

---

### 1.2 عدم وجود تحسين للصور بشكل عام
**الموقع:** جميع مكونات الصور (`ProductCard.tsx`, `BestSellers.tsx`, `CategoryCircles.tsx`)

**السبب:**
- استخدام `<img>` العادي بدلاً من `next/image`
- فقدان ميزات التحسين التلقائي: WebP، lazy loading، responsive sizes
- التأثير على Core Web Vitals (LCP, CLS)

**الحل:**
استبدال جميع `<img>` بـ `next/image` مع تحديد أبعاد مناسبة:
```tsx
import Image from 'next/image';

<Image
  src={product.images[0].url}
  alt={product.name}
  width={400}
  height={400}
  className="object-cover"
  loading={index < 4 ? "eager" : "lazy"}
/>
```

---

### 1.3 عدم وجود React Error Boundaries
**الموقع:** جميع الصفحات

**السبب:**
- أي خطأ في مكون يمكن أن يعطل التطبيق بالكامل
- ضعف في تجربة المستخدم عند حدوث أخطاء

**الحل:**
```tsx
// components/ErrorBoundary.tsx
'use client';
import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>حدث خطأ ما</div>;
    }
    return this.props.children;
  }
}
```

---

### 1.4 استخدام inline styles بشكل مفرط
**الموقع:** جميع الملفات تقريباً

**السبب:**
- صعوبة في الصيانة والتعديل
- عدم إمكانية استخدام media queries
- تكرار الكود (DRY principle violation)
- تأثير سلبي على الأداء (CSS recalculation)

**الحل:**
نقل الأنماط إلى ملفات CSS مخصصة أو استخدام Tailwind classes:
```tsx
// بدلاً من:
<div style={{ padding: '1rem', background: 'white', borderRadius: '1rem' }}>

// استخدم:
<div className="p-4 bg-white rounded-2xl">
```

---

## 2. تجربة المستخدم (UX)

### 2.1 لا يوجد تأثيرات loading للأزرار
**الموقع:** `page.tsx:183-207` (صفحة الاتصال)

**السبب:**
- المستخدم لا يعرف أن النموذج يتم إرساله
- إمكانية الإرسال المتعدد بنقرات متكررة

**الحل:**
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

<button 
  disabled={isSubmitting}
  className="relative"
>
  {isSubmitting ? (
    <>
      <span className="opacity-0">Envoyer</span>
      <span className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </span>
    </>
  ) : 'Envoyer'}
</button>
```

---

### 2.2 لا يوجد رسائل خطأ واضحة للنماذج
**الموقع:** `contact/page.tsx`

**السبب:**
- التحقق من صحة البيانات يتم بـ `required` HTML فقط
- لا يوجد رسائل مخصصة للأخطاء
- لا يوجد تحقق من صحة رقم الهاتف المغربي

**الحل:**
```tsx
const validatePhone = (phone: string) => {
  const moroccanRegex = /^(0[5-7]\d{8}|0[8-9]\d{8})$/;
  return moroccanRegex.test(phone);
};

// عرض رسالة خطأ مخصصة
{errors.phone && (
  <span className="text-red-500 text-sm">Numéro invalide (ex: 0612345678)</span>
)}
```

---

### 2.3 لا يوجد مؤشرات تحميل للمنتجات
**الموقع:** `products/page.tsx`

**السبب:**
- المستخدم لا يعرف أن المنتجات يتم تحميلها
- تجربة مستخدم غير سلسة

**الحل:**
تحسين حالة التحميل مع skeleton screens:
```tsx
{loading && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
)}
```

---

### 2.4 لا يوجد خاصية "المفضلة" (Wishlist)
**الموقع:** جميع صفحات المنتجات

**السبب:**
- ميزة أساسية في المتاجر الإلكترونية
- تساعد المستخدم على حفظ المنتجات للمقارنة
- زيادة معدل العودة للموقع

**الحل:**
إضافة context للمفضلة مشابه للـ Cart:
```tsx
// lib/wishlist.tsx
export function WishlistProvider({ children }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  // ... نفس منطق Cart
}
```

---

### 2.5 لا يوجد breadcrumbs للتنقل
**الموقع:** صفحة تفاصيل المنتج

**السبب:**
- صعوبة في فهم موقع المستخدم في الموقع
- ضعف في SEO
- تجربة مستخدم أسوأ

**الحل:**
```tsx
// components/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-black">{item.label}</Link>
          ) : (
            <span className="text-black">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

---

### 2.6 عدم وجود ترقيم صفحات (Pagination) واضح
**الموقع:** `products/page.tsx:107-179`

**السبب:**
- التنقل بين الصفحات غير واضح
- لا يوجد أرقام الصفحات المحيطة بالصفحة الحالية

**الحل:**
تحسين Pagination component مع:
- أزرار السابق/التالي
- عرض أرقام الصفحات المحيطة
- jump to page input

---

## 3. SEO والأرشفة

### 3.1 Metadata غير كاملة
**الموقع:** `layout.tsx:4-14`

**السبب:**
- لا يوجد og:image
- لا يوجد twitter cards
- لا يوجد structured data للمنتجات
- لا يوجد canonical URLs

**الحل:**
```tsx
export const metadata: Metadata = {
  title: "StorShoes - Premium Footwear Store",
  description: "...",
  keywords: [...],
  metadataBase: new URL('https://storshoes.ma'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "...",
    description: "...",
    url: 'https://storshoes.ma',
    siteName: 'StorShoes',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
    }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "...",
    description: "...",
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

---

### 3.2 لا يوجد sitemap.xml و robots.txt
**الموقع:** غير موجود

**السبب:**
- صعوبة في أرشفة الموقع من محركات البحث
- ضعف في SEO

**الحل:**
```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts();
  
  return [
    {
      url: 'https://storshoes.ma',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products.map(product => ({
      url: `https://storshoes.ma/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

---

### 3.3 Structured Data مفقود للمنتجات
**الموقع:** صفحات المنتجات

**السبب:**
- Google لا يعرض rich snippets للمنتجات
- فقدان ميزة عرض السعر والتوفر في نتائج البحث

**الحل:**
```tsx
// في صفحة تفاصيل المنتج
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images.map(img => img.url),
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      offers: {
        '@type': 'Offer',
        url: `https://storshoes.ma/products/${product.slug}`,
        priceCurrency: 'MAD',
        price: product.salePrice || product.price,
        availability: product.variants.some(v => v.stock > 0) 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
      },
    }),
  }}
/>
```

---

## 4. الأمان

### 4.1 لا يوجد rate limiting للـ API
**الموقع:** `lib/api.ts`

**السبب:**
- عرضة للهجمات (DDoS, brute force)
- استهلاك زائد للموارد

**الحل:**
إضافة rate limiting على مستوى API:
```ts
// middleware/rateLimit.ts
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function rateLimit(ip: string) {
  const current = rateLimitCache.get(ip) as number || 0;
  if (current > 10) return false; // exceeded
  rateLimitCache.set(ip, current + 1);
  return true;
}
```

---

### 4.2 عدم تشفير البيانات الحساسة في localStorage
**الموقع:** `lib/cart.tsx:32-38`

**السبب:**
- بيانات السلة مخزنة بدون تشفير
- عرضة للـ XSS attacks

**الحل:**
```tsx
import CryptoJS from 'crypto-js';

const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, process.env.NEXT_PUBLIC_STORAGE_KEY!).toString();
};

const decrypt = (encrypted: string) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, process.env.NEXT_PUBLIC_STORAGE_KEY!);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

---

### 4.3 لا يوجد Content Security Policy
**الموقع:** غير موجود

**السبب:**
- عرضة لهجمات XSS
- تحميل scripts من مصادر غير موثوقة

**الحل:**
```ts
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://*.unsplash.com data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.storshoes.ma",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

---

## 5. إمكانية الوصول (Accessibility)

### 5.1 لا يوجد ARIA labels كافية
**الموقع:** جميع المكونات

**السبب:**
- صعوبة استخدام الموقع لذوي الاحتياجات الخاصة
- مخالفة معايير WCAG
- تأثير سلبي على SEO

**الحل:**
```tsx
// Header.tsx
<button 
  onClick={() => setSearchOpen(true)}
  aria-label="Open search"
  aria-expanded={searchOpen}
>
  <SearchIcon />
</button>

// ProductCard.tsx
<div role="article" aria-label={`Product: ${product.name}`}>
  <img alt={product.images[0].alt || product.name} />
</div>
```

---

### 5.2 لا يوجد skip to content link
**الموقع:** `layout.tsx`

**السبب:**
- صعوبة التنقل باستخدام keyboard

**الحل:**
```tsx
// layout.tsx
<body>
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
  <main id="main-content">
    {children}
  </main>
</body>

// CSS
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}
.skip-link:focus {
  top: 0;
}
```

---

## 6. الأخطاء البرمجية والقضايا التقنية

### 6.1 استخدام `any` بشكل مفرط
**الموقع:** جميع الصفحات تقريباً

**السبب:**
- فقدان مزايا TypeScript
- صعوبة في اكتشاف الأخطاء
- صعوبة في الصيانة

**الحل:**
تعريف interfaces واضحة:
```ts
// types/product.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  colorHex?: string;
  stock: number;
}
```

---

### 6.2 لا يوجد معالجة أخطاء للـ API
**الموقع:** `lib/api.ts:4-10`

**السبب:**
- أي خطأ في API يمكن أن يعطل التطبيق
- تجربة مستخدم سيئة

**الحل:**
```ts
export async function fetchApi(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new ApiError(res.status, error.message || 'API Error');
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Network error');
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```

---

### 6.3 Contact form لا يرسل بيانات فعلياً
**الموقع:** `contact/page.tsx:12-16`

**السبب:**
- النموذج يعرض فقط رسالة نجاح وهمية بعد 1.5 ثانية
- لا يوجد اتصال فعلي بالـ API

**الحل:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('submitting');
  
  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    if (!res.ok) throw new Error('Failed to send');
    setStatus('success');
  } catch {
    setStatus('');
    alert('Erreur lors de l\'envoi du message');
  }
};
```

---

## 7. الميزات المفقودة

### 7.1 لا يوجد نظام مراجعة وتقييم للمنتجات
**الحالة:** غير موجود

**السبب:**
- المستخدمون لا يمكنهم رؤية آراء الآخرين
- انخفاض الثقة في المنتجات

**الحل:**
إضافة مكون Reviews مع:
- عرض متوسط التقييم
- قائمة المراجعات
- نموذج إضافة مراجعة جديدة

---

### 7.2 لا يوجد خاصية البحث المتقدم
**الموقع:** `products/page.tsx`

**الحل:**
إضافة فلاتر متقدمة:
- السعر (min/max)
- الماركة
- المقاس
- اللون
- نطاق التاريخ

---

### 7.3 لا يوجد صفحة تتبع الطلبات
**الحالة:** غير موجود

**الحل:**
إنشاء صفحة `/track-order` مع:
- إدخال رقم الطلب ورقم الهاتف
- عرض حالة الطلب (معلق، تم التأكيد، في الشحن، تم التسليم)
- timeline للخطوات

---

### 7.4 لا يوجد خاصية مقارنة المنتجات
**الحالة:** غير موجود

**الحل:**
إضافة Compare mode:
- اختيار حتى 3 منتجات للمقارنة
- جدول مقارنة بالمواصفات

---

## 8. التوصيات العاجلة

### أولوية عالية:
1. ✅ استخدام `next/image` بدلاً من `<img>`
2. ✅ إضافة Error Boundaries
3. ✅ تحسين SEO (metadata، sitemap، structured data)
4. ✅ إصلاح Contact form (إضافة API endpoint)

### أولوية متوسطة:
5. ✅ إضافة Wishlist
6. ✅ إضافة Reviews
7. ✅ إضافة Breadcrumbs
8. ✅ تحسين Pagination

### أولوية منخفضة:
9. ✅ إضافة Compare Products
10. ✅ إضافة Order Tracking
11. ✅ تحسين Accessibility
12. ✅ إضافة CSP headers

---

## ملخص الملفات التي تحتاج تعديل

| الملف | النقاط التي تحتاج تحسين |
|-------|------------------------|
| `page.tsx` | استخدام next/image، إضافة loading states |
| `layout.tsx` | تحسين metadata، إضافة CSP |
| `products/page.tsx` | Pagination، فلاتر متقدمة |
| `products/[slug]/page.tsx` | Breadcrumbs، Reviews، Structured data |
| `cart/page.tsx` | تحسين UX |
| `commande/page.tsx` | تحسين التحقق من البيانات |
| `contact/page.tsx` | ربط بـ API فعلي |
| `lib/api.ts` | إضافة error handling |
| `lib/cart.tsx` | تشفير البيانات |
| جميع المكونات | ARIA labels، استخدام Tailwind |

---

## الخاتمة

الموقع يمتلك أساساً جيداً ولكن يحتاج إلى تحسينات جوهرية في:
- **الأداء:** استخدام next/image، تحسين CSS
- **SEO:** metadata، sitemap، structured data
- **UX:** loading states، error handling
- **الأمان:** CSP، rate limiting
- **الميزات:** Wishlist، Reviews، Order Tracking

**الوقت المقدر للتنفيذ:** 3-5 أيام عمل
