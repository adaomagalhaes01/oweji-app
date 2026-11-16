import React, { useState } from 'react';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  Save,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const MerchantProfile: React.FC = () => {
  const { currentUser, stores, updateStore, showToast } = useApp();
  const storeId = currentUser?.storeId || '';
  const currentStore = stores.find((s) => s.id === storeId);

  const [name, setName] = useState(currentStore?.name || '');
  const [ownerName, setOwnerName] = useState(currentStore?.ownerName || '');
  const [phone, setPhone] = useState(currentStore?.phone || '');
  const [email, setEmail] = useState(currentStore?.email || '');
  const [location, setLocation] = useState(currentStore?.location || '');
  const [province, setProvince] = useState(currentStore?.province || 'Luanda');
  const [bankName, setBankName] = useState(currentStore?.bankName || '');
  const [iban, setIban] = useState(currentStore?.iban || '');
  const [logo, setLogo] = useState(currentStore?.logo || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    updateStore(currentStore.id, {
      name,
      ownerName,
      phone,
      email,
      location,
      province,
      bankName,
      iban,
      logo,
    });
    showToast('Perfil da loja gravado com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-[#F0E5E8] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Logo"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E98A9A] shadow-sm"
          />
          <div>
            <h2 className="text-xl font-extrabold text-[#252225]">{name || 'A Minha Loja'}</h2>
            <p className="text-xs text-[#777277] mt-0.5">
              Identificação comercial visível para os compradores do app OWEJI em Angola.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <Card title="Dados Comerciais da Loja" subtitle="Informações principais de identificação">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#252225] mb-1">Nome Comercial da Loja *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#252225] mb-1">Nome do Proprietário / Responsável *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#252225] mb-1">Telefone / WhatsApp Comercial *</label>
              <input
                type="tel"
                required
                placeholder="+244 923 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#252225] mb-1">Email de Contacto *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#252225] mb-1">URL do Logotipo da Loja</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>
          </div>
        </Card>

        {/* Location Information */}
        <Card title="Localização Física & Ponto de Coleta" subtitle="Endereço para entregas e transportadoras">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#252225] mb-1">Província *</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] bg-white focus:outline-none focus:border-[#E98A9A]"
              >
                <option value="Luanda">Luanda</option>
                <option value="Benguela">Benguela</option>
                <option value="Huíla">Huíla</option>
                <option value="Huambo">Huambo</option>
                <option value="Cabinda">Cabinda</option>
                <option value="Cuanza Sul">Cuanza Sul</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#252225] mb-1">Município / Bairro / Rua *</label>
              <input
                type="text"
                required
                placeholder="Ex: Talatona, Condomínio Bela Vista"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>
          </div>
        </Card>

        {/* Bank & Payout Information */}
        <Card title="Dados Bancários para Repasse" subtitle="Conta onde a OWEJI deposita o valor das suas vendas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#252225] mb-1">Instituição Bancária *</label>
              <input
                type="text"
                required
                placeholder="Ex: Banco Angolano de Investimentos (BAI)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#252225] mb-1">IBAN Angolano (AO06 ...) *</label>
              <input
                type="text"
                required
                placeholder="AO06 0040 0000 0000 0000 0000 0"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full font-mono px-3 py-2.5 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
              />
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button variant="primary" size="lg" icon={<Save size={18} />} type="submit">
            Gravar Configurações da Loja
          </Button>
        </div>
      </form>
    </div>
  );
};
