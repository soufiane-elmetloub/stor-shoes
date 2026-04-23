'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getStorageItem, setStorageItem } from './storage-crypto';
import toast from 'react-hot-toast';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = getStorageItem<CartItem[]>('storshoes_cart');
    if (saved) setItems(saved);
  }, []);

  useEffect(() => {
    setStorageItem('storshoes_cart', items);
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      const stock = item.stock ?? existing?.stock ?? Infinity;
      
      if (existing) {
        const requestedQuantity = existing.quantity + item.quantity;
        if (requestedQuantity > stock) {
          toast.error('Un article seulement a été ajouté à votre panier en raison de la disponibilité.', { id: 'cart-stock-limit' });
          return prev.map(i => i.variantId === item.variantId ? { ...i, quantity: stock } : i);
        }
        return prev.map(i => i.variantId === item.variantId ? { ...i, quantity: requestedQuantity } : i);
      }
      
      if (item.quantity > stock) {
         toast.error('La quantité demandée dépasse le stock disponible.', { id: 'cart-stock-limit2' });
         return [...prev, { ...item, quantity: stock }];
      }
      
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems(prev => prev.map(i => {
      if (i.variantId === variantId) {
        const stock = i.stock ?? Infinity;
        if (quantity > stock) {
          toast.error('La quantité demandée dépasse le stock disponible.', { id: 'qty-limit' });
          return { ...i, quantity: stock };
        }
        return { ...i, quantity };
      }
      return i;
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
