import React from 'react';
import { Bell, CheckCircle, AlertTriangle, ShieldCheck, Store, Plus, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface TopbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, orders, toast } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const pendingReviews = orders.filter((o) => o.status === 'payment-review').length;

  const getPageInfo = () => {
    switch (currentTab) {
      case 'admin-dashboard':
        return { title: 'Visão Geral do Marketplace', subtitle: 'Métricas globais, volume de transações e atividade recente.' };
      case 'admin-financial':
        return { title: 'Auditoria de Comprovativos Bancários', subtitle: 'Validação manual de transferências bancárias em Kwanzas.' };
      case 'admin-merchants':
        return { title: 'Gestão de Lojas e Comerciantes', subtitle: 'Aprovação, controlo de comissões e monitorização de lojistas.' };
      case 'admin-catalog':
        return { title: 'Catálogo Global OWEJI', subtitle: 'Controlo de produtos, moderação e categorias de moda.' };
      case 'admin-orders':
        return { title: 'Todas as Encomendas da Plataforma', subtitle: 'Acompanhamento do ciclo de vida dos pedidos em Angola.' };
      case 'merchant-dashboard':
        return { title: `Painel da Loja · ${currentUser?.storeName}`, subtitle: 'Desempenho da sua loja, alertas de stock e vendas recentes.' };
      case 'merchant-products':
        return { title: 'Os Meus Produtos', subtitle: 'Gerencie o seu catálogo, preços, variações e stock disponível.' };
      case 'merchant-orders':
        return { title: 'Encomendas dos Clientes', subtitle: 'Processe os pedidos da sua loja e atualize o estado de entrega.' };
      case 'merchant-sales':
        return { title: 'Vendas & Relatórios Financeiros', subtitle: 'Faturamento detalhado, histórico de compras e repasses.' };
      case 'merchant-profile':
        return { title: 'Configurações da Loja', subtitle: 'Informações comerciais, contactos de Luanda/Angola e IBAN para repasse.' };
      default:
        return { title: 'Painel OWEJI', subtitle: 'Marketplace de Moda em Angola' };
    }
  };

  const page = getPageInfo();

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F0E5E8] px-8 py-4 z-20">
      {/* Toast banner */}
      {toast && (
        <div
          className={`mb-3 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
              : toast.type === 'info'
              ? 'bg-[#EBF8FF] text-[#2B6CB0] border border-[#BEE3F8]'
              : 'bg-[#E5F3EA] text-[#286744] border border-[#C3E6CB]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-extrabold text-[#252225] tracking-tight">{page.title}</h1>
          <p className="text-xs text-[#777277] mt-0.5">{page.subtitle}</p>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Quick status pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isAdmin
                ? 'bg-[#FCE7EC] text-[#C95F72] border-[#E98A9A]/30'
                : 'bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]'
            }`}
          >
            {isAdmin ? <ShieldCheck size={14} /> : <Store size={14} />}
            <span>{isAdmin ? 'Modo Administrador' : `Lojista: ${currentUser?.storeName}`}</span>
          </div>

          {/* Contextual Action Button */}
          {isAdmin ? (
            pendingReviews > 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon={<AlertTriangle size={14} />}
                onClick={() => onSelectTab('admin-financial')}
              >
                {pendingReviews} Comprovativo{pendingReviews > 1 ? 's' : ''} a validar
              </Button>
            )
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => onSelectTab('merchant-products')}
            >
              Publicar Produto
            </Button>
          )}

          {/* Notifications bell */}
          <button
            onClick={() => onSelectTab(isAdmin ? 'admin-financial' : 'merchant-orders')}
            className="relative p-2.5 rounded-xl border border-[#F0E5E8] hover:bg-[#FFF8FA] text-[#777277] hover:text-[#252225] transition-colors cursor-pointer"
            title="Notificações de pedidos"
          >
            <Bell size={18} />
            {pendingReviews > 0 && isAdmin && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C95F72] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingReviews}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
