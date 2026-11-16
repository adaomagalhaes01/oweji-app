import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  ShieldAlert,
  LogOut,
  UserCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, switchRole, orders, products } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // Counts for badges
  const pendingReviews = orders.filter((o) => o.status === 'payment-review').length;
  const merchantOrders = orders.filter((o) =>
    o.lines.some((l) => l.merchantId === currentUser?.storeId)
  );
  const merchantPending = merchantOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'preparing'
  ).length;
  const lowStockCount = products.filter(
    (p) => p.merchantId === currentUser?.storeId && p.stock > 0 && p.stock <= 3
  ).length;

  const adminNav = [
    { id: 'admin-dashboard', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
    {
      id: 'admin-financial',
      label: 'Validação Bancária',
      icon: <CheckCircle2 size={18} />,
      badge: pendingReviews > 0 ? pendingReviews : undefined,
      badgeColor: 'bg-[#C95F72] text-white',
    },
    { id: 'admin-merchants', label: 'Comerciantes & Lojas', icon: <Store size={18} /> },
    { id: 'admin-catalog', label: 'Catálogo Global', icon: <Package size={18} /> },
    { id: 'admin-orders', label: 'Todas as Encomendas', icon: <ShoppingBag size={18} /> },
  ];

  const merchantNav = [
    { id: 'merchant-dashboard', label: 'Painel da Loja', icon: <LayoutDashboard size={18} /> },
    {
      id: 'merchant-products',
      label: 'Os Meus Produtos',
      icon: <Package size={18} />,
      badge: lowStockCount > 0 ? `${lowStockCount} baixo` : undefined,
      badgeColor: 'bg-[#FFF1D9] text-[#975A16]',
    },
    {
      id: 'merchant-orders',
      label: 'Encomendas',
      icon: <ShoppingBag size={18} />,
      badge: merchantPending > 0 ? merchantPending : undefined,
      badgeColor: 'bg-[#E98A9A] text-white',
    },
    { id: 'merchant-sales', label: 'Vendas & Relatórios', icon: <TrendingUp size={18} /> },
    { id: 'merchant-profile', label: 'Configurações da Loja', icon: <Settings size={18} /> },
  ];

  const currentNav = isAdmin ? adminNav : merchantNav;

  return (
    <aside className="w-64 bg-white border-r border-[#F0E5E8] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-30">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#F0E5E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E98A9A] flex items-center justify-center text-white font-black text-lg shadow-sm">
              O
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#252225] tracking-tight">OWEJI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FCE7EC] text-[#C95F72]">
                  Web
                </span>
              </div>
              <p className="text-[10px] text-[#777277] font-medium tracking-wide">
                MARKETPLACE DE MODA
              </p>
            </div>
          </div>

          {/* Active Profile Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-[#FFF8FA] border border-[#F0E5E8] flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#E98A9A]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#FCE7EC] text-[#C95F72] flex items-center justify-center font-bold text-xs">
                  {currentUser?.name[0]}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-[#252225] truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-[#777277] truncate">
                  {isAdmin ? 'Administrador Geral' : currentUser?.storeName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#777277] uppercase tracking-wider">
            {isAdmin ? 'Gestão da Plataforma' : 'Gestão do Comerciante'}
          </div>
          {currentNav.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#FCE7EC] text-[#C95F72] shadow-sm'
                    : 'text-[#777277] hover:bg-[#FFF8FA] hover:text-[#252225]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#C95F72]' : 'text-[#777277]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-[#FCE7EC] text-[#C95F72]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & Bottom Actions */}
      <div className="p-4 border-t border-[#F0E5E8] bg-[#FFF8FA]/60 space-y-3">
        {/* Role toggle widget */}
        <div className="p-2.5 rounded-xl bg-white border border-[#F0E5E8] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#777277] flex items-center gap-1">
              <Sparkles size={11} className="text-[#C95F72]" /> Trocar de Perfil
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                switchRole('admin');
                onSelectTab('admin-dashboard');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                isAdmin
                  ? 'bg-[#C95F72] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC] hover:text-[#252225]'
              }`}
            >
              <ShieldAlert size={12} /> Admin
            </button>
            <button
              onClick={() => {
                switchRole('merchant', 'STORE-ROSA');
                onSelectTab('merchant-dashboard');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                !isAdmin && currentUser?.storeId === 'STORE-ROSA'
                  ? 'bg-[#E98A9A] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC] hover:text-[#252225]'
              }`}
            >
              <Store size={12} /> Loja Rosa
            </button>
          </div>
          <button
            onClick={() => {
              switchRole('merchant', 'STORE-KILAMBA');
              onSelectTab('merchant-dashboard');
            }}
            className={`w-full mt-1.5 py-1 px-2 rounded-lg text-[10px] font-semibold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
              !isAdmin && currentUser?.storeId === 'STORE-KILAMBA'
                ? 'bg-[#E98A9A] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC] hover:text-[#252225]'
            }`}
          >
            <Building2 size={11} /> Loja Kilamba
          </button>
        </div>

        <div className="text-[10px] text-center text-[#777277]">
          OWEJI Admin v1.0.0 · Angola
        </div>
      </div>
    </aside>
  );
};
