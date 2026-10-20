import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OrderLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  size: string;
  color: string;
};

export type OrderStatus = 'awaiting-confirmation' | 'payment-review' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPaymentMethod = 'bank-transfer';
export type OrderReceipt = { name: string; uri: string; mimeType?: string; size?: number };
export type DeliveryDetails = {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  municipality: string;
  address: string;
  reference: string;
};

export type LocalOrder = {
  id: string;
  createdAt: number;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  paymentReference: string;
  receipt?: OrderReceipt;
  delivery: DeliveryDetails;
};

type OrdersState = {
  orders: LocalOrder[];
  addOrder: (order: Omit<LocalOrder, 'id' | 'createdAt'>) => string;
  updateOrderReceipt: (id: string, receipt: OrderReceipt) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => {
        const createdAt = Date.now();
        const id = `OW-${createdAt.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        set((state) => ({ orders: [{ ...order, id, createdAt }, ...state.orders] }));
        return id;
      },
      updateOrderReceipt: (id, receipt) => set((state) => ({
        orders: state.orders.map((order) => order.id === id
          ? { ...order, receipt, status: order.status === 'awaiting-confirmation' ? 'payment-review' : order.status }
          : order),
      })),
      updateOrderStatus: (id, status) => set((state) => ({ orders: state.orders.map((order) => order.id === id ? { ...order, status } : order) })),
    }),
    {
      name: 'oweji-orders',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => {
        const oldOrders = (persistedState as { orders?: Record<string, unknown>[] } | undefined)?.orders ?? [];
        return {
          orders: oldOrders.map((order) => {
            const oldDelivery = (order.delivery as Partial<DeliveryDetails> | undefined) ?? {};
            const oldLines = Array.isArray(order.lines) ? order.lines as Record<string, unknown>[] : [];
            const oldTotal = typeof order.total === 'number' ? order.total : 0;
            return {
              ...order,
              lines: oldLines.map((line) => ({ ...line, size: line.size ?? '', color: line.color ?? '' })),
              subtotal: typeof order.subtotal === 'number' ? order.subtotal : oldTotal,
              shipping: typeof order.shipping === 'number' ? order.shipping : 0,
              status: (order.status as OrderStatus | undefined) ?? 'awaiting-confirmation',
              paymentMethod: 'bank-transfer' as const,
              paymentReference: typeof order.paymentReference === 'string' ? order.paymentReference : '',
              delivery: {
                fullName: oldDelivery.fullName ?? '',
                email: oldDelivery.email ?? '',
                phone: oldDelivery.phone ?? '',
                province: oldDelivery.province ?? '',
                municipality: oldDelivery.municipality ?? '',
                address: oldDelivery.address ?? '',
                reference: oldDelivery.reference ?? '',
              },
            };
          }),
        };
      },
    },
  ),
);
