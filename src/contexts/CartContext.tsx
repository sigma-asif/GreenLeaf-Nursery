import { createContext, useContext, useState, ReactNode } from 'react';
import type { Plant } from '../lib/supabase';

export interface CartItem {
  plant: Plant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (plant: Plant, quantity: number) => void;
  removeFromCart: (plantId: string) => void;
  updateQuantity: (plantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (plant: Plant, quantity: number) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.plant.id === plant.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.plant.id === plant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...currentItems, { plant, quantity }];
    });
  };

  const removeFromCart = (plantId: string) => {
    setItems(currentItems => currentItems.filter(item => item.plant.id !== plantId));
  };

  const updateQuantity = (plantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(plantId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.plant.id === plantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.plant.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}