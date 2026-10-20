export type ProductCondition = 'new' | 'semi-new' | 'good-used';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: number;
  category: string;
  sizes: string[];
  colors: string[];
  rating: number;
  available: boolean;
  condition: ProductCondition;
};

export type Category = {
  id: string;
  label: string;
};
