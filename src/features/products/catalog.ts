import type { Product } from './types';
import { products } from './data';
import type { ShopProduct } from '@/store/shop-store';
import { getShopProductImage } from './shop-images';

export function getProductCatalog(sellerProducts: ShopProduct[]): Product[] {
  return [
    ...products,
    ...sellerProducts.map((item) => {
      const stock = typeof item.stock === 'number' ? Math.max(0, item.stock) : 0;
      return {
        id: `seller-${item.id}`,
        name: item.name,
        description: item.description,
        price: item.price,
        image: getShopProductImage(item),
        category: item.category || 'tops',
        sizes: item.sizes.length ? item.sizes : ['Único'],
        colors: item.colors.length ? item.colors : ['#E98A9A'],
        rating: 0,
        available: stock > 0,
        stock,
        condition: item.condition ?? 'good-used',
        merchantId: item.merchantId,
      };
    }),
  ];
}
