// Product Types
export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  stock: number;
  sku?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  brand?: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: ProductCategory;
  categoryId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  brand?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  size?: string;
  color?: string;
  slug?: string;
}

// Wishlist Types
export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  brand: string;
  price: number;
  originalPrice?: number;
  slug: string;
}

// Order Types
export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface Order {
  id?: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  items: OrderItem[];
  total: number;
  shippingCost?: number;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: 'cod' | 'online';
  notes?: string;
  createdAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
  success?: boolean;
}

// Filter Types
export interface ProductFilters {
  categoryId?: string;
  size?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

// Contact Form Types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// Mouse Event Types for inline styles
export interface MouseEventHandlers {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
}
