import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Eye,
  FileText,
  AlertCircle,
  Search,
  Filter,
  CreditCard,
  Building,
  User,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { ReceiptViewerModal } from '../../components/common/ReceiptViewerModal';
import { Order } from '../../types';

export const AdminFinancialReview: React.FC = () => {
  const { orders, validatePayment } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('pending');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders with receipts
  const ordersWithReceipts = orders.filter((o) => o.receipt);

  const filteredOrders = ordersWithReceipts.filter((order) => {
    // Filter by tab
    if (filter === 'pending' && order.status !== 'payment-review') return false;
    if (filter === 'validated' && order.status === 'payment-review') return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customer.fullName.toLowerCase().includes(q);
      const matchRef = order.paymentReference.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchRef) return false;
    }
    return true;
  });

  const pendingCount = ordersWithReceipts.filter((o) => o.status === 'payment-review').length;

  return (
    <div className="space-y-6">
      {/* Top Info Header */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FCE7EC] text-[#C95F72]">
                <ShieldCheck size={20} />
              </span>
              <h2 className="text-lg font-bold text-[#252225]">
                Auditoria de Comprovativos Bancários
              </h2>
            </div>
            <p className="text-xs text-[#777277] mt-1 max-w-2xl">
              Em Angola, os clientes realizam transferências via Multicaixa Express, BAI Directo ou BFA Net e anexam o recibo. Como administrador, valide se o montante e a referência declarada conferem com a conta bancária da OWEJI.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF8FA] p-3 rounded-xl border border-[#F0E5E8]">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#777277]">Por Validar</span>
              <div className="text-xl font-bold text-[#C95F72]">{pendingCount}</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-[#F0E5E8]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filter === 'pending'
                  ? 'bg-[#E98A9A] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('validated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filter === 'validated'
                  ? 'bg-[#E98A9A] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
              }`}
            >
              Já Auditados
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#E98A9A] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
              }`}
            >
              Todos ({ordersWithReceipts.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-[#777277]" />
            <input
              type="text"
              placeholder="Pesquisar cliente, ID ou ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#E98A9A]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Receipts / Orders */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle2 size={40} className="mx-auto text-[#4FA982] mb-3" />
          <h3 className="text-sm font-bold text-[#252225]">Nenhum comprovativo nesta vista</h3>
          <p className="text-xs text-[#777277] mt-1">
            {filter === 'pending'
              ? 'Excelente! Não há comprovativos pendentes para conferência.'
              : 'Tente alterar os termos da pesquisa ou o filtro selecionado.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'payment-review';
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-[#E98A9A]/60 ring-2 ring-[#E98A9A]/10'
                    : 'border-[#F0E5E8]'
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-[#F0E5E8] flex items-center justify-between bg-[#FFF8FA]/50">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#252225]">
                      #{order.id.slice(-5)}
                    </span>
                    <p className="text-[10px] text-[#777277]">
                      {new Date(order.createdAt).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>

                {/* Receipt Preview Thumbnail */}
                <div
                  className="relative h-44 bg-[#252225]/5 flex items-center justify-center p-3 cursor-pointer group"
                  onClick={() => setSelectedOrder(order)}
                >
                  {order.receipt?.url ? (
                    <img
                      src={order.receipt.url}
                      alt={order.receipt.name}
                      className="max-h-full max-w-full rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="text-center text-[#777277]">
                      <FileText size={32} className="mx-auto mb-1 text-[#C95F72]" />
                      <span className="text-xs">{order.receipt?.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#252225]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold rounded-t-none">
                    <Eye size={16} /> Ver em Detalhe
                  </div>
                </div>

                {/* Information Body */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0E5E8]">
                    <span className="text-[#777277]">Valor a Receber:</span>
                    <span className="text-base font-bold text-[#C95F72]">
                      {formatKz(order.total)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-[#252225] font-semibold">
                      <User size={13} className="text-[#777277]" />
                      <span>{order.customer.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#777277] mt-0.5">
                      <Phone size={12} />
                      <span>{order.customer.phone}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFF8FA] border border-[#F0E5E8] text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#777277]">Ref. Pagamento:</span>
                      <span className="font-mono font-bold text-[#252225]">
                        {order.paymentReference || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-[#777277]">
                      <span>Itens ({order.lines.length}):</span>
                      <span className="truncate max-w-[140px] text-[#252225] font-medium">
                        {order.lines.map((l) => l.name).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<X size={14} />}
                        onClick={() => validatePayment(order.id, false)}
                      >
                        Rejeitar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check size={14} />}
                        onClick={() => validatePayment(order.id, true)}
                      >
                        Aprovar
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        icon={<Eye size={14} />}
                        onClick={() => setSelectedOrder(order)}
                      >
                        Ver Ficha Completa
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for full inspection */}
      <ReceiptViewerModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onValidate={validatePayment}
        canValidate={selectedOrder?.status === 'payment-review'}
      />
    </div>
  );
};
