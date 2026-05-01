import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StorShoes - Premium Footwear Store",
    template: "%s | StorShoes"
  },
  description: "Discover the latest collection of sneakers, formal shoes, and boots. Premium quality, competitive prices, fast delivery across Morocco.",
  keywords: ["shoes", "sneakers", "footwear", "StorShoes", "nike", "adidas", "boots", "store", "morocco", "casablanca"],
  authors: [{ name: "StorShoes" }],
  creator: "StorShoes",
  publisher: "StorShoes",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "StorShoes - Premium Footwear Store",
    description: "Discover the latest collection of sneakers, formal shoes, and boots. Premium quality, competitive prices, fast delivery.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "StorShoes",
    images: [
      {
        url: "/logoe2.jpeg",
        width: 1080,
        height: 1080,
        alt: "StorShoes - Premium Footwear Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StorShoes - Premium Footwear Store",
    description: "Discover the latest collection of sneakers, formal shoes, and boots.",
    images: ["/logoe2.jpeg"],
    creator: "@storshoes",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
