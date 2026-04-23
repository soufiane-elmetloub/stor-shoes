import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@storshoes.com' },
    update: {},
    create: {
      email: 'admin@storshoes.com',
      password: hashedPassword,
      name: 'مدير المتجر',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sneakers' },
      update: {},
      create: { name: 'Sneakers', nameAr: 'أحذية رياضية', slug: 'sneakers', description: 'أحذية رياضية عصرية ومريحة', image: '/images/categories/sneakers.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'formal' },
      update: {},
      create: { name: 'Formal', nameAr: 'أحذية رسمية', slug: 'formal', description: 'أحذية رسمية أنيقة', image: '/images/categories/formal.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'boots' },
      update: {},
      create: { name: 'Boots', nameAr: 'بوت', slug: 'boots', description: 'أحذية بوت متينة وعصرية', image: '/images/categories/boots.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'sandals' },
      update: {},
      create: { name: 'Sandals', nameAr: 'صنادل', slug: 'sandals', description: 'صنادل مريحة للصيف', image: '/images/categories/sandals.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: { name: 'Sports', nameAr: 'أحذية رياضية احترافية', slug: 'sports', description: 'أحذية رياضية للتمارين', image: '/images/categories/sports.jpg' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create Products
  const products = [
    {
      name: 'Nike Air Max 90',
      nameAr: 'نايك اير ماكس 90',
      slug: 'nike-air-max-90',
      description: 'حذاء رياضي كلاسيكي بتصميم عصري. يتميز بتقنية Air Max للراحة القصوى.',
      brand: 'Nike',
      price: 899,
      salePrice: 749,
      categoryId: categories[0].id,
      tags: ['nike', 'air-max', 'classic'],
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Nike Air Max 90 - Red', order: 0 },
        { url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', alt: 'Nike Air Max 90 - Side', order: 1 },
      ],
      variants: [
        { size: '40', color: 'أحمر', colorHex: '#DC2626', sku: 'NAM90-40-RED', stock: 8 },
        { size: '41', color: 'أحمر', colorHex: '#DC2626', sku: 'NAM90-41-RED', stock: 12 },
        { size: '42', color: 'أحمر', colorHex: '#DC2626', sku: 'NAM90-42-RED', stock: 15 },
        { size: '43', color: 'أحمر', colorHex: '#DC2626', sku: 'NAM90-43-RED', stock: 10 },
        { size: '44', color: 'أحمر', colorHex: '#DC2626', sku: 'NAM90-44-RED', stock: 6 },
        { size: '41', color: 'أسود', colorHex: '#000000', sku: 'NAM90-41-BLK', stock: 10 },
        { size: '42', color: 'أسود', colorHex: '#000000', sku: 'NAM90-42-BLK', stock: 14 },
        { size: '43', color: 'أسود', colorHex: '#000000', sku: 'NAM90-43-BLK', stock: 8 },
      ],
    },
    {
      name: 'Adidas Ultraboost 23',
      nameAr: 'أديداس الترابوست 23',
      slug: 'adidas-ultraboost-23',
      description: 'حذاء رياضي بتقنية Boost للطاقة المرتدة. مثالي للجري.',
      brand: 'Adidas',
      price: 1099,
      categoryId: categories[0].id,
      tags: ['adidas', 'ultraboost', 'running'],
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', alt: 'Adidas Ultraboost', order: 0 },
      ],
      variants: [
        { size: '40', color: 'أبيض', colorHex: '#FFFFFF', sku: 'AUB23-40-WHT', stock: 10 },
        { size: '41', color: 'أبيض', colorHex: '#FFFFFF', sku: 'AUB23-41-WHT', stock: 15 },
        { size: '42', color: 'أبيض', colorHex: '#FFFFFF', sku: 'AUB23-42-WHT', stock: 20 },
        { size: '43', color: 'أبيض', colorHex: '#FFFFFF', sku: 'AUB23-43-WHT', stock: 12 },
        { size: '44', color: 'أسود', colorHex: '#000000', sku: 'AUB23-44-BLK', stock: 8 },
      ],
    },
    {
      name: 'Classic Oxford Leather',
      nameAr: 'أكسفورد كلاسيك جلد',
      slug: 'classic-oxford-leather',
      description: 'حذاء رسمي من الجلد الطبيعي. مثالي للمناسبات الرسمية والعمل.',
      brand: 'StorShoes',
      price: 1299,
      salePrice: 999,
      categoryId: categories[1].id,
      tags: ['formal', 'leather', 'oxford'],
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600', alt: 'Oxford Leather', order: 0 },
      ],
      variants: [
        { size: '40', color: 'بني', colorHex: '#8B4513', sku: 'COL-40-BRN', stock: 5 },
        { size: '41', color: 'بني', colorHex: '#8B4513', sku: 'COL-41-BRN', stock: 8 },
        { size: '42', color: 'بني', colorHex: '#8B4513', sku: 'COL-42-BRN', stock: 12 },
        { size: '43', color: 'أسود', colorHex: '#000000', sku: 'COL-43-BLK', stock: 10 },
        { size: '44', color: 'أسود', colorHex: '#000000', sku: 'COL-44-BLK', stock: 6 },
      ],
    },
    {
      name: 'Urban Combat Boot',
      nameAr: 'بوت أوربان كومبات',
      slug: 'urban-combat-boot',
      description: 'بوت عصري بتصميم عسكري. مقاوم للماء ومتين.',
      brand: 'StorShoes',
      price: 1499,
      categoryId: categories[2].id,
      tags: ['boots', 'urban', 'waterproof'],
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600', alt: 'Combat Boot', order: 0 },
      ],
      variants: [
        { size: '41', color: 'أسود', colorHex: '#000000', sku: 'UCB-41-BLK', stock: 7 },
        { size: '42', color: 'أسود', colorHex: '#000000', sku: 'UCB-42-BLK', stock: 12 },
        { size: '43', color: 'أسود', colorHex: '#000000', sku: 'UCB-43-BLK', stock: 9 },
        { size: '44', color: 'بني', colorHex: '#8B4513', sku: 'UCB-44-BRN', stock: 5 },
      ],
    },
    {
      name: 'Nike Air Jordan 1 Retro',
      nameAr: 'نايك اير جوردان 1 ريترو',
      slug: 'nike-air-jordan-1-retro',
      description: 'الحذاء الأسطوري. تصميم كلاسيكي يجمع بين الأناقة والراحة.',
      brand: 'Nike',
      price: 1399,
      categoryId: categories[0].id,
      tags: ['nike', 'jordan', 'retro', 'classic'],
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600', alt: 'Air Jordan 1', order: 0 },
      ],
      variants: [
        { size: '40', color: 'أحمر', colorHex: '#DC2626', sku: 'AJ1R-40-RED', stock: 4 },
        { size: '41', color: 'أحمر', colorHex: '#DC2626', sku: 'AJ1R-41-RED', stock: 8 },
        { size: '42', color: 'أحمر', colorHex: '#DC2626', sku: 'AJ1R-42-RED', stock: 10 },
        { size: '43', color: 'أحمر', colorHex: '#DC2626', sku: 'AJ1R-43-RED', stock: 6 },
      ],
    },
    {
      name: 'Summer Comfort Sandal',
      nameAr: 'صندل الراحة الصيفي',
      slug: 'summer-comfort-sandal',
      description: 'صندل مريح بتصميم أنيق. مثالي للأيام الحارة.',
      brand: 'StorShoes',
      price: 399,
      salePrice: 299,
      categoryId: categories[3].id,
      tags: ['sandals', 'summer', 'comfort'],
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600', alt: 'Summer Sandal', order: 0 },
      ],
      variants: [
        { size: '40', color: 'بيج', colorHex: '#D4A574', sku: 'SCS-40-BEG', stock: 15 },
        { size: '41', color: 'بيج', colorHex: '#D4A574', sku: 'SCS-41-BEG', stock: 20 },
        { size: '42', color: 'أسود', colorHex: '#000000', sku: 'SCS-42-BLK', stock: 18 },
        { size: '43', color: 'أسود', colorHex: '#000000', sku: 'SCS-43-BLK', stock: 12 },
      ],
    },
    {
      name: 'Puma RS-X Reinvention',
      nameAr: 'بوما آر إس إكس',
      slug: 'puma-rs-x-reinvention',
      description: 'حذاء رياضي بتصميم bold وألوان جريئة. مستوحى من أحذية الجري الكلاسيكية.',
      brand: 'Puma',
      price: 799,
      categoryId: categories[4].id,
      tags: ['puma', 'rs-x', 'sport'],
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600', alt: 'Puma RS-X', order: 0 },
      ],
      variants: [
        { size: '40', color: 'أزرق', colorHex: '#1E40AF', sku: 'PRSX-40-BLU', stock: 10 },
        { size: '41', color: 'أزرق', colorHex: '#1E40AF', sku: 'PRSX-41-BLU', stock: 14 },
        { size: '42', color: 'أزرق', colorHex: '#1E40AF', sku: 'PRSX-42-BLU', stock: 16 },
        { size: '43', color: 'أزرق', colorHex: '#1E40AF', sku: 'PRSX-43-BLU', stock: 8 },
      ],
    },
    {
      name: 'New Balance 574',
      nameAr: 'نيو بالانس 574',
      slug: 'new-balance-574',
      description: 'حذاء كلاسيكي يجمع بين الأناقة والراحة. الخيار الأمثل للاستخدام اليومي.',
      brand: 'New Balance',
      price: 699,
      categoryId: categories[0].id,
      tags: ['new-balance', '574', 'classic'],
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600', alt: 'New Balance 574', order: 0 },
      ],
      variants: [
        { size: '40', color: 'رمادي', colorHex: '#808080', sku: 'NB574-40-GRY', stock: 12 },
        { size: '41', color: 'رمادي', colorHex: '#808080', sku: 'NB574-41-GRY', stock: 18 },
        { size: '42', color: 'رمادي', colorHex: '#808080', sku: 'NB574-42-GRY', stock: 22 },
        { size: '43', color: 'كحلي', colorHex: '#1E3A5F', sku: 'NB574-43-NVY', stock: 10 },
        { size: '44', color: 'كحلي', colorHex: '#1E3A5F', sku: 'NB574-44-NVY', stock: 7 },
      ],
    },
  ];

  for (const product of products) {
    const { images, variants, ...productData } = product;
    const existingProduct = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (!existingProduct) {
      await prisma.product.create({
        data: {
          ...productData,
          images: { createMany: { data: images } },
          variants: { createMany: { data: variants } },
        },
      });
      console.log(`  ✅ Product: ${product.name}`);
    }
  }

  // Create sample customers
  const customer1 = await prisma.customer.upsert({
    where: { phone: '0612345678' },
    update: {},
    create: {
      firstName: 'أحمد',
      lastName: 'المنصوري',
      phone: '0612345678',
      email: 'ahmed@example.com',
      city: 'الدار البيضاء',
      address: 'شارع الحسن الثاني، رقم 45',
      instagram: '@ahmed_shoes',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { phone: '0698765432' },
    update: {},
    create: {
      firstName: 'سارة',
      lastName: 'العلوي',
      phone: '0698765432',
      city: 'الرباط',
      address: 'حي أكدال، شارع النخيل',
      instagram: '@sara_style',
    },
  });
  console.log('✅ Sample customers created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin login: admin@storshoes.com / Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
