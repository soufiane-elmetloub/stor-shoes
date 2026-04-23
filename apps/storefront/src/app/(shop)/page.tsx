import DynamicHero from '@/components/DynamicHero';
import CategoryCircles from '@/components/CategoryCircles';
import BestSellers from '@/components/BestSellers';
import ViewAllButton from '@/components/ViewAllButton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const INTER = "'Inter', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  price: number;
  salePrice?: number;
  images: { url: string; alt?: string }[];
  variants: { stock: number }[];
}

async function loadHomeData() {
  try {
    const [categoriesRes, featuredRes] = await Promise.all([
      fetch(`${API_BASE_URL}/categories`, { next: { revalidate: 120 } }),
      fetch(`${API_BASE_URL}/products/featured`, { next: { revalidate: 120 } }),
    ]);

    const categories = categoriesRes.ok ? ((await categoriesRes.json()) as Category[]) : [];
    let featuredProducts = featuredRes.ok ? ((await featuredRes.json()) as Product[]) : [];

    // Fallback to latest active products if featured list is empty.
    if (featuredProducts.length === 0) {
      const latestRes = await fetch(
        `${API_BASE_URL}/products?limit=8&isActive=true&sortBy=createdAt&sortOrder=desc`,
        { next: { revalidate: 120 } }
      );
      if (latestRes.ok) {
        const latestPayload = (await latestRes.json()) as { data?: Product[] };
        featuredProducts = latestPayload.data ?? [];
      }
    }

    return { categories, featuredProducts };
  } catch {
    return { categories: [] as Category[], featuredProducts: [] as Product[] };
  }
}

export default async function HomePage() {
  const { categories, featuredProducts } = await loadHomeData();

  return (
    <>
      <DynamicHero />

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 1.5rem', fontFamily: INTER }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000000', fontFamily: PLAYFAIR }}>Categories</h2>
        </div>
        {categories.length > 0 ? (
          <CategoryCircles categories={categories} />
        ) : (
          <p style={{ color: '#64748b', fontFamily: INTER }}>لا توجد تصنيفات متاحة حالياً.</p>
        )}
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.5rem 3rem', fontFamily: INTER }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000000', fontFamily: PLAYFAIR }}>Best Sellers</h2>
          <ViewAllButton href="/products" />
        </div>
        {featuredProducts.length > 0 ? (
          <BestSellers products={featuredProducts} />
        ) : (
          <p style={{ color: '#64748b', fontFamily: INTER }}>لا توجد منتجات متاحة حالياً.</p>
        )}
      </section>
    </>
  );
}
