import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany();
  for (const v of variants) {
    if (v.size.includes(',') || v.size.includes('،')) {
      console.log(`Found broken variant size: "${v.size}" in Product ID: ${v.productId}`);
      const sizes = v.size.split(/[,،-]/).map(s => s.trim()).filter(Boolean);
      
      // Delete the broken one
      await prisma.productVariant.delete({ where: { id: v.id } });
      
      // Create new ones
      for (const s of sizes) {
        await prisma.productVariant.create({
          data: {
            productId: v.productId,
            size: s,
            sku: `SKU-${Date.now().toString(36).toUpperCase()}-${s}`,
            stock: v.stock
          }
        });
        console.log(`Created size ${s} for Product ID: ${v.productId}`);
      }
    }
  }
  console.log('Done fixing variants.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
