import type { OrderStatus } from '@/store/orders-store';

export const orderStatusLabels: Record<OrderStatus, string> = {
  'awaiting-confirmation': 'A aguardar confirmação',
  'payment-review': 'A validar pagamento',
  confirmed: 'Confirmado',
  preparing: 'Em preparação',
  shipped: 'A caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const orderStatusSteps: { status: OrderStatus; label: string }[] = [
  { status: 'payment-review', label: 'Comprovativo em validação' },
  { status: 'confirmed', label: 'Pedido confirmado' },
  { status: 'preparing', label: 'Em preparação' },
  { status: 'shipped', label: 'A caminho' },
  { status: 'delivered', label: 'Entregue' },
];
