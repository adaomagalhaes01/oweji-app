import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((entry) => entry.productId === item.productId && entry.size === item.size && entry.color === item.color);
          return { items: existing
            ? state.items.map((entry) => entry === existing ? { ...entry, quantity: entry.quantity + 1 } : entry)
            : [...state.items, { ...item, quantity: 1 }] };
        });
      },
      updateQuantity: (productId, size, color, quantity) => set((state) => ({
        items: quantity < 1
          ? state.items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
          : state.items.map((item) => item.productId === productId && item.size === size && item.color === color ? { ...item, quantity } : item),
      })),
      removeItem: (productId, size, color) => set((state) => ({ items: state.items.filter((item) => !(item.productId === productId && item.size === size && item.color === color)) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'oweji-cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
