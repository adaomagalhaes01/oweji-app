# OWEJI — Documento de Funcionalidades

Aplicação móvel de marketplace de moda (roupa, acessórios e calçado) desenvolvida com Expo/React Native. Este documento descreve todas as funcionalidades implementadas no código, o estado dos dados, as regras de negócio e as limitações atuais.

> **Estado do projeto:** protótipo funcional local. Não existe backend, autenticação remota, processamento de pagamentos nem integração com transportadoras. Toda a informação é persistida no dispositivo.

---

## 1. Visão geral

- Experiência mobile-first para **clientes** e **comerciantes**.
- Catálogo de moda com pesquisa, categorias, filtros, ordenação e estado de conservação da peça.
- Fluxo completo de descoberta: início → produto → favoritos → carrinho → checkout → pedido.
- Registo de pedidos com dados de entrega, referência de transferência e comprovativo (imagem/PDF).
- Área de comerciante com painel, catálogo editável, stock, vendas, pedidos e perfil da loja.
- Perfil editável, avatar, moradas guardadas, notificações e alteração de palavra-passe.
- Design system próprio em tons rosa, tipografia Poppins e preços em kwanzas (Kz).

---

## 2. Stack técnica

| Área | Tecnologia |
| --- | --- |
| Plataforma | Expo SDK 57 / React Native 0.86 / React 19 |
| Navegação | Expo Router (file-based) + Native Tabs |
| Linguagem | TypeScript estrito |
| Estado global | Zustand com middleware `persist` |
| Persistência | AsyncStorage (dados não sensíveis) e Expo SecureStore (palavra-passe) |
| UI | StyleSheet + expo-image + lucide-react-native |
| Animações | React Native Reanimated / Worklets |
| Tipografia | Poppins (400, 500, 600, 700) |
| Selecção de ficheiros | expo-document-picker, expo-image-picker e expo-file-system |
| Tema | Tokens em `src/constants/palette.ts` (tema claro fixo na UI) |

Bibliotecas instaladas mas ainda sem uso efetivo: TanStack Query, React Hook Form, Zod, expo-crypto, expo-device, expo-glass-effect, expo-linking, expo-system-ui e expo-constants. O store `feedback-store.ts` também não é consumido pela UI.

---

## 3. Mapa de rotas

| Rota | Ficheiro | Descrição |
| --- | --- | --- |
| `/` | `src/app/(tabs)/index.tsx` | Início: saudação, pesquisa, categorias, filtros, editorial e grelha de produtos |
| `/explore` | `src/app/(tabs)/explore.tsx` | Categorias com filtros, ordenação e contagem de peças |
| `/cart` | `src/app/(tabs)/cart.tsx` | Carrinho, quantidades e resumo do pedido |
| `/favorites` | `src/app/(tabs)/favorites.tsx` | Produtos favoritados |
| `/profile` | `src/app/(tabs)/profile.tsx` | Perfil, avatar, atalhos de conta e logout |
| `/product/[id]` | `src/app/product/[id].tsx` | Detalhe do produto com tamanho, cor, quantidade e compra |
| `/login` | `src/app/login.tsx` | Entrada local |
| `/register` | `src/app/register.tsx` | Criação de conta de cliente ou comerciante |
| `/splash` | `src/app/splash.tsx` | Ecrã de transição pós-login |
| `/checkout` | `src/app/checkout.tsx` | Dados de entrega, pagamento, comprovativo e resumo |
| `/orders` | `src/app/orders.tsx` | Lista de pedidos com filtros |
| `/orders/[id]` | `src/app/orders/[id].tsx` | Detalhe do pedido, acompanhamento, artigos e pagamento |
| `/notifications` | `src/app/notifications.tsx` | Lista de notificações |
| `/addresses` | `src/app/addresses.tsx` | Gestão de moradas de entrega |
| `/security` | `src/app/security.tsx` | Alteração de palavra-passe |
| `/payment-methods` | `src/app/payment-methods.tsx` | Informação sobre métodos de pagamento |
| `/support` | `src/app/support.tsx` | Perguntas frequentes e ajuda |
| `/legal` | `src/app/legal.tsx` | Privacidade, dados locais e termos |
| `/shop` | `src/app/shop/(tabs)/index.tsx` | Painel do comerciante: métricas, stock, vendas e produtos recentes |
| `/shop/products` | `src/app/shop/(tabs)/products.tsx` | Catálogo da loja: publicar, editar e remover produtos |
| `/shop/sales` | `src/app/shop/(tabs)/sales.tsx` | Histórico de vendas e receita da loja |
| `/shop/orders` | `src/app/shop/(tabs)/orders.tsx` | Pedidos da loja com filtros por estado |
| `/shop/profile` | `src/app/shop/(tabs)/profile.tsx` | Perfil público, logótipo e dados da loja |
| `/shop/order/[id]` | `src/app/shop/order/[id].tsx` | Detalhe do pedido e alteração do estado |

---

## 4. Funcionalidades por área

### 4.1 Arranque e identidade visual

- Splash nativa configurada em `app.json` com imagem e fundo `#5C3442`.
- Overlay animado (`AnimatedSplashOverlay`) com:
  - fade-in e scale-up do conteúdo;
  - espera de 2,5 s antes da saída;
  - fade/scale de saída com duração de 850 ms;
  - marca OWEJI, monograma “O”, tagline “Vista-se de si.” e indicadores.
- Ecrã `/splash` reutilizável após o login:
  - permanece 3 s;
  - encaminha para `/shop` quando `destination=shop`;
  - caso contrário, encaminha para a página inicial.
- Carregamento das fontes Poppins antes de renderizar a aplicação.

### 4.2 Autenticação local

#### Login (`/login`)

- Campos: email ou telefone e palavra-passe.
- Mostrar/ocultar palavra-passe.
- Botão “ENTRAR” desativado até identidade com mais de 3 caracteres e palavra-passe com pelo menos 6.
- Validação contra o perfil guardado:
  - a identidade tem de coincidir com o email ou telefone do perfil;
  - se existir palavra-passe no SecureStore, esta tem de coincidir.
- Registo de sessão via `setSignedIn(true)`.
- Redirecionamento para splash e depois para loja (comerciante) ou início (cliente).
- “Esqueceu a palavra-passe?” apresenta um alerta a indicar contacto com o suporte.
- Link para criação de conta.
- Mensagens de erro para conta não encontrada, palavra-passe incorreta e falha de validação.

#### Registo (`/register`)

- Escolha do tipo de conta: **Cliente** (“Descobrir e comprar”) ou **Comerciante** (“Criar uma loja”).
- Campos: nome completo, email, telefone, palavra-passe, confirmação e, para comerciante, nome da loja.
- Validações:
  - nome com pelo menos 3 caracteres;
  - email com formato válido;
  - telefone com pelo menos 8 caracteres;
  - palavra-passe com pelo menos 6 caracteres;
  - confirmação igual à palavra-passe;
  - nome da loja com pelo menos 2 caracteres para comerciantes.
- Feedback imediato para palavras-passe diferentes ou demasiado curtas.
- Botão “CRIAR CONTA” / “CRIAR CONTA E LOJA” desativado enquanto inválido ou durante a submissão.
- Estado de carregamento “A CRIAR CONTA…” e prevenção de submissões duplicadas.
- Mensagens de erro para falhas de validação e de persistência.
- Guarda a palavra-passe no SecureStore e atualiza o perfil local.
- Gera um `storeId` próprio para novas contas de comerciante; contas de cliente ficam sem loja associada.
- Comerciante passa pelo splash com destino `shop`; cliente entra diretamente no início.

> **Nota:** a autenticação é demonstrativa e local. Não existe verificação por email/SMS nem servidor de autenticação. A chave de palavra-passe é única (`oweji-password`), independentemente do email. Por omissão, o perfil vem preenchido (nome “Adão Manuel” e email `adao@email.com`) e a sessão inicia como autenticada.

### 4.3 Início (`/`)

- Cabeçalho com:
  - notificações (ponto indicador de não lidas);
  - marca OWEJI;
  - carrinho com contador (mostra `9+` acima de 9 unidades);
  - avatar do utilizador (ou inicial) com indicador “online”.
- Saudação personalizada com o primeiro nome do perfil (“Olá, Adão”).
- Mensagem editorial “Combine o seu estilo.”
- Pesquisa em tempo real por nome e categoria, sem distinção de maiúsculas/minúsculas e com locale `pt-AO`.
- Filtro por categorias: Tudo, Vestidos, Tops, Saias, Calças, Acessórios, Calçado.
- Filtro por estado da peça: todos, Nova, Seminova, Usada · boa.
- Cartão editorial estático “Nova coleção — Vista-se de si.”.
- Secção dinâmica:
  - “Em alta agora” em estado normal;
  - “A sua seleção” quando há pesquisa ou categoria ativa;
  - botão “Ver tudo” repõe a categoria para “Tudo”.
- Grelha de produtos em 2 colunas com `FlatList`.
- Estado vazio com mensagem e sugestão para alterar pesquisa/categoria.
- Botão de filtros com indicador quando há filtros ativos.
- Acesso ao detalhe do produto, favoritos, carrinho e perfil.

### 4.4 Categorias (`/explore`)

- Ecrã dedicado à exploração da coleção.
- Cabeçalho “Explore a coleção / Categorias”.
- Os mesmos filtros por categoria e estado da peça do Início.
- Contagem de peças da seleção atual.
- Botão “Filtrar” com indicador de filtros ativos.
- Grelha de produtos em 2 colunas.
- Estado vazio quando não há resultados.

### 4.5 Filtros e ordenação

Painel modal (`ProductFilterSheet`) partilhado entre Início e Categorias:

- **Ordenar por:** Recomendados, Menor preço, Maior preço, Melhor avaliados.
- **Faixa de preço:** Qualquer preço, Até Kz 999, Kz 1.000–2.000, Acima de Kz 2.000.
- **Estado da peça:** Todos, Nova, Seminova, Usada · boa.
- **Disponibilidade:** interruptor “Mostrar apenas peças disponíveis”.
- Botão “LIMPAR” repõe ordenação, preço, disponibilidade e estado.
- Botão “MOSTRAR PRODUTOS” fecha o painel.
- Fecho por scrim (toque fora), botão X ou botão voltar do Android.

### 4.6 Cartão de produto

- Imagem com proporção fixa (aspect ratio 0.78), cantos arredondados e `expo-image`.
- Etiqueta de estado da peça no canto superior esquerdo.
- Coração de favorito no canto superior direito, com estado preenchido/contorno e feedback de pressão.
- Indicador de disponibilidade (verde/vermelho) junto ao nome.
- Nome truncado a uma linha e preço formatado em Kz.
- Toque na imagem ou nos detalhes abre `/product/[id]`.

### 4.7 Detalhe do produto (`/product/[id]`)

- Imagem principal com altura adaptativa (entre 330 e 500 px, cerca de 46% da altura do ecrã).
- Botão de voltar e botão de favorito sobre a imagem.
- Etiqueta de estado da peça.
- Categoria e legenda editorial.
- Nome, avaliação (quando maior que 0), preço e descrição.
- Guia de tamanhos em alerta (XS, S, M, L, XL).
- Seletor de tamanhos com estado selecionado.
- Seletor de cores em círculos, com etiquetas “Cor 1”, “Cor 2”, etc.
- Cartão de disponibilidade com mensagem adequada.
- Seletor de quantidade (mínimo 1) com total calculado em tempo real.
- Barra fixa inferior com:
  - “ADICIONAR AO CARRINHO” (respeita a quantidade escolhida);
  - “COMPRAR AGORA” (adiciona e abre o carrinho).
- Produtos indisponíveis desativam ambas as ações.
- Estado “Peça não encontrada” com link de regresso.

### 4.8 Carrinho (`/cart`)

- Lista de itens com imagem, nome, preço, tamanho, estado da peça e controles de quantidade.
- Itens são identificados pela combinação **produto + tamanho + cor**:
  - adicionar a mesma combinação incrementa a quantidade;
  - quantidades diferentes geram linhas distintas;
  - diminuir abaixo de 1 remove o item.
- Remoção explícita com ícone de lixo.
- Toque na imagem abre o detalhe do produto.
- Subtotal calculado com os preços atuais do catálogo.
- Entrega estimada fixa de **Kz 500** quando há itens.
- Total = subtotal + entrega.
- Botão “FINALIZAR COMPRA” abre o checkout.
- Estado vazio com ícone, mensagem e botão “EXPLORAR PEÇAS”.
- Contador do cabeçalho reflete o total de unidades.

### 4.9 Favoritos (`/favorites`)

- Lista todos os produtos favoritados, incluindo produtos publicados por comerciantes.
- Grelha em 2 colunas com o mesmo cartão de produto.
- Estado vazio com instrução para tocar no coração.
- Favoritos persistem entre sessões.

### 4.10 Checkout (`/checkout`)

Apenas acessível com itens no carrinho; caso contrário, apresenta estado vazio com botão para ver peças.

**Dados de entrega**

- Possibilidade de escolher uma morada guardada ou preencher manualmente.
- Campos: nome completo, email, telefone, província, município, morada completa e ponto de referência (opcional).
- Opção “Guardar esta morada para futuras compras”.
- Pré-preenchimento com nome, email e telefone do perfil.

**Pagamento**

- Método único: **Transferência ou depósito**.
- Aviso de que os dados bancários/Multicaixa Express ainda não estão configurados na aplicação.
- Campo opcional para referência da transferência.
- Anexo de comprovativo por `expo-document-picker`:
  - aceita imagens e PDF;
  - limite de 10 MB;
  - possibilidade de remover o ficheiro.

**Resumo**

- Linhas do pedido com nome, quantidade, preço unitário e tamanho.
- Subtotal, entrega estimada e total.

**Submissão**

- Valida nome, email, telefone (mínimo 9 dígitos), província, município, morada e comprovativo obrigatório.
- Cria um pedido local com estado `payment-review`.
- Guarda a morada se a opção estiver selecionada.
- Limpa o carrinho e navega para `/orders`.
- Em caso de falha, apresenta alerta e mantém o formulário.
- Aviso visível de que os dados ficam apenas no dispositivo.

### 4.11 Pedidos (`/orders`)

- Lista de pedidos guardados localmente, do mais recente para o mais antigo.
- Filtros: Todos, Em andamento, Concluídos.
- Cada cartão mostra:
  - identificador curto (`#XXXXXXXX`);
  - data em `pt-AO`;
  - estado;
  - pré-visualização das primeiras duas peças;
  - total de unidades;
  - total do pedido;
  - botão “Ver detalhe”.
- Estados suportados:
  - `awaiting-confirmation` — A aguardar confirmação;
  - `payment-review` — A validar pagamento;
  - `confirmed` — Confirmado;
  - `preparing` — Em preparação;
  - `shipped` — A caminho;
  - `delivered` — Entregue;
  - `cancelled` — Cancelado.
- Estado vazio distingue “ainda não tem pedidos” de “nenhum pedido neste filtro”.
- Aviso de que os pedidos são locais e ainda não são sincronizados.

### 4.12 Detalhe do pedido (`/orders/[id]`)

- Cabeçalho com número curto do pedido e data completa.
- Resumo com quantidade de artigos e estado.
- **Acompanhamento** por timeline:
  - Comprovativo em validação;
  - Pedido confirmado;
  - Em preparação;
  - A caminho;
  - Entregue.
  - Para o estado `awaiting-confirmation`, mostra apenas “Pedido recebido”.
  - Pedidos cancelados não mostram timeline.
- Lista de artigos com quantidade, preço unitário, tamanho, cor e total.
- Subtotal, entrega (ou “Grátis”) e total.
- Dados de entrega: destinatário, morada, referência, telefone e email.
- Dados de pagamento: método, referência e comprovativo anexado ou pendente.
- Aviso de armazenamento local.
- Estado “Pedido não encontrado” com regresso à lista.

### 4.13 Notificações (`/notifications`)

- Notificações iniciais persistidas:
  - boas-vindas ao OWEJI;
  - novidades na coleção.
- Indicador de não lidas e distinção visual dos cartões.
- Toque numa notificação marca-a como lida.
- Botão “marcar todas como lidas”.
- Estado vazio.
- As notificações não são geradas automaticamente por eventos da aplicação (pedidos, favoritos, etc.).

### 4.14 Perfil (`/profile`)

- Cabeçalho “A sua conta OWEJI / Meu perfil”.
- Cartão do utilizador com:
  - avatar (imagem escolhida da galeria ou inicial do nome);
  - nome, email e telefone;
  - edição inline de nome, email e telefone;
  - botão “Guardar alterações”.
- Alteração do avatar com `expo-image-picker` (corte 1:1, qualidade 0.8).
- Atalho para a loja quando a conta é de comerciante.
- Contadores de pedidos e favoritos nos atalhos.
- Secções:
  - **A minha conta:** endereços de entrega; segurança e palavra-passe.
  - **Compras e preferências:** meus pedidos; favoritos; notificações; métodos de pagamento.
  - **Ajuda e segurança:** ajuda e suporte; privacidade e termos.
- Logout com confirmação; limpa a sessão e redireciona para o login.

### 4.15 Endereços (`/addresses`)

- Lista de moradas com etiqueta, destinatário, telefone, morada, referência e badge “Predefinida”.
- Criar, editar e remover moradas.
- Confirmação antes de remover.
- Campos: etiqueta, nome de quem recebe, telefone, província, município, morada completa e referência.
- Opção de definir como predefinida.
- A primeira morada torna-se predefinida automaticamente.
- Se a predefinida for removida, a primeira morada restante passa a predefinida.
- Estado vazio com chamada para adicionar morada.
- Validação dos campos obrigatórios com alerta.

### 4.16 Segurança (`/security`)

- Alteração de palavra-passe com:
  - palavra-passe atual;
  - nova palavra-passe;
  - confirmação.
- Requisitos: mínimo de 6 caracteres, confirmação igual, nova diferente da atual.
- Validação contra o valor guardado no SecureStore.
- Feedback de sucesso e erros específicos.
- Mostrar/ocultar todas as palavras-passe do formulário.
- Nota sobre armazenamento seguro local e ausência de servidor de autenticação.

### 4.17 Área do comerciante (`/shop`)

- Acesso restrito a contas com tipo `merchant`; uma conta de cliente vê um ecrã informativo com ligação para criar conta de comerciante ou voltar ao perfil.
- Navegação por separadores: **Início**, **Produtos**, **Vendas**, **Pedidos** e **Loja**. Em iOS/Android são usados `NativeTabs`; na web é usada uma barra própria com `expo-router/ui`.
- Layout aninhado em `src/app/shop/_layout.tsx` e `src/app/shop/(tabs)/_layout.tsx`; o detalhe do pedido fica fora dos separadores.
- Cabeçalho reutilizável com nome da loja, primeiro nome/email do comerciante, indicador do tipo de conta e acesso ao perfil.
- Dados de vendas calculados apenas com as linhas de produtos da loja, isolados por `merchantId`; linhas antigas sem `merchantId` são associadas por `seller-<id>`.
- Produtos legados sem proprietário são associados à primeira loja de comerciante que abre a área, preservando a compatibilidade.

#### Início

- Métricas de vendas (soma das linhas da loja), pedidos distintos e número de produtos publicados.
- Total de unidades em stock e aviso “Stock quase a terminar” para produtos com 1 a 3 unidades.
- Atalhos para novo produto, pedidos e edição da loja.
- Lista das quatro vendas recentes, com data, unidades, produtos, valor da loja e estado do pedido.
- Lista dos três produtos mais recentes, com imagem, preço, stock, tamanhos e selo “Activo”/“Esgotado”.

#### Produtos

- Lista todos os produtos da loja com imagem, categoria, descrição, preço, stock, tamanhos e cores.
- Formulário de publicação/edição com:
  - nome (mais de 2 caracteres), descrição (mais de 5 caracteres) e preço em Kz;
  - stock inteiro igual ou superior a zero;
  - categoria, tamanhos, cores e estado da peça;
  - fotografia escolhida da galeria ou uma de quatro imagens predefinidas (`pink`, `linen`, `red`, `white`).
- As fotografias escolhidas são copiadas para o armazenamento privado da aplicação (`Paths.document/oweji-images`) em iOS/Android; na web são guardadas como data URI.
- Erros de validação por campo, botão desativado com formulário inválido e estado “A GUARDAR…”.
- Edição atualiza imediatamente a loja e o catálogo OWEJI.
- Remoção com confirmação nativa, verificação de propriedade e preservação do histórico de pedidos.
- Feedback de sucesso/erro temporário após cada operação.
- Produtos entram no catálogo geral com categoria, tamanhos, cores, condição, stock e imagem escolhidos; `stock = 0` marca a peça como indisponível.

#### Vendas

- Métricas de receita, número de pedidos e peças vendidas, com ticket médio por pedido.
- Histórico ordenado do mais recente para o mais antigo, com linhas, opções, quantidades e valores da loja.
- Cada venda abre o detalhe do pedido correspondente.

#### Pedidos

- Resumo de pedidos por confirmar, em curso e total.
- Filtros: Todos, Por confirmar (`payment-review`, `awaiting-confirmation`), Em curso (`confirmed`, `preparing`, `shipped`) e Concluídos (`delivered`, `cancelled`), com contagens.
- Cartões com identificador, data, estado, cliente, localização e resumo dos artigos da loja.
- O detalhe mostra artigos da loja, subtotal, dados de entrega/pagamento e ações para **Confirmar**, **Preparar**, **Enviar**, **Entregue** e **Cancelar**.
- Cancelamento pede confirmação; alterações refletem-se imediatamente na área de pedidos do cliente neste dispositivo.

#### Loja

- Logótipo quadrado escolhido da galeria (com fallback para a inicial do nome).
- Edição de nome, descrição, telefone e localização da loja, com validação do nome.
- Estatísticas de produtos, pedidos no dispositivo e unidades em stock.
- Acesso à conta de cliente e logout com confirmação.

### 4.18 Páginas informativas

- **Métodos de pagamento:** transferência/depósito disponível; Multicaixa Express e cartão ainda não disponíveis.
- **Ajuda e suporte:** acompanhamento de pedido, envio de comprovativo, confirmação de pagamento e contacto.
- **Privacidade e termos:** dados guardados, fotografias/comprovativos, utilização do marketplace, pagamentos e eliminação de dados.
- Todas usam o componente reutilizável `ProfileFeaturePage` com secções e pontos.

### 4.19 Carrinho flutuante

- Botão circular flutuante com ícone de saco e contador de unidades.
- Visível em todas as rotas exceto `/cart` e quando o carrinho está vazio.
- Pode ser arrastado vertical e horizontalmente, respeitando a Safe Area e os limites do ecrã.
- Toque abre o carrinho.

### 4.20 Navegação inferior

- Cinco separadores: **Início**, **Categorias**, **Carrinho**, **Favoritos** e **Perfil**.
- Em iOS/Android usa `NativeTabs` com ícones nativos (SF Symbols/Material) e cor ativa `#C95F72`.
- Na web usa uma barra personalizada com os mesmos destinos.
- Respeita a Safe Area através dos ecrãs e da navegação nativa.

---

## 5. Catálogo e dados mock

Categorias disponíveis: Tudo, Vestidos, Tops, Saias, Calças, Acessórios e Calçado.

Produtos iniciais:

| ID | Nome | Categoria | Preço (Kz) | Estado | Avaliação |
| --- | --- | --- | --- | --- | --- |
| `dress-red` | Vestido vermelho poá | Vestidos | 1.499 | Nova | 4.8 |
| `dress-pink` | Vestido rosa listrado | Vestidos | 1.299 | Seminova | 4.9 |
| `look-yellow` | Vestido amarelo solar | Vestidos | 1.890 | Usada · boa | 4.7 |
| `dress-floral` | Vestido floral midi | Vestidos | 2.150 | Usada · boa | 4.6 |
| `top-white` | Blusa essencial branca | Tops | 890 | Nova | 4.5 |
| `skirt` | Saia plissada | Saias | 1.650 | Seminova | 4.6 |
| `linen-pants` | Calças de linho | Calças | 2.390 | Usada · boa | 4.8 |
| `earrings` | Brincos dourados | Acessórios | 690 | Nova | 4.7 |
| `sandals` | Sandálias clássicas | Calçado | 2.790 | Seminova | 4.5 |

Cada produto tem descrição, tamanhos, cores, disponibilidade e imagem local. O catálogo final combina os produtos mock com os produtos publicados pelos comerciantes, propagando o respetivo `merchantId` para permitir isolamento por loja.

Preços são formatados com `toLocaleString('pt-AO')` e sufixo `,00`, por exemplo `Kz 1.499,00`.

---

## 6. Regras de negócio e validações

| Regra | Comportamento |
| --- | --- |
| Frete | Kz 500 fixo quando o carrinho/pedido tem itens |
| Identidade do item | Produto + tamanho + cor |
| Quantidade no carrinho | Mínimo 1; abaixo disso o item é removido |
| Quantidade no produto | Mínimo 1; máximo limitado pelo stock disponível |
| Stock | `0` marca o produto como esgotado; o cliente não pode adicionar nem finalizar com excesso de unidades |
| Produto indisponível | Não pode ser adicionado nem comprado |
| Pesquisa | Nome + categoria, case-insensitive, locale `pt-AO` |
| Ordenação | Preço ascendente, descendente ou avaliação; padrão mantém a ordem do catálogo |
| Filtro de preço | `< 1000`, `1000–2000` (inclusive) e `> 2000` |
| Estado da peça | `new`, `semi-new`, `good-used` |
| Checkout | Comprovativo obrigatório; email válido; telefone com 9+ dígitos |
| Comprovativo | Imagem ou PDF, máximo 10 MB |
| Pedido novo | Estado inicial `payment-review` |
| ID do pedido | `OW-<timestamp base36>-<4 caracteres aleatórios>` |
| ID do produto do comerciante | `seller-<timestamp>` |
| Conta | `customer` ou `merchant` |
| Loja | `storeId` gerado no registo de comerciante; nome guardado no perfil |
| Propriedade de produto | `merchantId` no produto publicado e nas linhas de pedido |
| Remoção de produto | Apenas o proprietário; histórico de pedidos preservado |
| Palavra-passe | Mínimo 6 caracteres |
| Morada predefinida | Sempre existe uma quando há moradas |
| Categoria de produto do comerciante | Escolhida no formulário entre as categorias do catálogo |
| Visibilidade do carrinho flutuante | Carrinho com itens e fora da rota `/cart` |

---

## 7. Persistência local

| Dados | Tecnologia | Chave | Conteúdo |
| --- | --- | --- | --- |
| Perfil | AsyncStorage + Zustand | `oweji-profile` (v4) | Nome, email, telefone, tipo de conta, `storeId`, nome/descrição/telefone/localização/logótipo da loja, avatar, moradas, sessão |
| Carrinho | AsyncStorage + Zustand | `oweji-cart` | Itens com produto, tamanho, cor e quantidade |
| Favoritos | AsyncStorage + Zustand | `oweji-favorites` | IDs de produtos |
| Notificações | AsyncStorage + Zustand | `oweji-notifications` | Lista e estado de leitura |
| Pedidos | AsyncStorage + Zustand | `oweji-orders` (v1) | Linhas com `merchantId`, totais, estado, pagamento, comprovativo e entrega |
| Produtos do comerciante | AsyncStorage + Zustand | `oweji-shop-products` (v2) | Produtos publicados com `merchantId`, categoria, stock, tamanhos, cores e imagem |
| Palavra-passe | Expo SecureStore | `oweji-password` | Palavra-passe local |

As migrações de perfil (`v4`) e de produtos (`v2`) preservam os dados existentes e preenchem os novos campos da loja e do catálogo; a migração de pedidos (`v1`) normaliza campos antigos de entrega, linhas, estado e pagamento.

---

## 8. Design system e UX

- Paleta centralizada:
  - primary `#E98A9A`;
  - primary dark `#C95F72`;
  - background `#FFF8FA`;
  - surface `#FFFFFF`;
  - soft pink `#FCE7EC`;
  - texto `#252225` e secundário `#777277`;
  - borda `#F0E5E8`;
  - sucesso `#4FA982`, erro `#D95C68`, aviso `#D99A52`.
- Tipografia Poppins em todos os ecrãs.
- Raios de 11–28 px, sombras suaves e espaçamento consistente.
- Ícones Lucide, sem emojis como elementos principais.
- Estados de interface implementados:
  - vazio: carrinho, favoritos, pedidos, notificações, endereços, pesquisa, produtos da loja e vendas;
  - erro: login, registo, segurança, checkout, publicação/remoção de produtos, produto e pedido inexistente;
  - loading: botões de submissão (“A VALIDAR…”, “A REGISTAR…”, “A CRIAR CONTA…”, “A PUBLICAR…”);
  - sucesso: alertas de alteração de palavra-passe, feedback de conta criada e feedback de publicação/remoção.
- Animações discretas: splash, transições de navegação, press feedback e favoritos.
- Tema claro fixo na UI; o `ThemeProvider` do Expo Router alterna apenas o tema da navegação. Não existe implementação completa de dark mode.

---

## 9. Acessibilidade e desempenho

- `accessibilityRole`, `accessibilityLabel`, `accessibilityState` e `accessibilityLiveRegion` em ações relevantes.
- Áreas de toque ampliadas com `hitSlop` em ícones pequenos.
- Botões principais com estados `disabled` e opacidade reduzida.
- Listas com `FlatList` (não `ScrollView` para grandes coleções).
- `ProductCard` memoizado.
- Filtragem e ordenação com `useMemo`.
- Imagens com `expo-image` e transições curtas.
- Selectores Zustand específicos para reduzir renders.
- Layout responsivo com Safe Area, alturas adaptativas e grelha de 2 colunas.

---

## 10. Limitações e funcionalidades em falta

- Não existe backend, API, sincronização ou autenticação real.
- Não há processamento de pagamentos, confirmação automática, Multicaixa Express ou cartão.
- Não há integração com transportadoras nem cálculo real de frete.
- Não há painel administrativo, chat, avaliações de utilizadores ou múltiplos vendedores reais.
- As notificações são estáticas e não reagem a eventos.
- A sessão (`isSignedIn`) é guardada, mas não existe proteção de rotas no layout raiz.
- A palavra-passe local usa uma chave única e não está associada ao email.
- Na web, a palavra-passe não é guardada no SecureStore.
- Não existe ecrã para alterar o estado de um pedido; `updateOrderStatus` e `updateOrderReceipt` existem no store, mas não têm interface.
- O estado de entrega do pedido é sempre criado como `payment-review`.
- Produtos do comerciante ficam sempre em `tops`, tamanho único e sem gestão de stock.
- Imagens de produtos do comerciante vêm de quatro opções predefinidas; não há upload de fotografia própria.
- O isolamento entre comerciantes é lógico e local (`storeId`/`merchantId`); não constitui uma fronteira de segurança real.
- Produtos antigos sem `merchantId` são atribuídos à primeira conta de comerciante que abrir a loja, pois a versão anterior não guardava essa associação.
- Não há paginação/infinite scroll; o catálogo atual é pequeno.
- Dark mode, idiomas e definições de tema ainda não estão implementados.
- TanStack Query, React Hook Form e Zod estão instalados, mas não são usados.

---

## 11. Estrutura do código

```text
src/
├── app/                     # Rotas Expo Router
│   ├── (tabs)/              # Início, Categorias, Carrinho, Favoritos, Perfil
│   ├── product/[id].tsx     # Detalhe do produto
│   ├── orders/[id].tsx      # Detalhe do pedido
│   ├── checkout.tsx         # Finalização de compra
│   ├── addresses.tsx        # Moradas
│   ├── security.tsx         # Palavra-passe
│   ├── login.tsx            # Login local
│   ├── register.tsx         # Registo local
│   ├── shop.tsx             # Área do comerciante
│   └── ...                  # Notificações, pedidos, páginas informativas
├── components/
│   ├── cards/               # ProductCard
│   ├── products/            # Filtros e badge de estado
│   ├── profile/             # Página informativa reutilizável
│   ├── ui/                  # Componentes auxiliares
│   ├── app-tabs.tsx         # Navegação nativa
│   ├── app-tabs.web.tsx     # Navegação web
│   ├── app-toast.tsx        # Carrinho flutuante arrastável
│   └── animated-icon.tsx    # Splash animada
├── features/
│   ├── auth/password.ts     # Chave da palavra-passe
│   ├── merchant/            # Filtragem de produtos e vendas por comerciante
│   ├── orders/              # Estados e passos dos pedidos partilhados
│   └── products/            # Catálogo, categorias, tipos, imagens e condições
├── store/                   # Zustand: perfil, carrinho, favoritos, pedidos, etc.
├── constants/               # Paleta, tema, espaçamento
├── hooks/                   # Tema e color scheme
└── types/                   # Declarações de tipos
```

---

## 12. Comandos

```bash
npx expo start        # Iniciar servidor de desenvolvimento
npx expo start --web  # Executar versão web
npx expo lint         # Lint
npx tsc --noEmit      # Typecheck
npx expo-doctor       # Diagnóstico de dependências/configuração
```
