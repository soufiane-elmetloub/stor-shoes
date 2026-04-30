import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const RAILWAY_UPLOAD_URL = 'https://api-production-ba03.up.railway.app/api/uploads/image';

async function migrateImages() {
  console.log('Fetching broken images...');
  const images = await prisma.productImage.findMany({
    where: { url: { startsWith: '/uploads/' } }
  });

  for (const img of images) {
    const localPath = path.join(process.cwd(), '../../uploads', path.basename(img.url));
    if (!fs.existsSync(localPath)) continue;

    const fileBuffer = fs.readFileSync(localPath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const form = new FormData();
    form.append('file', blob, path.basename(img.url));

    try {
      const response = await fetch(RAILWAY_UPLOAD_URL, { method: 'POST', body: form });
      const data = await response.json();
      if (data.url && data.url.startsWith('http')) {
        await prisma.productImage.update({ where: { id: img.id }, data: { url: data.url } });
        console.log(`✅ Fixed! New URL: ${data.url}`);
      }
    } catch (err) {}
  }

  const variants = await prisma.productVariant.findMany({
    where: { imageUrl: { startsWith: '/uploads/' } }
  });

  for (const v of variants) {
    const localPath = path.join(process.cwd(), '../../uploads', path.basename(v.imageUrl));
    if (!fs.existsSync(localPath)) continue;

    const fileBuffer = fs.readFileSync(localPath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const form = new FormData();
    form.append('file', blob, path.basename(v.imageUrl));

    try {
      const response = await fetch(RAILWAY_UPLOAD_URL, { method: 'POST', body: form });
      const data = await response.json();
      if (data.url && data.url.startsWith('http')) {
        await prisma.productVariant.update({ where: { id: v.id }, data: { imageUrl: data.url } });
        console.log(`✅ Fixed variant! New URL: ${data.url}`);
      }
    } catch (err) {}
  }
}

migrateImages().catch(console.error).finally(() => prisma.$disconnect());
