import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Check,
  Ban,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Percent,
  Plus,
  ExternalLink,
  Edit2,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StoreStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Store } from '../../types';

export const AdminMerchants: React.FC = () => {
  const { stores, approveStore, suspendStore, updateStore } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Form states for editing commission / details
  const [commissionRate, setCommissionRate] = useState(10);

  const filteredStores = stores.filter((store) => {
    if (filter !== 'all' && store.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        store.name.toLowerCase().includes(q) ||
        store.ownerName.toLowerCase().includes(q) ||
        store.province.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setCommissionRate(store.commissionRate);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    updateStore(editingStore.id, { commissionRate });
    setEditingStore(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#252225] flex items-center gap-2">
              <StoreIcon className="text-[#C95F72]" size={20} />
              Gestão de Comerciantes & Lojas Parceiras
            </h2>
            <p className="text-xs text-[#777277] mt-1">
              Controle o acesso, aprove novas lojas e defina a comissão cobrada pelo marketplace OWEJI.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-[#777277]" />
              <input
                type="text"
                placeholder="Pesquisar loja, proprietário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#E98A9A]"
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F0E5E8]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#E98A9A] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
            }`}
          >
            Todas ({stores.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'active'
                ? 'bg-[#E98A9A] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
            }`}
          >
            Ativas ({stores.filter((s) => s.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#E98A9A] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
            }`}
          >
            Sob Análise ({stores.filter((s) => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'suspended'
                ? 'bg-[#E98A9A] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
            }`}
          >
            Suspensas ({stores.filter((s) => s.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-2xl border border-[#F0E5E8] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Header info */}
            <div>
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#F0E5E8]"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[#252225] leading-tight">
                        {store.name}
                      </h3>
                      <p className="text-xs text-[#777277] mt-0.5">{store.ownerName}</p>
                    </div>
                  </div>
                  <StoreStatusBadge status={store.status} />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#777277]">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[#C95F72]" />
                    <span>{store.location}, {store.province}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} />
                    <span>{store.email}</span>
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="mx-5 my-2 p-3 rounded-xl bg-[#FFF8FA] border border-[#F0E5E8] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#777277] flex items-center gap-1">
                    <CreditCard size={12} /> Banco / IBAN:
                  </span>
                  <span className="font-semibold text-[#252225] truncate max-w-[140px]" title={store.iban}>
                    {store.bankName}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#777277] truncate">
                  {store.iban}
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-[#F0E5E8]">
                  <span className="text-[#777277]">Taxa de Comissão:</span>
                  <span className="font-bold text-[#C95F72] bg-white px-2 py-0.5 rounded border border-[#F0E5E8]">
                    {store.commissionRate}%
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-5 py-2 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-[#FFF8FA] p-2 rounded-xl">
                  <span className="text-[10px] text-[#777277]">Vendas Totais</span>
                  <p className="font-bold text-[#252225] mt-0.5">{formatKz(store.totalSales)}</p>
                </div>
                <div className="bg-[#FFF8FA] p-2 rounded-xl">
                  <span className="text-[10px] text-[#777277]">Catálogo</span>
                  <p className="font-bold text-[#252225] mt-0.5">{store.productsCount} peças</p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-[#F0E5E8] bg-gray-50/50 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit2 size={13} />}
                onClick={() => handleOpenEdit(store)}
              >
                Ajustar Taxa
              </Button>

              {store.status === 'pending' ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check size={14} />}
                  onClick={() => approveStore(store.id)}
                >
                  Aprovar Loja
                </Button>
              ) : store.status === 'active' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#DC2626] hover:bg-[#FEE2E2]"
                  icon={<Ban size={14} />}
                  onClick={() => suspendStore(store.id)}
                >
                  Suspender
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Check size={14} />}
                  onClick={() => approveStore(store.id)}
                >
                  Reativar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Store Modal */}
      {editingStore && (
        <Modal
          isOpen={Boolean(editingStore)}
          onClose={() => setEditingStore(null)}
          title={`Editar Taxa · ${editingStore.name}`}
          subtitle="Ajuste a comissão retida pela plataforma para as vendas desta loja."
        >
          <form onSubmit={handleSaveStore} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Comissão OWEJI (% retida por venda):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
                />
                <span className="font-bold text-sm text-[#777277]">%</span>
              </div>
              <p className="text-[11px] text-[#777277] mt-1">
                Taxa padrão sugerida pelo marketplace: 8% a 10%.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#F0E5E8]">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingStore(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Gravar Alterações
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
