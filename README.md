# 👟 StorShoes - منصة تجارة إلكترونية متكاملة للأحذية

> منصة E-commerce احترافية متخصصة في بيع الأحذية، مصممة بنهج Mobile-First وتستهدف مستخدمي Instagram.

## 🏗️ هيكل المشروع (Monorepo)

```
StorShoes/
├── apps/
│   ├── storefront/     → Next.js 14 (واجهة المتجر - Mobile First)
│   ├── admin/          → React + Vite (لوحة التحكم الإدارية)
│   └── api/            → NestJS (الخلفية + API)
├── packages/
│   └── shared/         → أنواع TypeScript وأدوات مشتركة
├── docker-compose.yml  → PostgreSQL Database
└── .env               → متغيرات البيئة
```

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| **واجهة المتجر** | Next.js 14 + Tailwind CSS |
| **لوحة التحكم** | React 19 + Vite + Tailwind CSS |
| **الخلفية** | NestJS + Prisma ORM |
| **قاعدة البيانات** | PostgreSQL 16 |
| **المصادقة** | JWT (JSON Web Tokens) |
| **التوثيق** | Swagger (OpenAPI) |

## 🚀 البدء السريع

### المتطلبات
- Node.js >= 18
- Docker & Docker Compose
- npm

### 1. إعداد البيئة
```bash
# نسخ ملف البيئة
cp .env.example .env
```

### 2. تشغيل قاعدة البيانات
```bash
docker-compose up -d
```

### 3. تثبيت التبعيات وإعداد قاعدة البيانات
```bash
# تثبيت تبعيات API
cd apps/api && npm install

# إنشاء الجداول
npx prisma migrate dev --name init

# إضافة البيانات التجريبية
npx ts-node prisma/seed.ts

cd ../..
```

### 4. تشغيل المشاريع

```bash
# Terminal 1: API (Port 3001)
cd apps/api && npm run start:dev

# Terminal 2: Storefront (Port 3000)
cd apps/storefront && npm run dev

# Terminal 3: Admin Dashboard (Port 5173)
cd apps/admin && npm run dev
```

### 5. الوصول

| التطبيق | الرابط |
|---------|--------|
| **واجهة المتجر** | http://localhost:3000 |
| **لوحة التحكم** | http://localhost:5173 |
| **API Docs** | http://localhost:3001/api/docs |

### بيانات الدخول للإدارة
- **البريد**: admin@storshoes.com
- **كلمة المرور**: Admin@123456

## 📚 API Endpoints

| المسار | الوصف |
|--------|-------|
| `GET /api/products` | قائمة المنتجات |
| `GET /api/products/featured` | المنتجات المميزة |
| `GET /api/products/slug/:slug` | منتج بالـ slug |
| `GET /api/categories` | التصنيفات |
| `POST /api/orders` | إنشاء طلب |
| `POST /api/auth/login` | تسجيل دخول الإدارة |
| `GET /api/reports/overview` | إحصائيات لوحة التحكم |

## 📁 الميزات

### واجهة المتجر 🛍️
- ✅ صفحة رئيسية جذابة (Hero + Featured + Categories)
- ✅ تصفح المنتجات مع فلاتر متقدمة
- ✅ صفحة تفاصيل المنتج مع اختيار المقاس واللون
- ✅ سلة تسوق متكاملة
- ✅ نموذج إتمام الطلب
- ✅ تصميم Mobile-First
- ✅ SEO محسّن

### لوحة التحكم 📊
- ✅ لوحة إحصائيات مع رسوم بيانية
- ✅ إدارة المنتجات (CRUD)
- ✅ إدارة الطلبات وتتبع حالاتها
- ✅ إدارة المخزون
- ✅ إدارة التصنيفات
- ✅ تقارير المبيعات

## 📄 الترخيص
StorShoes © 2026. جميع الحقوق محفوظة.
