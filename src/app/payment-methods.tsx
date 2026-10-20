import { ProfileFeaturePage } from '@/components/profile/feature-page';

export default function PaymentMethodsScreen() {
  return <ProfileFeaturePage title="Métodos de pagamento" intro="Consulte as formas de pagamento actualmente disponíveis no OWEJI." sections={[
    { title: 'Transferência ou depósito', body: 'Disponível no checkout. Depois de pagar, anexe o comprovativo para a loja poder confirmar o pedido.', points: ['Confirme os dados bancários directamente com a loja antes de transferir.', 'A aplicação ainda não envia o comprovativo para um servidor nem confirma o pagamento automaticamente.'] },
    { title: 'Multicaixa Express', body: 'Ainda não disponível nesta versão. Será apresentado aqui quando a integração estiver activa.' },
    { title: 'Cartão bancário', body: 'Ainda não disponível nesta versão. Não introduza dados do cartão fora de um fluxo de pagamento oficial.' },
  ]} />;
}
