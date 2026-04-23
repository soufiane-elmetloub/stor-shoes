import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugifyLib from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) {
      where.isActive = String(query.isActive) === 'true' || String(query.isActive) === '1' || query.isActive === true;
    }
    if (query.isFeatured !== undefined) {
      where.isFeatured = String(query.isFeatured) === 'true' || String(query.isFeatured) === '1' || query.isFeatured === true;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameAr: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }
    if (query.size) {
      where.variants = { some: { size: query.size, stock: { gt: 0 } } };
    }
    if (query.color) {
      where.variants = {
        ...where.variants,
        some: { ...where.variants?.some, color: query.color },
      };
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { where: { isActive: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
        variants: { where: { isActive: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { size: 'asc' } },
      },
    });

    if (!product) throw new NotFoundException('المنتج غير موجود');

    // Increment view count
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('المنتج غير موجود');
    return product;
  }

  async create(dto: CreateProductDto) {
    let baseSlug = slugifyLib(dto.name, { lower: true, strict: true });
    if (!baseSlug) baseSlug = 'product';
    const slug = `${baseSlug}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.product.create({
      data: {
        name: dto.name,
        nameAr: dto.nameAr,
        slug,
        description: dto.description,
        brand: dto.brand,
        price: dto.price,
        salePrice: dto.salePrice,
        categoryId: dto.categoryId,
        tags: dto.tags || [],
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        images: dto.images?.length
          ? { createMany: { data: dto.images.map((img, i) => ({ url: img.url, alt: img.alt, order: i })) } }
          : undefined,
        variants: dto.variants?.length
          ? { createMany: { data: dto.variants } }
          : undefined,
      },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);

    const data: any = { ...dto };
    delete data.images;
    delete data.variants;

    if (dto.name) {
      let baseSlug = slugifyLib(dto.name, { lower: true, strict: true });
      if (!baseSlug) baseSlug = 'product';
      data.slug = `${baseSlug}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async removePermanently(id: string) {
    const product = await this.findById(id);

    const orderItemsCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      throw new BadRequestException(
        'لا يمكن حذف المنتج نهائياً لأنه مرتبط بطلبات سابقة. يمكنك إبقاؤه في الأرشيف.',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'تم حذف المنتج نهائياً',
      id: product.id,
    };
  }

  async addImage(productId: string, url: string, alt?: string) {
    const product = await this.findById(productId);
    const maxOrder = product.images.length;
    return this.prisma.productImage.create({
      data: { productId, url, alt, order: maxOrder },
    });
  }

  async removeImage(imageId: string) {
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  async addVariant(productId: string, data: { size: string; color?: string; colorHex?: string; sku: string; stock: number }) {
    await this.findById(productId);
    const normalizedColor = data.color ?? null;

    // Prevent repeated "duplicate/deleted variant" failures:
    // if same size/color already exists (even disabled), reactivate it.
    const existingVariant = await this.prisma.productVariant.findFirst({
      where: {
        productId,
        size: data.size,
        color: normalizedColor,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingVariant) {
      return this.prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          sku: data.sku,
          stock: data.stock,
          colorHex: data.colorHex,
          color: normalizedColor,
          isActive: true,
        },
      });
    }

    return this.prisma.productVariant.create({
      data: { productId, ...data, color: normalizedColor },
    });
  }

  async removeVariant(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true },
    });
    if (!variant) throw new NotFoundException('المقاس غير موجود');

    // Soft delete to avoid FK crashes when variant is referenced in old orders.
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { isActive: false },
    });
  }
}
