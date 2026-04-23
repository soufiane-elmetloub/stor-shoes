export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type OrderSource = 'WEBSITE' | 'INSTAGRAM' | 'MANUAL';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: import('./customer').Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  shippingCity?: string;
  shippingAddress?: string;
  notes?: string;
  source: OrderSource;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: import('./product').Product;
  variantId: string;
  variant?: import('./product').ProductVariant;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
    instagram?: string;
  };
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingCity?: string;
  shippingAddress?: string;
  notes?: string;
  source?: OrderSource;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface OrderFilter {
  status?: OrderStatus;
  source?: OrderSource;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'قيد المراجعة',
  CONFIRMED: 'تم التأكيد',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
  RETURNED: 'مرتجع',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
  RETURNED: '#6b7280',
};
