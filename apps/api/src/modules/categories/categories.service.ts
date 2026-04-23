import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugifyLib from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return categories.map((c) => ({
      ...c,
      productCount: c._count.products,
      _count: undefined,
    }));
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('التصنيف غير موجود');
    return { ...category, productCount: category._count.products };
  }

  async create(data: { name: string; nameAr?: string; description?: string; image?: string; isActive?: boolean }) {
    const slug = slugifyLib(data.name, { lower: true, strict: true });
    return this.prisma.category.create({
      data: { ...data, slug, isActive: data.isActive ?? true },
    });
  }

  async update(id: string, data: { name?: string; nameAr?: string; description?: string; image?: string; isActive?: boolean }) {
    await this.findById(id);
    const updateData: any = { ...data };
    if (data.name) updateData.slug = slugifyLib(data.name, { lower: true, strict: true });
    return this.prisma.category.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.category.update({ where: { id }, data: { isActive: false } });
  }
}
