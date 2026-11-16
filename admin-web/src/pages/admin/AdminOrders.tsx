import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  MapPin,
  User,
  Phone,
  Calendar,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { OrderStatus } from '../../constants/order-status';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { ReceiptViewerModal } from '../../components/common/ReceiptViewerModal';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, validatePayment, updateOrderStatus } = useApp();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.province.toLowerCase().includes(q) ||
        order.paymentReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#252225] flex items-center gap-2">
              <ShoppingBag className="text-[#C95F72]" size={20} />
              Todas as Encomendas da Plataforma
            </h2>
            <p className="text-xs text-[#777277] mt-1">
              Consulte e acompanhe o estado de cada encomenda enviada em Angola pelos comerciantes parceiros.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-[#777277]" />
            <input
              type="text"
              placeholder="Pesquisar pedido, cliente, província..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#E98A9A]"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-4 border-t border-[#F0E5E8]">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'payment-review', label: 'Validação Pagamento' },
            { id: 'confirmed', label: 'Confirmadas' },
            { id: 'preparing', label: 'Em Preparação' },
            { id: 'shipped', label: 'A Caminho' },
            { id: 'delivered', label: 'Entregues' },
            { id: 'cancelled', label: 'Canceladas' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-[#E98A9A] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                <th className="pb-3 pl-1">ID & Data</th>
                <th className="pb-3">Comprador</th>
                <th className="pb-3">Destino (Angola)</th>
                <th className="pb-3">Itens</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 pr-1 text-right">Comprovativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5E8] text-xs">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FFF8FA] transition-colors">
                  <td className="py-3.5 pl-1">
                    <span className="font-mono font-bold text-[#252225]">
                      #{order.id.slice(-5)}
                    </span>
                    <div className="text-[10px] text-[#777277]">
                      {new Date(order.createdAt).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-[#252225] flex items-center gap-1">
                      <User size={13} className="text-[#777277]" />
                      {order.customer.fullName}
                    </div>
                    <div className="text-[10px] text-[#777277]">{order.customer.phone}</div>
                  </td>
                  <td className="py-3.5">
                    <div className="text-[#252225] font-medium flex items-center gap-1">
                      <MapPin size={12} className="text-[#C95F72]" />
                      {order.customer.municipality}, {order.customer.province}
                    </div>
                    <div className="text-[10px] text-[#777277] truncate max-w-[150px]">
                      {order.customer.address}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-[#252225]">
                      {order.lines.reduce((acc, l) => acc + l.quantity, 0)} peças
                    </span>
                    <div className="text-[10px] text-[#777277] truncate max-w-[140px]">
                      {order.lines.map((l) => l.name).join(', ')}
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-[#C95F72]">
                    {formatKz(order.total)}
                  </td>
                  <td className="py-3.5">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </td>
                  <td className="py-3.5 pr-1 text-right">
                    {order.receipt ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={13} />}
                        onClick={() => setSelectedOrder(order)}
                      >
                        Recibo
                      </Button>
                    ) : (
                      <span className="text-[10px] text-[#777277] italic">Sem anexo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
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
