import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  async getInventory(query: { search?: string; lowStock?: boolean; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true, product: { isActive: true } };
    if (query.lowStock) where.stock = { lte: 3 };
    if (query.search) {
      where.product = {
        ...where.product,
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { brand: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.productVariant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { stock: 'asc' },
        include: {
          product: { include: { images: { take: 1 }, category: true } },
        },
      }),
      this.prisma.productVariant.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateVariant(variantId: string, data: any) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data,
      include: { product: { include: { images: { take: 1 } } } },
    } as any);
  }

  async updateStock(variantId: string, stock: number) {
    return this.updateVariant(variantId, { stock });
  }

  async getLowStockCount() {
    return this.prisma.productVariant.count({
      where: { stock: { lte: 3 }, isActive: true, product: { isActive: true } },
    });
  }
}
