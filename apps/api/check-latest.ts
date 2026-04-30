import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function checkLatest() {
  const products = await prisma.product.findMany({ take: 2, orderBy: { createdAt: 'desc' }, include: { images: true } });
  console.log(JSON.stringify(products.map(p => ({ id: p.id, name: p.name, images: p.images.map(i => i.url) })), null, 2));
}
checkLatest().catch(console.error).finally(() => prisma.$disconnect());
