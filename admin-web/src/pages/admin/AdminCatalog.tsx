import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Tag,
  Store,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { initialCategories } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConditionBadge } from '../../components/ui/Badge';
import { Product } from '../../types';

export const AdminCatalog: React.FC = () => {
  const { products, updateProduct, deleteProduct, stores } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (selectedStore !== 'all' && product.merchantId !== selectedStore) return false;
    if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.merchantStoreName.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleAvailability = (product: Product) => {
    updateProduct(product.id, { available: !product.available });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#252225] flex items-center gap-2">
              <Package className="text-[#C95F72]" size={20} />
              Catálogo Global & Moderação de Peças
            </h2>
            <p className="text-xs text-[#777277] mt-1">
              Controle todas as peças publicadas pelos comerciantes em Angola. Pause itens irregulares ou remova anúncios reportados.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-[#777277]" />
            <input
              type="text"
              placeholder="Pesquisar produto ou loja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#E98A9A]"
            />
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#F0E5E8]">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#777277] mb-1">
              Categoria:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:outline-none"
            >
              {initialCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#777277] mb-1">
              Loja / Comerciante:
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:outline-none"
            >
              <option value="all">Todas as Lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#777277] mb-1">
              Estado / Condição:
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:outline-none"
            >
              <option value="all">Todas as Condições</option>
              <option value="new">Novo (Com etiqueta)</option>
              <option value="semi-new">Seminovo</option>
              <option value="good-used">Segunda mão (Bom estado)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                <th className="pb-3 pl-1">Produto</th>
                <th className="pb-3">Loja</th>
                <th className="pb-3">Condição</th>
                <th className="pb-3">Preço</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 pr-1 text-right">Moderação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E5E8] text-xs">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#FFF8FA] transition-colors">
                  <td className="py-3.5 pl-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-14 rounded-lg object-cover bg-[#FCE7EC]"
                      />
                      <div>
                        <div className="font-bold text-[#252225] leading-tight">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-[#777277] mt-0.5">
                          Tamanhos: {product.sizes.join(', ')} · Categoria: {product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-[#252225]">{product.merchantStoreName}</div>
                    <div className="text-[10px] text-[#777277] font-mono">{product.merchantId}</div>
                  </td>
                  <td className="py-3.5">
                    <ConditionBadge condition={product.condition} />
                  </td>
                  <td className="py-3.5 font-bold text-[#C95F72]">
                    {formatKz(product.price)}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-xs ${
                        product.stock === 0
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : product.stock <= 3
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#E5F3EA] text-[#286744]'
                      }`}
                    >
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        product.available ? 'text-[#286744]' : 'text-[#777277]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.available ? 'bg-[#286744]' : 'bg-[#777277]'
                        }`}
                      />
                      {product.available ? 'No App' : 'Oculto'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-1 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={product.available ? 'outline' : 'secondary'}
                        size="sm"
                        icon={product.available ? <EyeOff size={13} /> : <Eye size={13} />}
                        onClick={() => toggleAvailability(product)}
                      >
                        {product.available ? 'Pausar' : 'Ativar'}
                      </Button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 text-[#777277] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                        title="Remover produto permanentemente"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
