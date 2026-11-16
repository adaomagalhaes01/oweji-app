import React from 'react';
import { orderStatusConfig, OrderStatus } from '../../constants/order-status';
import { ProductCondition, StoreStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = orderStatusConfig[status] || {
    label: status,
    color: '#777277',
    bg: '#F5F5F5',
    border: '#E0E0E0',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
};

interface ConditionBadgeProps {
  condition: ProductCondition;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ condition }) => {
  const map: Record<ProductCondition, { label: string; bg: string; color: string; border: string }> = {
    new: { label: 'Novo', bg: '#E5F3EA', color: '#286744', border: '#C3E6CB' },
    'semi-new': { label: 'Seminovo', bg: '#EBF8FF', color: '#2B6CB0', border: '#BEE3F8' },
    'good-used': { label: 'Segunda mão', bg: '#FFF1D9', color: '#975A16', border: '#FEEBC8' },
  };

  const current = map[condition] || map.new;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border"
      style={{
        backgroundColor: current.bg,
        color: current.color,
        borderColor: current.border,
      }}
    >
      {current.label}
    </span>
  );
};

interface StoreStatusBadgeProps {
  status: StoreStatus;
}

export const StoreStatusBadge: React.FC<StoreStatusBadgeProps> = ({ status }) => {
  const map: Record<StoreStatus, { label: string; bg: string; color: string; border: string }> = {
    active: { label: 'Ativa', bg: '#E5F3EA', color: '#286744', border: '#C3E6CB' },
    pending: { label: 'Sob Análise', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
    suspended: { label: 'Suspensa', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
  };

  const current = map[status] || map.pending;

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: current.bg,
        color: current.color,
        borderColor: current.border,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
      {current.label}
    </span>
  );
};
