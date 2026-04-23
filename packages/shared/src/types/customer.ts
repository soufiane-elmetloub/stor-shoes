export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  instagram?: string;
  orders?: import('./order').Order[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilter {
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
}
