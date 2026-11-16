import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  MapPin,
  Phone,
  User,
  Package,
  Truck,
  CheckCircle,
  Home,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { OrderStatus } from '../../constants/order-status';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Order } from '../../types';

export const MerchantOrders: React.FC = () => {
  const { currentUser, orders, updateOrderStatus } = useApp();
  const storeId = currentUser?.storeId || '';

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders containing products from this store
  const merchantOrders = orders.filter((order) =>
    order.lines.some((line) => line.merchantId === storeId)
  );

  const filteredOrders = merchantOrders.filter((order) => {
    // Tab filter
    if (activeTab === 'pending') {
      if (order.status !== 'awaiting-confirmation' && order.status !== 'payment-review') {
        return false;
      }
    } else if (activeTab === 'active') {
      if (order.status !== 'confirmed' && order.status !== 'preparing' && order.status !== 'shipped') {
        return false;
      }
    } else if (activeTab === 'done') {
      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        return false;
      }
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.fullName.toLowerCase().includes(q) ||
        order.customer.phone.includes(q)
      );
    }
    return true;
  });

  const getNextAction = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Iniciar Preparação', nextStatus: 'preparing' as OrderStatus, icon: <Package size={15} /> };
      case 'preparing':
        return { label: 'Despachar / A Caminho', nextStatus: 'shipped' as OrderStatus, icon: <Truck size={15} /> };
      case 'shipped':
        return { label: 'Confirmar Entrega', nextStatus: 'delivered' as OrderStatus, icon: <Home size={15} /> };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#252225] flex items-center gap-2">
              <ShoppingBag className="text-[#C95F72]" size={20} />
              Gestão de Encomendas dos Clientes
            </h2>
            <p className="text-xs text-[#777277] mt-1">
              Acompanhe as peças compradas da sua loja, consulte a morada do cliente e atualize o estado de expedição.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-[#777277]" />
            <input
              type="text"
              placeholder="Pesquisar cliente ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#E98A9A]"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F0E5E8] overflow-x-auto">
          {[
            { id: 'all', label: `Todas (${merchantOrders.length})` },
            {
              id: 'pending',
              label: `Por Confirmar (${
                merchantOrders.filter(
                  (o) => o.status === 'awaiting-confirmation' || o.status === 'payment-review'
                ).length
              })`,
            },
            {
              id: 'active',
              label: `Em Curso (${
                merchantOrders.filter(
                  (o) =>
                    o.status === 'confirmed' ||
                    o.status === 'preparing' ||
                    o.status === 'shipped'
                ).length
              })`,
            },
            {
              id: 'done',
              label: `Concluídas (${
                merchantOrders.filter(
                  (o) => o.status === 'delivered' || o.status === 'cancelled'
                ).length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#E98A9A] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <Card>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-[#777277]">
            <ShoppingBag size={36} className="mx-auto text-[#E98A9A] mb-2" />
            <h3 className="font-bold text-sm text-[#252225]">Nenhuma encomenda encontrada</h3>
            <p className="text-xs mt-1">Nenhum pedido corresponde ao filtro selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                  <th className="pb-3 pl-1">Encomenda</th>
                  <th className="pb-3">Comprador</th>
                  <th className="pb-3">Localização (Angola)</th>
                  <th className="pb-3">Suas Peças</th>
                  <th className="pb-3">Subtotal da Loja</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 pr-1 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E5E8] text-xs">
                {filteredOrders.map((order) => {
                  const storeLines = order.lines.filter((l) => l.merchantId === storeId);
                  const storeSubtotal = storeLines.reduce(
                    (sum, l) => sum + l.unitPrice * l.quantity,
                    0
                  );
                  const nextAction = getNextAction(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-[#FFF8FA] transition-colors">
                      <td className="py-3.5 pl-1 font-mono font-bold text-[#252225]">
                        #{order.id.slice(-5)}
                        <div className="text-[10px] text-[#777277] font-sans font-normal">
                          {new Date(order.createdAt).toLocaleDateString('pt-AO', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-[#252225] flex items-center gap-1">
                          <User size={12} className="text-[#777277]" />
                          {order.customer.fullName}
                        </div>
                        <div className="text-[10px] text-[#777277]">{order.customer.phone}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-[#252225] font-medium flex items-center gap-1">
                          <MapPin size={12} className="text-[#C95F72]" />
                          {order.customer.municipality}, {order.customer.province}
                        </div>
                        <div className="text-[10px] text-[#777277] truncate max-w-[140px]">
                          {order.customer.address}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-[#252225]">
                          {storeLines.map((l) => `${l.quantity}x ${l.name}`).join(' · ')}
                        </span>
                        <div className="text-[10px] text-[#777277]">
                          Tamanhos: {storeLines.map((l) => l.size).join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 font-bold text-[#C95F72]">
                        {formatKz(storeSubtotal)}
                      </td>
                      <td className="py-3.5">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="py-3.5 pr-1 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {nextAction && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={nextAction.icon}
                              onClick={() => updateOrderStatus(order.id, nextAction.nextStatus)}
                            >
                              {nextAction.label}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye size={13} />}
                            onClick={() => setSelectedOrder(order)}
                          >
                            Detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Detalhes da Encomenda #${selectedOrder.id.slice(-5)}`}
          subtitle={`Efetuada em ${new Date(selectedOrder.createdAt).toLocaleDateString('pt-AO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Payment banner */}
            <div className="p-3.5 rounded-xl bg-[#FFF8FA] border border-[#F0E5E8] flex items-center justify-between">
              <div>
                <span className="text-[#777277]">Estado Atual:</span>
                <div className="mt-1">
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#777277]">Pagamento:</span>
                <p className="font-semibold text-[#252225] mt-0.5">
                  Transferência Bancária (Ref: {selectedOrder.paymentReference || 'N/A'})
                </p>
              </div>
            </div>

            {/* Delivery address */}
            <div className="p-3.5 rounded-xl bg-white border border-[#F0E5E8] space-y-1.5">
              <h4 className="font-bold text-xs text-[#252225] mb-2">Dados de Entrega do Cliente</h4>
              <p className="font-semibold text-[#252225]">
                {selectedOrder.customer.fullName} · {selectedOrder.customer.phone}
              </p>
              <p className="text-[#777277]">
                {selectedOrder.customer.address}, {selectedOrder.customer.municipality},{' '}
                {selectedOrder.customer.province}
              </p>
              {selectedOrder.customer.reference && (
                <p className="text-[#C95F72] text-[11px] font-medium">
                  Ponto de referência: {selectedOrder.customer.reference}
                </p>
              )}
            </div>

            {/* Store items list */}
            <div className="p-3.5 rounded-xl bg-white border border-[#F0E5E8] space-y-2">
              <h4 className="font-bold text-xs text-[#252225]">
                Produtos Comprados da Sua Loja
              </h4>
              <div className="divide-y divide-[#F0E5E8]">
                {selectedOrder.lines
                  .filter((l) => l.merchantId === storeId)
                  .map((line, i) => (
                    <div key={i} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[#252225]">
                          {line.quantity}x {line.name}
                        </span>
                        <span className="text-[#777277] ml-2">
                          (Tamanho: {line.size})
                        </span>
                      </div>
                      <span className="font-bold text-[#C95F72]">
                        {formatKz(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Advance Status Workflow */}
            <div className="pt-3 border-t border-[#F0E5E8] flex items-center justify-between">
              <span className="text-xs text-[#777277]">Mudar estado da encomenda:</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'preparing');
                    setSelectedOrder({ ...selectedOrder, status: 'preparing' });
                  }}
                >
                  Em Preparação
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'shipped');
                    setSelectedOrder({ ...selectedOrder, status: 'shipped' });
                  }}
                >
                  A Caminho
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'delivered');
                    setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                  }}
                >
                  Entregue
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
