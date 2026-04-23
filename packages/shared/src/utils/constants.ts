export const SHOE_SIZES = [
  '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'
];

export const SHOE_COLORS = [
  { name: 'أسود', nameEn: 'Black', hex: '#000000' },
  { name: 'أبيض', nameEn: 'White', hex: '#FFFFFF' },
  { name: 'بني', nameEn: 'Brown', hex: '#8B4513' },
  { name: 'رمادي', nameEn: 'Gray', hex: '#808080' },
  { name: 'أزرق', nameEn: 'Blue', hex: '#1E40AF' },
  { name: 'أحمر', nameEn: 'Red', hex: '#DC2626' },
  { name: 'أخضر', nameEn: 'Green', hex: '#16A34A' },
  { name: 'بيج', nameEn: 'Beige', hex: '#D4A574' },
  { name: 'كحلي', nameEn: 'Navy', hex: '#1E3A5F' },
];

export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 20;

export const LOW_STOCK_THRESHOLD = 3;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
  FEATURED_PRODUCTS: '/products/featured',

  // Categories
  CATEGORIES: '/categories',

  // Orders
  ORDERS: '/orders',
  ORDER_STATUS: (id: string) => `/orders/${id}/status`,

  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_UPDATE: (variantId: string) => `/inventory/${variantId}`,

  // Reports
  REPORTS_SALES: '/reports/sales',
  REPORTS_OVERVIEW: '/reports/overview',

  // Uploads
  UPLOAD_IMAGE: '/uploads/image',
} as const;
