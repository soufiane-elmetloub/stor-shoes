import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const brandNames = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Asics', 'Vans', 'Converse'];
const baseNamesEn = ['Air Pro', 'Street Runner', 'Retro Classic', 'Boost X', 'Glide Max', 'Zoom Strike', 'Urban Walker', 'Force One', 'Lite V2'];
const baseNamesAr = ['اير برو', 'ستريت رانر', 'ريترو كلاسيك', 'بوست اكس', 'جلايد ماكس', 'زوم سترايك', 'أوربان ووكر', 'فورس وان', 'لايت الاصدار الثاني'];

const placeholderImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600'
];

async function main() {
  console.log('Finding or creating category...');
  let category = await prisma.category.findFirst({
    where: { name: { contains: 'sneakers', mode: 'insensitive' } }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Sneakers',
        nameAr: 'أحذية رياضية',
        slug: 'sneakers',
        description: 'Testing sneakers category'
      }
    });
  }

  console.log(`Using Category ID: ${category.id}`);
  console.log('Generating 36 products...');

  for (let i = 1; i <= 36; i++) {
    const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
    const nounIndex = Math.floor(Math.random() * baseNamesEn.length);
    const name = `${brand} ${baseNamesEn[nounIndex]} V${Math.floor(Math.random() * 5) + 1}`;
    const nameAr = `حذاء ${baseNamesAr[nounIndex]} ${brand}`;
    
    // Random price between 200 and 1500
    const price = Math.floor(Math.random() * 1300) + 200;
    // 30% chance for a sale price
    const hasSale = Math.random() > 0.7;
    const salePrice = hasSale ? Math.floor(price * 0.8) : undefined;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const product = await prisma.product.create({
      data: {
        name,
        nameAr,
        slug,
        description: `Experience the comfort and style of ${name}. Perfect for urban environments and daily wear.\n\nاستمتع براحة وأناقة ${nameAr}، مثالي للاستخدام اليومي.`,
        brand,
        price,
        salePrice,
        categoryId: category.id,
        isFeatured: Math.random() > 0.8,
        images: {
          create: [
            {
              url: placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
              alt: name,
              order: 0
            }
          ]
        },
        variants: {
          create: [
            { size: '40', color: 'White', sku: `${slug}-40-wh`, stock: Math.floor(Math.random() * 20) + 1 },
            { size: '41', color: 'White', sku: `${slug}-41-wh`, stock: Math.floor(Math.random() * 20) + 1 },
            { size: '42', color: 'White', sku: `${slug}-42-wh`, stock: Math.floor(Math.random() * 20) + 1 },
            { size: '43', color: 'White', sku: `${slug}-43-wh`, stock: Math.floor(Math.random() * 20) + 1 },
          ]
        }
      }
    });

    console.log(`Created product ${i}/36: ${product.name}`);
  }

  console.log('✅ Successfully seeded 36 products for testing!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
