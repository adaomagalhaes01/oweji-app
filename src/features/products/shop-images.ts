import type { ImageSource } from 'expo-image';

import type { ShopImageKey, ShopProduct } from '@/store/shop-store';

export const shopImages: Record<ShopImageKey, number> = {
  pink: require('@/assets/products/dress-rosa.jpg'),
  linen: require('@/assets/products/linen.jpg'),
  red: require('@/assets/products/dress-red.jpg'),
  white: require('@/assets/products/top-white.jpg'),
};

export function getShopProductImage(product: Pick<ShopProduct, 'imageKey' | 'imageUri'>): number | ImageSource {
  if (product.imageUri) return { uri: product.imageUri };
  return shopImages[product.imageKey] ?? shopImages.pink;
}
