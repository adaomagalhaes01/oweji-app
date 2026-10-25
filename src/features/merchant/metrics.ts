import type { LocalOrder, OrderLine } from '@/store/orders-store';
import type { ShopProduct } from '@/store/shop-store';

export type MerchantSaleGroup = {
  order: LocalOrder;
  lines: OrderLine[];
  itemCount: number;
  value: number;
};

export function getMerchantProducts(products: ShopProduct[], merchantId: string) {
  if (!merchantId) return [];
  return products.filter((product) => !product.merchantId || product.merchantId === merchantId);
}

export function getMerchantSales(orders: LocalOrder[], merchantId: string, ownedProductIds: string[]): MerchantSaleGroup[] {
  if (!merchantId) return [];
  const ownedIds = new Set(ownedProductIds);
  return orders
    .flatMap((order) => {
      const lines = order.lines.filter((line) =>
        line.merchantId ? line.merchantId === merchantId : ownedIds.has(line.productId),
      );
      if (!lines.length) return [];
      return [{
        order,
        lines,
        itemCount: lines.reduce((total, line) => total + line.quantity, 0),
        value: lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0),
      }];
    })
    .sort((left, right) => right.order.createdAt - left.order.createdAt);
}
