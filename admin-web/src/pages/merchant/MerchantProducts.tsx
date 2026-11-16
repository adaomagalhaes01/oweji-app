import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatKz } from '../../constants/palette';
import { initialCategories } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConditionBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Product, ProductCondition } from '../../types';

export const MerchantProducts: React.FC = () => {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, updateStock } = useApp();
  const storeId = currentUser?.storeId || '';
  const storeName = currentUser?.storeName || 'A Minha Loja';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    category: string;
    condition: ProductCondition;
    stock: number;
    sizes: string[];
    colors: string[];
    image: string;
  }>({
    name: '',
    description: '',
    price: 15000,
    category: 'vestidos',
    condition: 'new',
    stock: 5,
    sizes: ['S', 'M'],
    colors: ['#E98A9A'],
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
  });

  const merchantProducts = products.filter((p) => p.merchantId === storeId);

  const filteredProducts = merchantProducts.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 15000,
      category: 'vestidos',
      condition: 'new',
      stock: 5,
      sizes: ['S', 'M'],
      colors: ['#E98A9A'],
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      condition: product.condition,
      stock: product.stock,
      sizes: product.sizes,
      colors: product.colors,
      image: product.image,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
      });
    } else {
      addProduct({
        ...formData,
        merchantId: storeId,
        merchantStoreName: storeName,
        available: true,
      });
    }
    setIsModalOpen(false);
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'Único', '36', '37', '38', '39', '40'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#252225] flex items-center gap-2">
              <Package className="text-[#C95F72]" size={20} />
              Gestão de Peças e Stock · {storeName}
            </h2>
            <p className="text-xs text-[#777277] mt-1">
              Adicione roupas, vestidos e acessórios, defina tamanhos e acompanhe as unidades em stock.
            </p>
          </div>

          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={handleOpenNew}>
            Nova Peça
          </Button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-[#F0E5E8]">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {initialCategories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#E98A9A] text-white shadow-xs'
                    : 'bg-[#FFF8FA] text-[#777277] hover:bg-[#FCE7EC]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-[#777277]" />
            <input
              type="text"
              placeholder="Pesquisar nos seus produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#F0E5E8] bg-[#FFF8FA] focus:bg-white focus:outline-none focus:border-[#E98A9A]"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[#777277]">
            <Package size={36} className="mx-auto text-[#E98A9A] mb-2" />
            <h3 className="font-bold text-sm text-[#252225]">Nenhum produto cadastrado</h3>
            <p className="text-xs mt-1 mb-4">Comece agora adicionando a primeira peça da sua loja!</p>
            <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={handleOpenNew}>
              Publicar Peça
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0E5E8] text-[11px] font-bold text-[#777277] uppercase tracking-wider">
                  <th className="pb-3 pl-1">Produto</th>
                  <th className="pb-3">Condição</th>
                  <th className="pb-3">Preço (Kz)</th>
                  <th className="pb-3">Stock Disponível</th>
                  <th className="pb-3">Tamanhos</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 pr-1 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E5E8] text-xs">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FFF8FA] transition-colors">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-14 rounded-lg object-cover bg-[#FCE7EC] border border-[#F0E5E8]"
                        />
                        <div>
                          <div className="font-bold text-[#252225]">{product.name}</div>
                          <div className="text-[10px] text-[#777277] mt-0.5 line-clamp-1 max-w-[200px]">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <ConditionBadge condition={product.condition} />
                    </td>
                    <td className="py-3 font-bold text-[#C95F72]">
                      {formatKz(product.price)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(e) => updateStock(product.id, Number(e.target.value))}
                          className="w-14 text-center text-xs font-bold py-1 px-1.5 rounded-lg border border-[#F0E5E8] bg-white focus:outline-none focus:border-[#E98A9A]"
                        />
                        {product.stock <= 3 && product.stock > 0 && (
                          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
                            Baixo
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-[#777277]">
                      <div className="flex gap-1 flex-wrap max-w-[120px]">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-semibold bg-[#FFF8FA] border border-[#F0E5E8] px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => updateProduct(product.id, { available: !product.available })}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          product.available
                            ? 'bg-[#E5F3EA] text-[#286744] border-[#C3E6CB]'
                            : 'bg-gray-100 text-gray-500 border-gray-300'
                        }`}
                      >
                        {product.available ? 'Ativo' : 'Pausado'}
                      </button>
                    </td>
                    <td className="py-3 pr-1 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 rounded-lg text-[#777277] hover:text-[#C95F72] hover:bg-[#FCE7EC] transition-colors cursor-pointer"
                          title="Editar Peça"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 rounded-lg text-[#777277] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                          title="Remover Peça"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for New / Edit Product */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Peça' : 'Publicar Nova Peça'}
        subtitle="Preencha os detalhes da peça para disponibilizar no marketplace OWEJI."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Nome da Peça *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Vestido Estampado Tropical"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Preço em Kwanzas (Kz) *
              </label>
              <input
                type="number"
                required
                min="500"
                step="100"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Stock Inicial (Unidades) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              >
                <option value="vestidos">Vestidos</option>
                <option value="tops">Tops & Camisas</option>
                <option value="saias">Saias</option>
                <option value="calcas">Calças</option>
                <option value="calcado">Calçado</option>
                <option value="acessorios">Acessórios</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Condição da Peça *
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value as ProductCondition })
                }
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              >
                <option value="new">Novo (Com etiqueta)</option>
                <option value="semi-new">Seminovo (Pouco uso)</option>
                <option value="good-used">Segunda mão (Bom estado)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Tamanhos Disponíveis
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const isSelected = formData.sizes.includes(sz);
                  return (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E98A9A] text-white border-[#E98A9A]'
                          : 'bg-[#FFF8FA] text-[#777277] border-[#F0E5E8] hover:border-[#E98A9A]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                URL da Fotografia
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
              {formData.image && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-14 h-16 rounded-lg object-cover border border-[#F0E5E8]"
                  />
                  <span className="text-[11px] text-[#777277]">Pré-visualização da imagem</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#252225] mb-1">
                Descrição da Peça
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes sobre o tecido, corte e cuidados..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#F0E5E8]">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingProduct ? 'Gravar Alterações' : 'Publicar Peça'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
