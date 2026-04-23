import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

let isApiOffline = false;
let lastOfflineToastAt = 0;

const API_STATUS_EVENT = 'storshoes:api-status';

function notifyApiStatus(online: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(API_STATUS_EVENT, { detail: { online } }));
}

function markApiOffline() {
  const now = Date.now();
  const shouldToast = !isApiOffline || now - lastOfflineToastAt > 10000;
  isApiOffline = true;
  lastOfflineToastAt = now;
  notifyApiStatus(false);
  if (shouldToast) {
    toast.error('تعذر الاتصال بخادم النظام. تأكد أن API يعمل على المنفذ 3001.');
  }
}

function markApiOnline() {
  const wasOffline = isApiOffline;
  isApiOffline = false;
  notifyApiStatus(true);
  if (wasOffline) {
    toast.success('تمت إعادة الاتصال بالخادم بنجاح');
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const requestPath = String(config.url || '');
  const isHealthCheck = requestPath.includes('/health');

  if (isApiOffline && !isHealthCheck) {
    const offlineError = new axios.AxiosError(
      'API is offline',
      'ERR_API_OFFLINE',
      config,
    );
    return Promise.reject(offlineError);
  }

  const token = localStorage.getItem('storshoes_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => {
    markApiOnline();
    return response;
  },
  (error) => {
    if (!error.response || error.code === 'ERR_NETWORK') {
      markApiOffline();
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('storshoes_token');
      localStorage.removeItem('storshoes_admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL, API_BASE_URL, API_STATUS_EVENT };

// ===== Auth API =====
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// ===== Products API =====
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  deletePermanent: (id: string) => api.delete(`/products/${id}/permanent`),
  addImage: (id: string, data: { url: string; alt?: string }) =>
    api.post(`/products/${id}/images`, data),
  removeImage: (imageId: string) => api.delete(`/products/images/${imageId}`),
  addVariant: (id: string, data: any) => api.post(`/products/${id}/variants`, data),
  removeVariant: (variantId: string) => api.delete(`/products/variants/${variantId}`),
};

// ===== Categories API =====
export const categoriesApi = {
  getAll: (includeInactive = true) =>
    api.get('/categories', { params: { includeInactive } }),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ===== Orders API =====
export const ordersApi = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, notes }),
};

// ===== Inventory API =====
export const inventoryApi = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  updateStock: (variantId: string, stock: number) =>
    api.patch(`/inventory/${variantId}`, { stock }),
  updateVariant: (variantId: string, data: any) =>
    api.patch(`/inventory/${variantId}`, data),
};

// ===== Reports API =====
export const reportsApi = {
  getOverview: () => api.get('/reports/overview'),
  getSales: (params?: any) => api.get('/reports/sales', { params }),
};

// ===== Uploads API =====
export const uploadsApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ===== Settings API =====
export const settingsApi = {
  getSite: () => api.get('/settings/site'),
  updateSite: (data: Record<string, any>) => api.put('/settings/site', data),
};

// ===== Contact Messages API =====
export const contactMessagesApi = {
  getAll: (params?: any) => api.get('/contact-messages', { params }),
  getById: (id: string) => api.get(`/contact-messages/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/contact-messages/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/contact-messages/${id}`),
  getStats: () => api.get('/contact-messages/stats'),
};

// ===== Analytics API =====
export const analyticsApi = {
  getStats: (days: number) => api.get('/analytics/stats', { params: { days } }),
  getUtmSources: (days: number) => api.get('/analytics/utm-sources', { params: { days } }),
  getTopProducts: (limit: number) => api.get('/analytics/top-products', { params: { limit } }),
};

// ===== System API =====
export const systemApi = {
  health: () => api.get('/health'),
};

// Helper for generating full image URLs
export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Clean up API URL to point to backend root
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
