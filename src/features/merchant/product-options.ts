import { categories } from '@/features/products/data';

export const productCategoryOptions = categories.filter((category) => category.id !== 'all');

export const productSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'Único', '36', '37', '38', '39', '40'];

export const productColorOptions = [
  { value: '#E98A9A', label: 'Rosa' },
  { value: '#FFFFFF', label: 'Branco' },
  { value: '#252225', label: 'Preto' },
  { value: '#D95C68', label: 'Vermelho' },
  { value: '#D4C3A5', label: 'Bege' },
  { value: '#8EC4D5', label: 'Azul' },
  { value: '#C79A4A', label: 'Dourado' },
  { value: '#B9866E', label: 'Castanho' },
];
