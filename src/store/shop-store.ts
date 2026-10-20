import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ProductCondition } from '@/features/products/types';

export type ShopImageKey = 'pink' | 'linen' | 'red' | 'white';

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageKey: ShopImageKey;
  condition: ProductCondition;
  createdAt: number;
};

type ShopState = {
  products: ShopProduct[];
  addProduct: (product: Omit<ShopProduct, 'id' | 'createdAt'>) => void;
  removeProduct: (id: string) => void;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (product) => set((state) => ({ products: [{ ...product, id: `${Date.now()}`, createdAt: Date.now() }, ...state.products] })),
      removeProduct: (id) => set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
    }),
    { name: 'oweji-shop-products', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
