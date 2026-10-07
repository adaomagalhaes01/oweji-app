import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OrderLine = { productId: string; name: string; unitPrice: number; quantity: number };
export type LocalOrder = { id: string; createdAt: number; lines: OrderLine[]; total: number };
type OrdersState = { orders: LocalOrder[]; addOrder: (order: Omit<LocalOrder, 'id' | 'createdAt'>) => void };

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [{ ...order, id: `${Date.now()}`, createdAt: Date.now() }, ...state.orders] })),
    }),
    { name: 'oweji-orders', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
