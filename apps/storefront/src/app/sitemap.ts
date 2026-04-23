import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Static routes
const staticRoutes = [
  {
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: `${SITE_URL}/products`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
];

// Fetch products and categories from API
async function getDynamicRoutes() {
  try {
    // Fetch products
    const productsRes = await fetch(`${API_URL}/products?limit=1000&isActive=true`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    const productsData = await productsRes.json();
    const products = productsData.data || [];

    // Fetch categories
    const categoriesRes = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    const categories = await categoriesRes.json();

    // Product routes
    const productRoutes = products.map((product: { slug: string; updatedAt?: string }) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Category routes (filtered products pages)
    const categoryRoutes = categories.map((category: { slug?: string; id: string; name: string; updatedAt?: string }) => ({
      url: `${SITE_URL}/products?category=${category.slug || category.id}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...productRoutes, ...categoryRoutes];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await getDynamicRoutes();
  return [...staticRoutes, ...dynamicRoutes];
}
