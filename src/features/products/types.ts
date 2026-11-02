import type { ImageSource } from 'expo-image';

export type ProductCondition = 'new' | 'semi-new' | 'good-used';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: number | ImageSource | null;
  category: string;
  sizes: string[];
  colors: string[];
  rating: number;
  available: boolean;
  stock?: number;
  condition: ProductCondition;
  merchantId?: string;
  merchantStoreName?: string;
};

export type Category = {
  id: string;
  label: string;
};
