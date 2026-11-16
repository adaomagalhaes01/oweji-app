import React from 'react';
import {
  TrendingUp,
  CircleDollarSign,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { Card, MetricCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const MerchantSales: React.FC = () => {
  const { currentUser, orders, stores } = useApp();
  const storeId = currentUser?.storeId || '';
  const currentStore = stores.find((s) => s.id === storeId);
  const commissionRate = currentStore?.commissionRate || 10;

  // Filter delivered / confirmed sales for this store
  const storeOrders = orders.filter((order) =>
    order.lines.some((l) => l.merchantId === storeId) && order.status !== 'cancelled'
  );

  const totalBruto = storeOrders.reduce((sum, order) => {
    const lines = order.lines.filter((l) => l.merchantId === storeId);
    return sum + lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  }, 0);

  const totalComissao = Math.round(totalBruto * (commissionRate / 100));
  const totalLiquido = totalBruto - totalComissao;

  // Best selling products in store
  const bestProducts = (() => {
    const map = new Map<string, { name: string; qty: number; total: number }>();
    storeOrders.forEach((order) => {
      order.lines
        .filter((l) => l.merchantId === storeId)
        .forEach((line) => {
          const cur = map.get(line.productId) || { name: line.name, qty: 0, total: 0 };
          cur.qty += line.quantity;
          cur.total += line.unitPrice * line.quantity;
          map.set(line.productId, cur);
        });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  })();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#252225] flex items-center gap-2">
              <TrendingUp className="text-[#C95F72]" size={20} />
              Desempenho Financeiro & Repasses
            </h2>
            <p className="text-xs text-[#777277] mt-1">
              Acompanhe as receitas das suas peças, cálculo da comissão de {commissionRate}% e os repasses bancários para a sua conta.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFF8FA] p-3 rounded-xl border border-[#F0E5E8]">
            <CreditCard size={18} className="text-[#C95F72]" />
            <div className="text-xs">
              <div className="text-[10px] text-[#777277]">Conta de Repasse (IBAN):</div>
              <div className="font-mono font-bold text-[#252225]">
                {currentStore?.iban || 'Pendente de registo'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<CircleDollarSign size={20} />}
          label="Faturamento Bruto da Loja"
          value={formatKz(totalBruto)}
          helpText="Total em vendas de produtos"
        />
        <MetricCard
          icon={<Receipt size={20} />}
          label={`Comissão Marketplace (${commissionRate}%)`}
          value={formatKz(totalComissao)}
          helpText="Retenção operacional OWEJI"
        />
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Líquido a Receber"
          value={formatKz(totalLiquido)}
          isPositive={true}
          change="Saldo Disponível"
          helpText="Valor líquido a transferir"
        />
      </div>

      {/* Grid: Sales History & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Breakdown by Order */}
        <div className="lg:col-span-8">
          <Card
            title="Histórico de Vendas Concluídas"
            subtitle="Extrato detalhado por encomenda"
          >
            {storeOrders.length === 0 ? (
              <div className="text-center py-10 text-[#777277]">
                <Receipt size={32} className="mx-auto text-[#E98A9A] mb-2" />
                <p className="font-bold text-xs text-[#252225]">Sem histórico de vendas</p>
                <p className="text-[11px] mt-0.5">As compras confirmadas serão listadas aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                      <th className="pb-3 pl-1">Data / ID</th>
                      <th className="pb-3">Comprador</th>
                      <th className="pb-3">Bruto</th>
                      <th className="pb-3">Comissão ({commissionRate}%)</th>
                      <th className="pb-3 pr-1 text-right">Líquido Loja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E5E8] text-xs">
                    {storeOrders.map((order) => {
                      const lines = order.lines.filter((l) => l.merchantId === storeId);
                      const bruto = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
                      const comissao = Math.round(bruto * (commissionRate / 100));
                      const liquido = bruto - comissao;

                      return (
                        <tr key={order.id} className="hover:bg-[#FFF8FA] transition-colors">
                          <td className="py-3 pl-1 font-mono font-bold text-[#252225]">
                            #{order.id.slice(-5)}
                            <div className="text-[10px] text-[#777277] font-sans font-normal">
                              {new Date(order.createdAt).toLocaleDateString('pt-AO', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-[#252225]">
                            {order.customer.fullName}
                          </td>
                          <td className="py-3 font-bold text-[#252225]">
                            {formatKz(bruto)}
                          </td>
                          <td className="py-3 text-[#777277]">
                            -{formatKz(comissao)}
                          </td>
                          <td className="py-3 pr-1 text-right font-bold text-[#4FA982]">
                            {formatKz(liquido)}
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

        {/* Top selling products in store */}
        <div className="lg:col-span-4">
          <Card title="Peças Mais Vendidas" subtitle="Ranking de popularidade na loja">
            {bestProducts.length === 0 ? (
              <p className="text-xs text-[#777277] py-6 text-center">Nenhum dado de venda ainda.</p>
            ) : (
              <div className="space-y-3">
                {bestProducts.slice(0, 5).map((prod, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8FA] border border-[#F0E5E8]"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#252225] leading-tight">
                        {prod.name}
                      </div>
                      <span className="text-[10px] text-[#777277]">
                        {prod.qty} {prod.qty === 1 ? 'peça vendida' : 'peças vendidas'}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-[#C95F72]">
                      {formatKz(prod.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
