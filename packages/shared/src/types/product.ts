export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  productId: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color?: string;
  colorHex?: string;
  sku: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  nameAr?: string;
  description?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  variants?: CreateVariantDto[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateVariantDto {
  size: string;
  color?: string;
  colorHex?: string;
  sku: string;
  stock: number;
}

export interface ProductFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  brand?: string;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'name' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { Category } from './category';
