'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getStorageItem, setStorageItem } from './storage-crypto';

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  brand: string;
  price: number;
  originalPrice?: number;
  slug: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType>(null!);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = getStorageItem<WishlistItem[]>('storshoes_wishlist');
    if (saved) {
      setItems(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setStorageItem('storshoes_wishlist', items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(i => i.productId === productId);
  }, [items]);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.filter(i => i.productId !== item.productId);
      }
      return [...prev, item];
    });
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      isInWishlist, 
      toggleItem,
      clearWishlist, 
      totalItems 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
