import type { Product } from './types';
import { products } from './data';
import type { ShopProduct } from '@/store/shop-store';
import { shopImages } from './shop-images';

export function getProductCatalog(sellerProducts: ShopProduct[]): Product[] {
  return [
    ...products,
    ...sellerProducts.map((item) => ({
      id: `seller-${item.id}`,
      name: item.name,
      description: item.description,
      price: item.price,
      image: shopImages[item.imageKey],
      category: 'tops',
      sizes: ['Único'],
      colors: ['#E98A9A'],
      rating: 0,
      available: true,
    })),
  ];
}
