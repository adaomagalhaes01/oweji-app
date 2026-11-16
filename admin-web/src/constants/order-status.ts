export type OrderStatus =
  | 'awaiting-confirmation'
  | 'payment-review'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const orderStatusConfig: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  'awaiting-confirmation': {
    label: 'A aguardar confirmação',
    color: '#8A6D3B',
    bg: '#FCF8E3',
    border: '#FAEBCC',
  },
  'payment-review': {
    label: 'Validar comprovativo',
    color: '#C95F72',
    bg: '#FCE7EC',
    border: '#E98A9A',
  },
  confirmed: {
    label: 'Confirmado',
    color: '#2B6CB0',
    bg: '#EBF8FF',
    border: '#BEE3F8',
  },
  preparing: {
    label: 'Em preparação',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  shipped: {
    label: 'A caminho',
    color: '#7C3AED',
    bg: '#F3E8FF',
    border: '#DDD6FE',
  },
  delivered: {
    label: 'Entregue',
    color: '#286744',
    bg: '#E5F3EA',
    border: '#C3E6CB',
  },
  cancelled: {
    label: 'Cancelado',
    color: '#D95C68',
    bg: '#FEE2E2',
    border: '#FECACA',
  },
};
