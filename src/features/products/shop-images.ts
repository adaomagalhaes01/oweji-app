import type { ShopImageKey } from '@/store/shop-store';

export const shopImages: Record<ShopImageKey, number> = {
  pink: require('@/assets/products/dress-rosa.jpg'),
  linen: require('@/assets/products/linen.jpg'),
  red: require('@/assets/products/dress-red.jpg'),
  white: require('@/assets/products/top-white.jpg'),
};
