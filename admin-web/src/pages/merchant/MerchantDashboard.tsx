import React, { useState } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  Package,
  TriangleAlert,
  Plus,
  ShoppingBag,
  Store,
  ChevronRight,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { Card, MetricCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { ReceiptViewerModal } from '../../components/common/ReceiptViewerModal';
import { Order } from '../../types';

interface MerchantDashboardProps {
  onNavigate: (tab: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onNavigate }) => {
  const { currentUser, products, orders, updateStock, validatePayment } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const storeId = currentUser?.storeId || '';

  // Filter store products
  const merchantProducts = products.filter((p) => p.merchantId === storeId);
  const totalStock = merchantProducts.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = merchantProducts.filter((p) => p.stock > 0 && p.stock <= 3);

  // Filter store orders & sales
  const merchantOrders = orders.filter((order) =>
    order.lines.some((line) => line.merchantId === storeId)
  );

  const storeSalesTotal = merchantOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => {
      const orderStoreLines = order.lines.filter((l) => l.merchantId === storeId);
      const storeSubtotal = orderStoreLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
      return sum + storeSubtotal;
    }, 0);

  const pendingConfirmation = merchantOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'preparing'
  );

  return (
    <div className="space-y-6">
      {/* Low stock alert banner */}
      {lowStock.length > 0 && (
        <div className="bg-[#FFF1D9] border border-[#FEEBC8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE4B5] flex items-center justify-center text-[#975A16] flex-shrink-0">
              <TriangleAlert size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#975A16]">
                Atenção ao Stock: {lowStock.length} peça{lowStock.length > 1 ? 's' : ''} quase a terminar!
              </h4>
              <p className="text-[11px] text-[#975A16]/80 mt-0.5">
                {lowStock.map((p) => `${p.name} (${p.stock} un.)`).join(' · ')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('merchant-products')}
          >
            Ajustar Stock
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<CircleDollarSign size={20} />}
          label="Faturamento da Loja"
          value={formatKz(storeSalesTotal)}
          change="Vendas confirmadas"
          isPositive={true}
          helpText="Excluindo comissão"
        />
        <MetricCard
          icon={<ShoppingBag size={20} />}
          label="Total de Encomendas"
          value={`${merchantOrders.length}`}
          change={`${pendingConfirmation.length} por despachar`}
          isPositive={pendingConfirmation.length > 0}
          helpText="Clientes em Angola"
        />
        <MetricCard
          icon={<Package size={20} />}
          label="Peças no Catálogo"
          value={`${merchantProducts.length}`}
          helpText={`${totalStock} unidades em stock`}
        />
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Ticket Médio"
          value={
            merchantOrders.length
              ? formatKz(Math.round(storeSalesTotal / merchantOrders.length))
              : 'Kz 0,00'
          }
          helpText="Por encomenda recebida"
        />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('merchant-products')}
          className="bg-white border border-[#F0E5E8] hover:border-[#E98A9A] rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] text-[#C95F72] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#252225]">Adicionar Produto</div>
            <div className="text-[10px] text-[#777277]">Publicar nova peça com fotos</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('merchant-orders')}
          className="bg-white border border-[#F0E5E8] hover:border-[#E98A9A] rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF8FF] text-[#2B6CB0] flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#252225]">Ver Encomendas</div>
            <div className="text-[10px] text-[#777277]">
              {pendingConfirmation.length} encomenda{pendingConfirmation.length !== 1 ? 's' : ''} ativa{pendingConfirmation.length !== 1 ? 's' : ''}
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('merchant-profile')}
          className="bg-white border border-[#F0E5E8] hover:border-[#E98A9A] rounded-2xl p-4 flex items-center gap-3 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E5F3EA] text-[#286744] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Store size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#252225]">Editar Perfil da Loja</div>
            <div className="text-[10px] text-[#777277]">Logotipo, IBAN e WhatsApp</div>
          </div>
        </button>
      </div>

      {/* Grid: Recent Orders & Catalog status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-8">
          <Card
            title="Encomendas Recentes da Sua Loja"
            subtitle="Pedidos contendo as suas peças"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight size={14} />}
                onClick={() => onNavigate('merchant-orders')}
              >
                Todas as Encomendas
              </Button>
            }
          >
            {merchantOrders.length === 0 ? (
              <div className="text-center py-10 text-[#777277]">
                <ShoppingBag size={32} className="mx-auto text-[#E98A9A] mb-2" />
                <p className="font-bold text-xs text-[#252225]">Ainda sem encomendas</p>
                <p className="text-[11px] mt-0.5">
                  Quando um cliente comprar um produto da sua loja, o pedido aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                      <th className="pb-3 pl-1">Encomenda</th>
                      <th className="pb-3">Comprador</th>
                      <th className="pb-3">Suas Peças</th>
                      <th className="pb-3">Valor Loja</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3 pr-1 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E5E8] text-xs">
                    {merchantOrders.slice(0, 5).map((order) => {
                      const storeLines = order.lines.filter((l) => l.merchantId === storeId);
                      const storeVal = storeLines.reduce(
                        (sum, l) => sum + l.unitPrice * l.quantity,
                        0
                      );

                      return (
                        <tr key={order.id} className="hover:bg-[#FFF8FA] transition-colors">
                          <td className="py-3.5 pl-1 font-mono font-bold text-[#252225]">
                            #{order.id.slice(-5)}
                          </td>
                          <td className="py-3.5">
                            <div className="font-semibold text-[#252225]">
                              {order.customer.fullName}
                            </div>
                            <div className="text-[10px] text-[#777277]">
                              {order.customer.municipality}, {order.customer.province}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-semibold text-[#252225]">
                              {storeLines.map((l) => `${l.quantity}x ${l.name}`).join(' · ')}
                            </span>
                          </td>
                          <td className="py-3.5 font-bold text-[#C95F72]">
                            {formatKz(storeVal)}
                          </td>
                          <td className="py-3.5">
                            <OrderStatusBadge status={order.status} size="sm" />
                          </td>
                          <td className="py-3.5 pr-1 text-right">
                            {order.receipt && (
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg text-[#777277] hover:text-[#C95F72] hover:bg-[#FCE7EC] transition-colors cursor-pointer"
                                title="Ver Comprovativo"
                              >
                                <Eye size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right side: Top products in store */}
        <div className="lg:col-span-4">
          <Card
            title="Peças em Destaque"
            subtitle="Inventário ativo no app"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('merchant-products')}
              >
                Gerir
              </Button>
            }
          >
            <div className="space-y-3">
              {merchantProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF8FA] transition-colors border border-transparent hover:border-[#F0E5E8]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-14 rounded-lg object-cover bg-[#FCE7EC]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#252225] truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] font-bold text-[#C95F72] mt-0.5">
                      {formatKz(product.price)}
                    </p>
                    <p className="text-[10px] text-[#777277] mt-0.5">
                      Stock: <span className="font-semibold">{product.stock} unidades</span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      product.stock === 0
                        ? 'bg-[#FEE2E2] text-[#DC2626]'
                        : product.stock <= 3
                        ? 'bg-[#FFF1D9] text-[#975A16]'
                        : 'bg-[#E5F3EA] text-[#286744]'
                    }`}
                  >
                    {product.stock === 0 ? 'Esgotado' : 'Ativo'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptViewerModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onValidate={validatePayment}
        canValidate={false}
      />
    </div>
  );
};
