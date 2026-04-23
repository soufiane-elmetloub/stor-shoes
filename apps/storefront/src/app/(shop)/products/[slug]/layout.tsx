import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generate metadata for product pages
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(`${API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      return {
        title: "Produit non trouvé | StorShoes",
        description: "Ce produit n'est pas disponible.",
      };
    }

    const product = await response.json();
    const productUrl = `${SITE_URL}/products/${slug}`;
    const imageUrl = product.images?.[0]?.url || `${SITE_URL}/logoe2.jpeg`;
    const price = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return {
      title: `${product.name} | ${product.brand || 'StorShoes'}`,
      description: product.description?.substring(0, 160) || `Achetez ${product.name} - ${product.brand || 'StorShoes'}. Livraison rapide au Maroc.`,
      keywords: [product.name, product.brand, 'chaussures', 'sneakers', 'maroc', 'storshoes'],
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 200) || `Achetez ${product.name}`,
        type: "website",
        url: productUrl,
        siteName: "StorShoes",
        locale: "fr_FR",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description?.substring(0, 200) || `Achetez ${product.name}`,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
      // Product structured data via other metadata
      other: {
        'json-ld': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.images?.map((img: { url: string }) => img.url) || [imageUrl],
          description: product.description,
          brand: {
            '@type': 'Brand',
            name: product.brand || 'StorShoes',
          },
          offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'MAD',
            price: price.toString(),
            availability: product.variants?.some((v: { stock: number }) => v.stock > 0)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            ...(hasDiscount && {
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }),
          },
          ...(product.rating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.rating.toString(),
              reviewCount: product.reviewCount?.toString() || '0',
            },
          }),
        }),
      },
    };
  } catch {
    return {
      title: "Produit | StorShoes",
      description: "Découvrez nos produits premium.",
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
