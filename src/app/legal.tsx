import { ProfileFeaturePage } from '@/components/profile/feature-page';

export default function PrivacyTermsScreen() {
  return <ProfileFeaturePage title="Privacidade e termos" eyebrow="INFORMAÇÃO DA APLICAÇÃO" intro="Resumo informativo sobre o funcionamento actual do OWEJI. A versão de produção precisa de uma política e termos revistos e aprovados pela equipa responsável." sections={[
    { title: 'Dados guardados', body: 'Nesta versão, os dados do perfil, a fotografia, as moradas, os favoritos, o carrinho, os pedidos e os comprovativos são guardados localmente no dispositivo. Ainda não existe sincronização com um servidor.' },
    { title: 'Fotografias e comprovativos', body: 'A fotografia de perfil é escolhida da galeria do dispositivo. Os comprovativos seleccionados no checkout permanecem locais e não são enviados automaticamente à loja.' },
    { title: 'Utilização do marketplace', body: 'Consulte o estado e a condição de cada peça antes de comprar. As opções de condição apresentadas são nova, seminova e usada em bom estado.' },
    { title: 'Pagamentos e pedidos', body: 'A aplicação ainda não processa pagamentos nem confirma encomendas online. Confirme os dados de pagamento directamente com a loja e aguarde a confirmação antes de considerar a compra concluída.' },
    { title: 'Apagar os dados', body: 'Os dados locais podem ser removidos ao limpar os dados da aplicação ou desinstalá-la. Uma opção de eliminação de conta será disponibilizada quando existir autenticação ligada ao servidor.' },
  ]} />;
}
