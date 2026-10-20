import type { ProductCondition } from './types';

export const productConditionOptions: { value: ProductCondition; label: string; compactLabel: string }[] = [
  { value: 'new', label: 'Nova', compactLabel: 'Nova' },
  { value: 'semi-new', label: 'Seminova', compactLabel: 'Seminova' },
  { value: 'good-used', label: 'Usada · boa', compactLabel: 'Usada · boa' },
];

export function getProductConditionLabel(condition: ProductCondition) {
  return productConditionOptions.find((option) => option.value === condition)?.label ?? 'Usada · boa';
}
