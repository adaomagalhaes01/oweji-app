import React, { useState } from 'react';
import { Check, X, FileText, Download, ShieldCheck, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { formatKz } from '../../constants/palette';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { OrderStatusBadge } from '../ui/Badge';

interface ReceiptViewerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (orderId: string, approved: boolean, note?: string) => void;
  canValidate?: boolean;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  order,
  isOpen,
  onClose,
  onValidate,
  canValidate = true,
}) => {
  const [note, setNote] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  if (!order) return null;

  const handleApprove = () => {
    onValidate(order.id, true, note);
    onClose();
  };

  const handleReject = () => {
    onValidate(order.id, false, note || 'Comprovativo ilegível ou montante divergente.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Auditoria de Pagamento #${order.id.slice(-5)}`}
      subtitle={`Submetido em ${new Date(order.createdAt).toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Receipt Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-[#FFF8FA] border border-[#F0E5E8] rounded-xl overflow-hidden p-3 flex flex-col items-center justify-center min-h-[380px]">
            {order.receipt ? (
              <div className="relative group w-full flex flex-col items-center">
                <img
                  src={order.receipt.url}
                  alt={order.receipt.name}
                  className={`rounded-lg object-contain transition-transform duration-200 cursor-zoom-in ${
                    isZoomed ? 'scale-125 z-20' : 'max-h-[340px] shadow-sm'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                <div className="flex items-center justify-between w-full mt-3 pt-2 border-t border-[#F0E5E8] text-xs text-[#777277]">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <FileText size={14} className="text-[#C95F72]" />
                    {order.receipt.name}
                  </span>
                  <a
                    href={order.receipt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#C95F72] hover:underline font-semibold"
                  >
                    <Download size={14} /> Descarregar
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-[#777277]">
                <AlertCircle size={36} className="mx-auto mb-2 text-[#D99A52]" />
                <p className="font-semibold text-sm">Sem anexo de comprovativo</p>
                <p className="text-xs mt-1">O cliente não anexou ficheiro para esta encomenda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Order Details & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Amount card */}
            <div className="bg-[#FCE7EC]/50 border border-[#E98A9A]/30 rounded-xl p-4">
              <span className="text-xs font-semibold text-[#777277] uppercase tracking-wider">
                Total a Validar
              </span>
              <div className="text-2xl font-bold text-[#C95F72] mt-0.5">
                {formatKz(order.total)}
              </div>
              <div className="text-xs text-[#777277] mt-1 flex items-center gap-1.5">
                <span>Ref. Declarada:</span>
                <span className="font-mono font-bold text-[#252225] bg-white px-2 py-0.5 rounded border border-[#F0E5E8]">
                  {order.paymentReference || 'Nenhuma'}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white border border-[#F0E5E8] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-bold text-[#252225] flex items-center justify-between">
                <span>Dados do Comprador</span>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-[#252225]">
                <User size={14} className="text-[#777277]" />
                <span className="font-semibold">{order.customer.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-[#777277]">
                <Phone size={14} />
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-[#777277]">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  {order.customer.municipality}, {order.customer.province} - {order.customer.address}
                </span>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white border border-[#F0E5E8] rounded-xl p-3 space-y-2 text-xs">
              <div className="font-bold text-[#252225] pb-1 border-b border-[#F0E5E8]">
                Itens da Encomenda ({order.lines.length})
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {order.lines.map((line, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-[#252225]">{line.quantity}x {line.name}</span>
                      <span className="text-[#777277] ml-1">({line.size})</span>
                    </div>
                    <span className="font-mono font-semibold text-[#252225]">
                      {formatKz(line.unitPrice * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin note input */}
            {canValidate && (
              <div>
                <label className="block text-xs font-semibold text-[#252225] mb-1">
                  Nota / Observação da Auditoria (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Confirmado no extrato BAI às 10h45"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#F0E5E8] focus:outline-none focus:border-[#E98A9A]"
                />
              </div>
            )}
          </div>

          {/* Validation buttons */}
          {canValidate && (
            <div className="pt-3 border-t border-[#F0E5E8] flex gap-2">
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                icon={<X size={16} />}
                onClick={handleReject}
              >
                Rejeitar
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                icon={<Check size={16} />}
                onClick={handleApprove}
              >
                Aprovar Pagamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
