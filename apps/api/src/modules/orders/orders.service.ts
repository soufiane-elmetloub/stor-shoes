import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SS-${y}${m}-${r}`;
  }

  async create(dto: {
    customer: { firstName: string; lastName: string; phone: string; email?: string; city?: string; address?: string; instagram?: string };
    items: { productId: string; variantId: string; quantity: number }[];
    shippingCity?: string;
    shippingAddress?: string;
    shippingCost?: number;
    notes?: string;
    source?: 'WEBSITE' | 'INSTAGRAM' | 'MANUAL';
  }) {
    if (!dto.items?.length) throw new BadRequestException('يجب إضافة منتج واحد على الأقل');

    return this.prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer = await tx.customer.findUnique({ where: { phone: dto.customer.phone } });
      if (!customer) {
        customer = await tx.customer.create({ data: dto.customer });
      } else {
        // Keep the customer identity aligned with the latest checkout data entered by the buyer.
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            firstName: dto.customer.firstName || customer.firstName,
            lastName: dto.customer.lastName || customer.lastName,
            city: dto.customer.city ?? customer.city,
            address: dto.customer.address ?? customer.address,
            email: dto.customer.email ?? customer.email,
            instagram: dto.customer.instagram ?? customer.instagram,
          },
        });
      }

      // Calculate prices and validate stock
      let subtotal = new Prisma.Decimal(0);
      const orderItems: any[] = [];

      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) throw new BadRequestException(`المقاس المحدد غير موجود`);
        if (variant.stock < item.quantity) throw new BadRequestException(`المقاس ${variant.size} غير متوفر بالكمية المطلوبة`);

        const price = variant.product.salePrice || variant.product.price;
        subtotal = subtotal.add(new Prisma.Decimal(price.toString()).mul(item.quantity));

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price,
        });

        // Decrease stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const shippingCostValue = Number(dto.shippingCost ?? 0);
      if (!Number.isFinite(shippingCostValue) || shippingCostValue < 0) {
        throw new BadRequestException('قيمة الشحن غير صالحة');
      }
      const shippingCost = new Prisma.Decimal(shippingCostValue.toFixed(2));
      const total = subtotal.add(shippingCost);

      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          customerId: customer.id,
          customerFirstName: dto.customer.firstName?.trim() || customer.firstName,
          customerLastName: dto.customer.lastName?.trim() || customer.lastName,
          customerPhone: dto.customer.phone?.trim() || customer.phone,
          customerCity: dto.customer.city?.trim() || dto.shippingCity || customer.city,
          customerAddress: dto.customer.address?.trim() || dto.shippingAddress || customer.address,
          subtotal,
          shippingCost,
          total,
          status: 'PENDING',
          shippingCity: dto.shippingCity || dto.customer.city,
          shippingAddress: dto.shippingAddress || dto.customer.address,
          notes: dto.notes,
          source: dto.source || 'WEBSITE',
          items: { createMany: { data: orderItems } },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: { include: { images: { take: 1 } } },
              variant: true,
            },
          },
        },
      });

      return order;
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search } },
        { customerFirstName: { contains: query.search, mode: 'insensitive' } },
        { customerLastName: { contains: query.search, mode: 'insensitive' } },
        { customer: { phone: { contains: query.search } } },
        { customer: { firstName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { product: { include: { images: { take: 1 } } }, variant: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: { include: { images: true } }, variant: true } },
      },
    });
    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  async updateStatus(id: string, status: string, notes?: string) {
    const order = await this.findById(id);

    // If cancelling, restore stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: status as any, notes: notes || order.notes },
      include: { customer: true, items: { include: { product: true, variant: true } } },
    });
  }
}
