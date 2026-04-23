import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Metadata for Products listing page
export const productsMetadata: Metadata = {
  title: "Tous les produits | StorShoes",
  description: "Explorez notre collection complète de chaussures premium. Sneakers, chaussures formelles, bottes et plus. Livraison rapide au Maroc.",
  keywords: ["chaussures", "sneakers", "bottes", "formal", "maroc", "casablanca", "storshoes", "collection"],
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: "Tous les produits | StorShoes",
    description: "Explorez notre collection complète de chaussures premium.",
    type: "website",
    url: `${SITE_URL}/products`,
    siteName: "StorShoes",
    images: [
      {
        url: "/og-products.jpg",
        width: 1200,
        height: 630,
        alt: "Collection StorShoes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tous les produits | StorShoes",
    description: "Explorez notre collection complète de chaussures premium.",
    images: ["/og-products.jpg"],
  },
};

// Metadata for Contact page
export const contactMetadata: Metadata = {
  title: "Contactez-nous | StorShoes",
  description: "Contactez StorShoes pour toute question ou assistance. Service client disponible pour vous aider avec vos commandes.",
  keywords: ["contact", "service client", "aide", "support", "storshoes", "maroc"],
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contactez-nous | StorShoes",
    description: "Contactez StorShoes pour toute question ou assistance.",
    type: "website",
    url: `${SITE_URL}/contact`,
    siteName: "StorShoes",
  },
};

// Metadata for Cart page
export const cartMetadata: Metadata = {
  title: "Votre panier | StorShoes",
  description: "Consultez et modifiez votre panier. Finalisez votre commande de chaussures premium.",
  robots: {
    index: false,
    follow: true,
  },
};

// Metadata for Wishlist page
export const wishlistMetadata: Metadata = {
  title: "Vos favoris | StorShoes",
  description: "Retrouvez tous vos articles préférés en un seul endroit.",
  robots: {
    index: false,
    follow: true,
  },
};

// Metadata for Checkout page
export const checkoutMetadata: Metadata = {
  title: "Finaliser la commande | StorShoes",
  description: "Complétez vos informations pour finaliser votre commande.",
  robots: {
    index: false,
    follow: false,
  },
};
