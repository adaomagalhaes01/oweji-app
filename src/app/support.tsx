import { ProfileFeaturePage } from '@/components/profile/feature-page';

export default function SupportScreen() {
  return <ProfileFeaturePage title="Ajuda e suporte" eyebrow="ESTAMOS AQUI PARA AJUDAR" intro="Encontre respostas rápidas sobre as compras e a utilização do OWEJI." sections={[
    { title: 'Como acompanho um pedido?', body: 'Abra o perfil, escolha “Meus pedidos” e toque em “Ver detalhe” para consultar o resumo e o estado do pedido.' },
    { title: 'Como envio o comprovativo?', body: 'No checkout, escolha transferência ou depósito e anexe uma imagem ou PDF do comprovativo antes de enviar o pedido.' },
    { title: 'O pagamento já foi confirmado?', body: 'Nesta versão, os pedidos ficam guardados apenas no dispositivo e a loja não recebe uma notificação automática. Confirme o pagamento directamente com a loja antes de efectuar uma nova transferência.' },
    { title: 'Contactar o suporte', body: 'O contacto oficial de suporte ainda não está configurado na aplicação. Por segurança, não partilhe palavras-passe nem dados completos do cartão em mensagens.' },
  ]} />;
}
