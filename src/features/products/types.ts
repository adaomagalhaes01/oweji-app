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
};

export type Category = {
  id: string;
  label: string;
};
