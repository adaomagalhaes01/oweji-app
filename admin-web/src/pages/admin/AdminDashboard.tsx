import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Store,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { MetricCard, Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderStatusBadge, StoreStatusBadge } from '../../components/ui/Badge';
import { ReceiptViewerModal } from '../../components/common/ReceiptViewerModal';
import { Order } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { orders, stores, products, validatePayment } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Computed metrics
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'confirmed');
  const gmvTotal = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingReviews = orders.filter((o) => o.status === 'payment-review');
  const activeStores = stores.filter((s) => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Pending Reviews Alert Banner */}
      {pendingReviews.length > 0 && (
        <div className="bg-[#FFF1D9] border border-[#FEEBC8] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE4B5] flex items-center justify-center text-[#975A16] flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#975A16]">
                {pendingReviews.length} Comprovativo{pendingReviews.length > 1 ? 's' : ''} Bancário{pendingReviews.length > 1 ? 's' : ''} a aguardar validação
              </h4>
              <p className="text-xs text-[#975A16]/80 mt-0.5">
                Os clientes já anexaram o comprovativo de transferência bancária em Kwanzas. Valide para liberar o envio pelos comerciantes.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<ShieldCheck size={16} />}
            onClick={() => onNavigate('admin-financial')}
          >
            Auditar Agora
          </Button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Volume Total (GMV)"
          value={formatKz(gmvTotal)}
          change="14.2% este mês"
          isPositive={true}
          helpText="Transacionado na plataforma"
        />
        <MetricCard
          icon={<ShoppingBag size={20} />}
          label="Total de Encomendas"
          value={`${orders.length}`}
          change={`${completedOrders.length} concluídas`}
          isPositive={true}
          helpText="Em todas as províncias"
        />
        <MetricCard
          icon={<Store size={20} />}
          label="Lojas Cadastradas"
          value={`${stores.length}`}
          helpText={`${activeStores.length} ativas no marketplace`}
        />
        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Auditoria Bancária"
          value={`${pendingReviews.length}`}
          helpText={pendingReviews.length === 0 ? 'Tudo em dia!' : 'Aguardando conferência'}
        />
      </div>

      {/* Grid with 2 columns: Recent Orders & Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders (8 cols) */}
        <div className="lg:col-span-8">
          <Card
            title="Encomendas Recentes da Plataforma"
            subtitle="Últimos pedidos realizados no app móvel Oweji"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight size={14} />}
                onClick={() => onNavigate('admin-orders')}
              >
                Ver Todas
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                    <th className="pb-3 pl-1">ID Encomenda</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Lojas / Itens</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 pr-1 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E5E8] text-xs">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-[#FFF8FA] transition-colors">
                      <td className="py-3.5 pl-1 font-mono font-bold text-[#252225]">
                        #{order.id.slice(-5)}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-[#252225]">{order.customer.fullName}</div>
                        <div className="text-[10px] text-[#777277]">{order.customer.municipality}, {order.customer.province}</div>
                      </td>
                      <td className="py-3.5 text-[#777277]">
                        <span className="font-semibold text-[#252225]">{order.lines.length} {order.lines.length === 1 ? 'item' : 'itens'}</span>
                        <div className="text-[10px] truncate max-w-[150px]">
                          {order.lines.map((l) => l.merchantStoreName).join(', ')}
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
                            Ver Comprovativo
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
        </div>

        {/* Right Column: Active Stores & Top Categories (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            title="Lojas no Marketplace"
            subtitle="Comerciantes cadastrados"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-merchants')}
              >
                Gerir
              </Button>
            }
          >
            <div className="space-y-3.5">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF8FA] transition-colors border border-transparent hover:border-[#F0E5E8]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#F0E5E8]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#252225] leading-tight">
                        {store.name}
                      </h4>
                      <p className="text-[10px] text-[#777277] mt-0.5">
                        {store.province} · {store.productsCount} produtos
                      </p>
                    </div>
                  </div>
                  <StoreStatusBadge status={store.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Distribuição do Catálogo" subtitle="Peças publicadas por condição">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#286744]">Novos (Etiqueta de Fábrica)</span>
                  <span className="font-bold text-[#252225]">
                    {products.filter((p) => p.condition === 'new').length}
                  </span>
                </div>
                <div className="w-full bg-[#F0E5E8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4FA982] h-full rounded-full"
                    style={{
                      width: `${(products.filter((p) => p.condition === 'new').length / products.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#2B6CB0]">Seminovos (Excelente Estado)</span>
                  <span className="font-bold text-[#252225]">
                    {products.filter((p) => p.condition === 'semi-new').length}
                  </span>
                </div>
                <div className="w-full bg-[#F0E5E8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2B6CB0] h-full rounded-full"
                    style={{
                      width: `${(products.filter((p) => p.condition === 'semi-new').length / products.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#975A16]">Segunda Mão (Brechó / Vintage)</span>
                  <span className="font-bold text-[#252225]">
                    {products.filter((p) => p.condition === 'good-used').length}
                  </span>
                </div>
                <div className="w-full bg-[#F0E5E8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D99A52] h-full rounded-full"
                    style={{
                      width: `${(products.filter((p) => p.condition === 'good-used').length / products.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
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
        canValidate={true}
      />
    </div>
  );
};
