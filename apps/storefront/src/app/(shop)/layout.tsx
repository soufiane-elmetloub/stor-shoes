'use client';

import { CartProvider } from '@/lib/cart';
import { WishlistProvider } from '@/lib/wishlist';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <Header />
        <main style={{ minHeight: '60vh', paddingTop: '64px' }}>{children}</main>
        <Footer />
      </WishlistProvider>
    </CartProvider>
  );
}
