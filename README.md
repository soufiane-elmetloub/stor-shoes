<div align="center">

# 👟 StorShoes

### منصة تجارة إلكترونية متكاملة ومتخصصة في الأحذية
### Full-Stack E-Commerce Platform for Premium Footwear

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)

> منصة E-Commerce احترافية مصممة بنهج **Mobile-First** وتستهدف مستخدمي Instagram —  
> تشتمل على واجهة متجر، لوحة تحكم إدارية كاملة، وـ API قوي.

</div>

---

## 📸 Screenshots

> واجهة المتجر مصممة لتجربة مستخدم سلسة على الهاتف المحمول

| الصفحة الرئيسية | المنتجات | لوحة التحكم |
|:---:|:---:|:---:|
| Mobile-First Hero | Product Grid | Admin Dashboard |

---

## 🏗️ هيكل المشروع — Monorepo Architecture

```
StorShoes/
├── apps/
│   ├── storefront/          → Next.js 14  (واجهة المتجر — المنفذ 3000)
│   ├── admin/               → React + Vite (لوحة الإدارة  — المنفذ 5173)
│   └── api/                 → NestJS       (الخلفية & API — المنفذ 3001)
├── packages/
│   └── shared/              → Shared TypeScript types & utilities
├── docker-compose.yml       → PostgreSQL 16 container
├── pnpm-workspace.yaml      → Workspace configuration
└── .env.example             → Environment variables template
```

---

## 🛠️ التقنيات المستخدمة — Tech Stack

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| **Storefront** | Next.js + TypeScript | 14 / 5 |
| **Admin Panel** | React + Vite | 19 / 5 |
| **Backend API** | NestJS + TypeScript | 10 / 5 |
| **Database ORM** | Prisma | 5 |
| **Database** | PostgreSQL | 16 |
| **Authentication** | JWT (JSON Web Tokens) | — |
| **API Docs** | Swagger / OpenAPI | — |
| **Package Manager** | pnpm (workspaces) | 9 |
| **Containerization** | Docker & Docker Compose | — |

---

## ✨ الميزات الرئيسية — Features

### 🛍️ واجهة المتجر (Storefront)
- ✅ صفحة رئيسية جذابة — Dynamic Hero + Best Sellers + Categories
- ✅ Horizontal scroll للتصنيفات (Mobile-optimized)
- ✅ تصفح المنتجات مع فلاتر متقدمة (فئة، سعر، مقاس)
- ✅ صفحة تفاصيل المنتج (اختيار المقاس واللون + معرض صور)
- ✅ سلة التسوق (Cart) مع تعديل الكميات
- ✅ Wishlist — قائمة المفضلة
- ✅ نموذج إتمام الطلب مع التحقق من المدخلات
- ✅ تصميم Mobile-First بالكامل
- ✅ SEO محسّن (Meta tags, Open Graph, Structured Data)
- ✅ Autocomplete Search في الهيدر
- ✅ SSR (Server-Side Rendering) لتحسين الأداء

### 📊 لوحة التحكم الإدارية (Admin Dashboard)
- ✅ لوحة إحصائيات مع رسوم بيانية
- ✅ إدارة المنتجات (CRUD + رفع الصور)
- ✅ إدارة المخزون والمتغيرات (مقاس + لون + كمية)
- ✅ إدارة الطلبات وتتبع حالاتها
- ✅ إدارة التصنيفات
- ✅ تقارير المبيعات التفصيلية
- ✅ أرشيف المنتجات
- ✅ نظام مصادقة JWT

---

## 🚀 البدء السريع — Getting Started

### المتطلبات الأساسية
- **Node.js** >= 18.x
- **pnpm** >= 9.x → `npm install -g pnpm`
- **Docker & Docker Compose** (لقاعدة البيانات)

---

### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/USERSOUFIANE/StorShoes.git
cd StorShoes
```

### 2️⃣ إعداد متغيرات البيئة

```bash
cp .env.example .env
# ثم عدّل الملف .env بالقيم المناسبة
```

### 3️⃣ تشغيل قاعدة البيانات (Docker)

```bash
docker-compose up -d
```

### 4️⃣ تثبيت التبعيات

```bash
# من مجلد الـ API
cd apps/api
npm install

# إنشاء جداول قاعدة البيانات
npx prisma migrate dev --name init

# (اختياري) إضافة بيانات تجريبية
npx ts-node prisma/seed.ts

cd ../..
```

### 5️⃣ تشغيل المشاريع

افتح **3 نوافذ Terminal** بجانب بعضها:

```bash
# Terminal 1 — API Backend (Port 3001)
cd apps/api && npm run start:dev

# Terminal 2 — Storefront (Port 3000)
cd apps/storefront && npm run dev

# Terminal 3 — Admin Panel (Port 5173)
cd apps/admin && npm run dev
```

### 6️⃣ الوصول للتطبيقات

| التطبيق | الرابط | الوصف |
|---------|--------|-------|
| 🛍️ **واجهة المتجر** | http://localhost:3000 | المتجر الإلكتروني |
| 📊 **لوحة التحكم** | http://localhost:5173 | إدارة المتجر |
| 📚 **API Docs** | http://localhost:3001/api/docs | Swagger UI |

#### بيانات الدخول للإدارة
```
البريد الإلكتروني : admin@storshoes.com
كلمة المرور      : Admin@123456
```

---

## 📚 API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | جلب قائمة المنتجات (مع pagination) |
| `GET` | `/api/products/featured` | المنتجات المميزة |
| `GET` | `/api/products/slug/:slug` | منتج بالـ slug |
| `POST` | `/api/products` | إضافة منتج *(Admin)* |
| `PATCH` | `/api/products/:id` | تعديل منتج *(Admin)* |
| `DELETE` | `/api/products/:id` | حذف منتج *(Admin)* |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | جلب جميع التصنيفات |
| `POST` | `/api/categories` | إضافة تصنيف *(Admin)* |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | إنشاء طلب جديد |
| `GET` | `/api/orders` | جلب جميع الطلبات *(Admin)* |
| `PATCH` | `/api/orders/:id/status` | تحديث حالة الطلب *(Admin)* |

### Auth & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | تسجيل الدخول (JWT) |
| `GET` | `/api/reports/overview` | إحصائيات الداشبورد *(Admin)* |
| `GET` | `/api/reports/sales` | تقرير المبيعات *(Admin)* |

---

## 🌿 Git Branching Strategy

```
main        → production-ready code (مستقر للإنتاج)
develop     → integration branch  (تجميع الميزات)
feature/*   → new features        (ميزات جديدة)
fix/*       → bug fixes           (إصلاح الأخطاء)
```

**مثال:**
```bash
git checkout develop
git checkout -b feature/product-reviews
# ... العمل ...
git push origin feature/product-reviews
# ثم فتح Pull Request نحو develop
```

---

## 📁 هيكل الملفات التفصيلي

<details>
<summary>📂 apps/storefront (Next.js)</summary>

```
src/
├── app/
│   ├── (shop)/
│   │   ├── page.tsx         → الصفحة الرئيسية
│   │   ├── products/        → قائمة المنتجات + تفاصيل
│   │   ├── cart/            → سلة التسوق
│   │   ├── wishlist/        → المفضلة
│   │   └── commande/        → إتمام الطلب
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── DynamicHero.tsx      → Hero section
│   ├── CategoryCircles.tsx  → Categories scroll
│   ├── BestSellers.tsx      → Featured products
│   ├── Header.tsx           → Navigation + Search
│   └── Footer.tsx
└── lib/
    ├── api.ts               → API client
    ├── cart.ts              → Cart context
    └── wishlist.ts          → Wishlist context
```
</details>

<details>
<summary>📂 apps/api (NestJS)</summary>

```
src/
├── auth/          → JWT Authentication
├── products/      → Products CRUD
├── categories/    → Categories CRUD
├── orders/        → Orders management
├── inventory/     → Stock management
├── reports/       → Sales analytics
└── uploads/       → File upload handling
prisma/
├── schema.prisma  → Database models
└── seed.ts        → Seed data
```
</details>

<details>
<summary>📂 apps/admin (React + Vite)</summary>

```
src/
├── pages/
│   ├── DashboardPage.tsx
│   ├── ProductsPage.tsx
│   ├── OrdersPage.tsx
│   ├── InventoryPage.tsx
│   ├── CategoriesPage.tsx
│   └── ReportsPage.tsx
├── components/
└── lib/
    └── api/       → API hooks
```
</details>

---

## 🔧 متغيرات البيئة — Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/storshoes

# JWT
JWT_SECRET=your-super-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Uploads
UPLOAD_DIR=./uploads
```

---

## 🐳 Docker

```bash
# تشغيل PostgreSQL فقط
docker-compose up -d postgres

# إيقاف كل شيء
docker-compose down

# إيقاف وحذف البيانات
docker-compose down -v
```

---

## 🤝 المساهمة — Contributing

1. Fork المشروع
2. أنشئ branch جديد: `git checkout -b feature/amazing-feature`
3. Commit التغييرات: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. افتح Pull Request نحو `develop`

### Commit Message Convention
```
feat:     ميزة جديدة
fix:      إصلاح خطأ
docs:     تحديث التوثيق
style:    تنسيق الكود
refactor: إعادة هيكلة
perf:     تحسين الأداء
test:     إضافة اختبارات
```

---

## 📄 الترخيص — License

**StorShoes** © 2026 — Soufiane Elmetloub. جميع الحقوق محفوظة.

---

<div align="center">

صُنع بـ ❤️ في المغرب 🇲🇦

</div>
