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
  imageUri: string | null;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  condition: ProductCondition;
  merchantId?: string;
  createdAt: number;
};

type ShopState = {
  products: ShopProduct[];
  addProduct: (product: Omit<ShopProduct, 'id' | 'createdAt'> & { merchantId: string }) => void;
  updateProduct: (id: string, merchantId: string, product: Partial<Omit<ShopProduct, 'id' | 'createdAt' | 'merchantId'>>) => void;
  removeProduct: (id: string, merchantId?: string) => void;
  claimLegacyProducts: (merchantId: string) => void;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (product) => set((state) => ({ products: [{ ...product, id: `${Date.now()}`, createdAt: Date.now() }, ...state.products] })),
      updateProduct: (id, merchantId, product) => set((state) => ({
        products: state.products.map((entry) => entry.id === id && entry.merchantId === merchantId
          ? { ...entry, ...product }
          : entry),
      })),
      removeProduct: (id, merchantId) => set((state) => {
        const product = state.products.find((entry) => entry.id === id);
        if (!product || (merchantId && product.merchantId && product.merchantId !== merchantId)) return state;
        return { products: state.products.filter((entry) => entry.id !== id) };
      }),
      claimLegacyProducts: (merchantId) => set((state) => {
        if (!merchantId) return state;
        let changed = false;
        const products = state.products.map((product) => {
          if (product.merchantId) return product;
          changed = true;
          return { ...product, merchantId };
        });
        return changed ? { products } : state;
      }),
    }),
    {
      name: 'oweji-shop-products',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted) => {
        const stored = persisted as { products?: Partial<ShopProduct>[] } | undefined;
        return {
          products: (stored?.products ?? []).map((product) => ({
            ...product,
            imageKey: product.imageKey ?? 'pink',
            imageUri: typeof product.imageUri === 'string' ? product.imageUri : null,
            category: typeof product.category === 'string' && product.category ? product.category : 'tops',
            sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ['Único'],
            colors: Array.isArray(product.colors) && product.colors.length ? product.colors : ['#E98A9A'],
            stock: typeof product.stock === 'number' && Number.isFinite(product.stock) ? Math.max(0, Math.floor(product.stock)) : 1,
          } as ShopProduct)),
        };
      },
    },
  ),
);
