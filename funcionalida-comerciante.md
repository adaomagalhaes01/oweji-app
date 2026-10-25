# OWEJI — Implementação Completa do Fluxo de Comerciante

## 1. CONTEXTO DO PROJECTO

Estás a trabalhar no projecto **OWEJI**, uma aplicação móvel de marketplace de moda, desenvolvida com:

- Expo SDK 57.
- React Native 0.86.
- React 19.
- TypeScript em modo estrito.
- Expo Router para navegação.
- Zustand para gestão de estado global.
- AsyncStorage para persistência local dos dados.
- Expo SecureStore para armazenamento local da palavra-passe.
- React Native StyleSheet para estilos.
- Poppins como tipografia principal.
- Lucide React Native para ícones.
- React Native Reanimated para animações.

A aplicação permite que os clientes descubram, pesquisem e comprem roupas, acessórios e calçado. Também permite que os comerciantes criem uma loja, publiquem produtos e acompanhem as suas vendas.

O projecto já possui um sistema de registo, autenticação local, perfil, catálogo, carrinho, favoritos, pedidos e uma área de comerciante na rota `/shop`.

**A tua tarefa é implementar e aperfeiçoar o fluxo completo de criação de conta e utilização da aplicação como COMERCIANTE, aproveitando a estrutura, os componentes, os stores e as funcionalidades existentes.**

Não cries uma aplicação nova. Trabalha directamente no projecto actual.

---

## 2. OBJECTIVO PRINCIPAL

Quando um utilizador abrir o ecrã de registo e seleccionar a opção:

**COMERCIANTE — Criar uma loja**

a aplicação deverá apresentar e executar correctamente o processo de registo de comerciante.

Depois de criar a conta com sucesso, o utilizador deverá entrar no ambiente de comerciante da OWEJI, onde poderá:

1. Consultar as métricas da sua loja.
2. Publicar novos produtos.
3. Consultar os produtos publicados.
4. Remover produtos.
5. Consultar as vendas realizadas.
6. Consultar os pedidos que contêm produtos da sua loja, utilizando os dados já disponíveis no sistema.
7. Aceder ao perfil e às funcionalidades de conta existentes.
8. Sair da conta em segurança.

A experiência deve ser coerente com a aplicação actual e utilizar os mesmos padrões visuais e de navegação.

---

## 3. REGRA FUNDAMENTAL: NÃO ALTERAR O DESIGN EXISTENTE

**É obrigatório preservar integralmente a identidade visual actual da OWEJI.**

Não redesenhes a aplicação nem substituas os ecrãs existentes por interfaces novas.

Mantém:

### Paleta de cores

Utiliza os tokens existentes em `src/constants/palette.ts`, respeitando as cores actuais:

- Cor principal: `#E98A9A`.
- Cor principal escura: `#C95F72`.
- Fundo: `#FFF8FA`.
- Superfícies e cartões: `#FFFFFF`.
- Rosa suave: `#FCE7EC`.
- Texto principal: `#252225`.
- Texto secundário: `#777277`.
- Bordas: `#F0E5E8`.
- Sucesso: `#4FA982`.
- Erro: `#D95C68`.
- Aviso: `#D99A52`.

### Elementos visuais obrigatórios

Preserva:

- A tipografia Poppins.
- Os tamanhos, pesos e hierarquia tipográfica existentes.
- Os cantos arredondados dos cartões e botões.
- As sombras suaves.
- O espaçamento consistente.
- Os ícones Lucide.
- Os componentes reutilizáveis.
- As animações discretas.
- A adaptação a diferentes tamanhos de ecrã.
- A navegação inferior existente.
- A utilização das Safe Areas.
- O comportamento visual dos botões, campos e cartões.

Não introduzas emojis como ícones principais.

Não adiciones novas cores, gradientes, fontes ou estilos sem necessidade.

Não utilizes NativeWind ou Tailwind CSS. Continua a utilizar `StyleSheet`, os tokens e os padrões de estilo já existentes no projecto.

Se os ecrãs actuais de registo e comerciante já possuírem componentes funcionais, reutiliza-os e melhora apenas o que for necessário.

**O resultado deve parecer uma evolução natural da OWEJI, e não uma aplicação diferente.**

---

## 4. FLUXO DE CRIAÇÃO DE CONTA DE COMERCIANTE

### 4.1. Selecção do tipo de conta

No ecrã `/register`, mantém as duas opções existentes:

**Cliente**
- Descrição: Descobrir e comprar.
- Permite utilizar a aplicação para descobrir e comprar produtos.

**Comerciante**
- Descrição: Criar uma loja.
- Permite criar uma conta de comerciante e aceder à área de gestão da loja.

Quando o utilizador seleccionar Comerciante, actualiza o estado do formulário para o tipo de conta `merchant`.

A selecção deve ser visualmente clara, utilizando os componentes e estilos existentes.

Não alteres a experiência de registo dos clientes.

### 4.2. Campos do registo

O formulário de comerciante deve incluir:

1. Nome completo.
2. Email.
3. Número de telefone.
4. Palavra-passe.
5. Confirmação da palavra-passe.
6. Nome da loja.

Mantém a ordem e o estilo visual já utilizados no ecrã de registo, adaptando o formulário apenas quando necessário.

O campo do nome da loja deve aparecer quando o tipo de conta seleccionado for Comerciante.

### 4.3. Validações

Implementa ou preserva as seguintes regras:

- Nome completo com, pelo menos, 3 caracteres.
- Email com formato válido.
- Telefone com, pelo menos, 8 caracteres.
- Palavra-passe com, pelo menos, 6 caracteres.
- Confirmação da palavra-passe igual à palavra-passe introduzida.
- Nome da loja com, pelo menos, 2 caracteres.

Apresenta mensagens claras quando existir algum erro.

O botão principal deve apresentar o texto:

**CRIAR CONTA E LOJA**

O botão deve permanecer desactivado enquanto os dados obrigatórios forem inválidos.

Quando o utilizador submeter o formulário:

1. Validar todos os campos.
2. Impedir submissões inválidas.
3. Apresentar um estado de carregamento durante o processamento.
4. Criar o perfil local com o tipo de conta `merchant`.
5. Associar o nome da loja ao perfil.
6. Guardar os dados utilizando o sistema de estado e persistência existente.
7. Guardar a palavra-passe através do mecanismo existente de SecureStore, respeitando as limitações actuais da autenticação local.
8. Actualizar a sessão do utilizador.
9. Redireccionar o utilizador para o fluxo de entrada na área de comerciante.

O fluxo de entrada deverá respeitar o comportamento já implementado: splash pós-registo e encaminhamento para `/shop` quando o destino for `shop`.

Não permitas que uma conta criada como cliente seja tratada automaticamente como comerciante.

### 4.4. Perfil do comerciante

O perfil deve manter os campos já existentes e identificar correctamente o tipo de conta.

Os dados devem incluir:

- Nome completo do utilizador.
- Email.
- Telefone.
- Tipo de conta.
- Nome da loja.
- Avatar, quando definido.
- Estado da sessão.

Utiliza a estrutura de perfil já existente no store.

Não cries um segundo sistema de autenticação ou um perfil paralelo apenas para comerciantes.

---

## 5. ÁREA PRINCIPAL DO COMERCIANTE

A rota principal do comerciante é:

`/shop`

Aproveita a página existente e melhora a sua funcionalidade sem alterar a identidade visual.

O ecrã deverá apresentar o nome da loja e uma área organizada para acompanhar o seu desempenho.

### 5.1. Cabeçalho da loja

Apresenta:

- Nome da loja.
- Identificação do comerciante.
- Acesso ao perfil, através dos componentes de navegação existentes.
- Acesso às funcionalidades de gestão da loja.
- Indicadores visuais coerentes com o design da OWEJI.

Utiliza os dados do comerciante autenticado localmente.

Não apresentes dados de uma loja pertencente a outro comerciante.

### 5.2. Cartões de métricas

Apresenta três métricas principais:

**Vendas**

Calcula a soma dos valores das linhas de pedidos que contenham produtos publicados pelo comerciante.

Não somes indiscriminadamente todos os pedidos dos clientes.

**Pedidos**

Calcula o número de pedidos distintos que contenham pelo menos um produto do comerciante.

Um pedido com vários produtos da mesma loja deve contar como um único pedido.

**Produtos**

Apresenta o número de produtos publicados pelo comerciante.

As métricas devem ser calculadas a partir dos dados existentes, e não de números estáticos introduzidos manualmente.

Actualiza as métricas quando os dados relevantes forem alterados.

Apresenta valores monetários em kwanzas, utilizando o formato de preços já adoptado pela OWEJI.

### 5.3. Estado vazio

Quando a loja ainda não possuir produtos, apresenta um estado vazio elegante e coerente com o design existente.

A mensagem deverá explicar que o comerciante ainda não publicou produtos.

Inclui uma chamada para acção que permita começar a publicar produtos.

Quando não existirem vendas, apresenta uma mensagem adequada, sem erros ou métricas falsas.

---

## 6. PUBLICAÇÃO DE PRODUTOS

O comerciante deve poder publicar produtos a partir da área `/shop`.

Utiliza o formulário de publicação já existente, preservando os seus componentes e estilos.

### 6.1. Campos do produto

O formulário deve conter:

- Nome do produto.
- Descrição.
- Preço em kwanzas.
- Imagem do produto.
- Estado de conservação.

Preserva as opções de estado já existentes:

- Nova.
- Seminova.
- Usada · boa.

Na implementação actual, as imagens são seleccionadas entre quatro opções predefinidas:

- `pink`
- `linen`
- `red`
- `white`

Mantém esse comportamento, excepto se já existir no projecto uma implementação funcional de selecção de imagens próprias.

Não apresentes uma funcionalidade de carregamento de fotografias como concluída se ela não estiver implementada.

### 6.2. Validação da publicação

Aplica as seguintes regras:

- Nome com mais de 2 caracteres.
- Descrição com mais de 5 caracteres.
- Preço superior a zero.
- Imagem seleccionada.
- Estado da peça seleccionado.

O botão de publicação deve estar desactivado enquanto os campos obrigatórios forem inválidos.

Apresenta mensagens de erro compreensíveis.

Durante a publicação, evita submissões duplicadas.

Após uma publicação bem-sucedida:

1. Criar o produto.
2. Atribuir-lhe um identificador único, respeitando o padrão existente `seller-<timestamp>`.
3. Associar o produto ao comerciante correcto.
4. Guardar o produto no store de produtos do comerciante.
5. Actualizar o catálogo geral.
6. Actualizar a contagem de produtos.
7. Limpar o formulário.
8. Apresentar feedback de sucesso.
9. Actualizar a interface sem obrigar o utilizador a reiniciar a aplicação.

### 6.3. Dados do produto

Preserva o modelo de produto existente.

Actualmente, os produtos publicados pelo comerciante são configurados com:

- Categoria `tops`.
- Tamanho único.
- Uma cor.
- Estado de disponibilidade activo.
- Avaliação inicial igual a zero.

Não inventes um sistema de variantes ou de stock que não esteja implementado.

Não alteres os produtos de demonstração existentes.

### 6.4. Visibilidade no catálogo

Todos os produtos publicados devem aparecer no catálogo geral da OWEJI, respeitando o funcionamento actual das páginas:

- Início.
- Categorias.
- Pesquisa.
- Filtros.
- Detalhe do produto.
- Favoritos.
- Carrinho.

O produto publicado deve poder ser aberto através da sua rota de detalhe.

Deve apresentar correctamente o nome, a descrição, o preço, a imagem, o estado e a disponibilidade.

A publicação deve respeitar as funcionalidades existentes de pesquisa, filtros e ordenação.

Não cries um catálogo separado que impeça os clientes de encontrarem os produtos dos comerciantes.

---

## 7. GESTÃO DOS PRODUTOS PUBLICADOS

Na área `/shop`, apresenta a lista dos produtos pertencentes ao comerciante.

Cada cartão deve utilizar o estilo de cartões já existente e mostrar:

- Imagem.
- Nome.
- Descrição, quando adequada ao espaço disponível.
- Preço.
- Estado da peça.
- Disponibilidade.

### 7.1. Remoção de produtos

Permite ao comerciante remover os seus próprios produtos.

Antes de remover um produto, apresenta uma confirmação através do padrão de alertas já utilizado na aplicação.

Após a confirmação:

1. Remover o produto da lista do comerciante.
2. Actualizar a persistência local.
3. Actualizar as métricas da loja.
4. Actualizar o catálogo geral.
5. Actualizar os ecrãs afectados.

Evita deixar produtos removidos visíveis devido a estados duplicados ou desactualizados.

A remoção não deve apagar os registos históricos dos pedidos já realizados.

Se um produto removido estiver referenciado num pedido anterior, preserva os dados históricos necessários para apresentar correctamente esse pedido.

Não permitas que um comerciante remova produtos de outra loja.

---

## 8. ACOMPANHAMENTO DAS VENDAS

A área do comerciante deve incluir uma secção dedicada às vendas recentes.

Reutiliza a informação disponível no store de pedidos.

### 8.1. Lista de vendas recentes

Apresenta até quatro vendas recentes, seguindo o comportamento já definido para a área do comerciante.

Cada entrada deve apresentar, conforme os dados disponíveis:

- Identificador do pedido.
- Data do pedido.
- Quantidade de produtos relevantes para o comerciante.
- Valor correspondente aos produtos da loja.

Ordena os resultados do mais recente para o mais antigo.

Não apresentes pedidos que não contenham produtos pertencentes ao comerciante.

Não contes duas vezes o mesmo pedido na métrica de pedidos.

### 8.2. Cálculo dos valores

Para cada pedido:

1. Identificar as linhas que pertencem à loja.
2. Calcular o valor das respectivas linhas.
3. Calcular a quantidade de produtos da loja.
4. Preservar o total global do pedido original.

A métrica de vendas da loja deve considerar apenas os produtos pertencentes ao comerciante.

Não atribuas ao comerciante o valor de produtos de outras lojas.

**Importante:** a aplicação actual utiliza dados locais e não possui confirmação automática de pagamentos. Não apresentes valores como pagamentos confirmados quando o estado do pedido apenas indica que o pagamento está em validação.

### 8.3. Estado vazio

Quando não existirem vendas, apresenta uma mensagem informativa e um estado vazio visualmente consistente com o resto da aplicação.

Não apresentes exemplos fictícios como se fossem vendas reais.

---

## 9. INTEGRAÇÃO COM OS PEDIDOS

A aplicação já possui os ecrãs:

- `/orders`
- `/orders/[id]`

Reutiliza a estrutura de dados existente.

Quando um cliente comprar produtos de um comerciante, os dados do pedido devem continuar a ser guardados pelo fluxo de checkout já implementado.

A área do comerciante deverá conseguir identificar os produtos da sua loja nas linhas dos pedidos.

Preserva os dados necessários para apresentar:

- Identificador do pedido.
- Data.
- Produtos comprados.
- Quantidades.
- Preços unitários.
- Tamanhos e cores.
- Dados de entrega.
- Informação sobre o pagamento.
- Estado do pedido.

Não alteres desnecessariamente o fluxo de checkout do cliente.

Não cries um segundo sistema de pedidos incompatível com o actual.

Não inventes funcionalidades de aprovação de pagamentos, alteração de estados ou envio de encomendas que ainda não possuam uma interface implementada.

Se a estrutura actual não guardar informação suficiente para associar um produto ao comerciante, identifica a lacuna e implementa a alteração mínima necessária, mantendo a compatibilidade com os dados existentes.

---

## 10. INTEGRAÇÃO COM O PERFIL

O perfil existente está disponível em `/profile`.

Quando a conta autenticada for de comerciante:

- Apresenta o acesso à loja.
- Mantém a edição do nome, email e telefone.
- Mantém a alteração do avatar.
- Mantém o acesso às moradas.
- Mantém o acesso à segurança.
- Mantém o acesso aos pedidos.
- Mantém os favoritos.
- Mantém as notificações.
- Mantém as páginas de ajuda, privacidade e termos.
- Mantém a opção de terminar sessão.

Não removas funcionalidades do perfil para criar uma versão simplificada exclusiva do comerciante.

Os dados da conta e da loja devem permanecer coerentes.

Se o nome da loja for apresentado em vários ecrãs, utiliza a mesma fonte de dados.

---

## 11. NAVEGAÇÃO E SESSÃO

Preserva a navegação actual da OWEJI.

O fluxo esperado é:

1. O utilizador abre o registo.
2. Selecciona Comerciante.
3. Preenche os dados pessoais e o nome da loja.
4. Submete o formulário.
5. A aplicação valida os dados.
6. A conta é criada no sistema local existente.
7. A sessão é actualizada.
8. O utilizador passa pelo ecrã splash, respeitando o fluxo existente.
9. O utilizador entra na área `/shop`.

Depois de iniciar sessão novamente com uma conta de comerciante, a aplicação deve encaminhá-lo para a área do comerciante.

Para uma conta de cliente, mantém o encaminhamento para a página inicial.

Evita redireccionamentos repetidos, ciclos de navegação ou apresentação incorrecta de ecrãs.

Não alteres a navegação inferior global sem necessidade.

Se for necessário melhorar a protecção das rotas, faz isso de forma compatível com a estrutura actual do Expo Router.

---

## 12. PERSISTÊNCIA E GESTÃO DE ESTADO

O projecto utiliza Zustand e AsyncStorage.

Os stores relevantes incluem os dados de:

- Perfil.
- Carrinho.
- Favoritos.
- Notificações.
- Pedidos.
- Produtos do comerciante.

A palavra-passe utiliza o mecanismo de SecureStore existente.

Antes de implementar qualquer alteração:

1. Inspecciona os stores actuais.
2. Identifica as funções já disponíveis.
3. Reutiliza as acções existentes.
4. Evita criar stores duplicados.
5. Evita duplicar dados desnecessariamente.
6. Preserva as chaves de persistência existentes sempre que possível.
7. Mantém a compatibilidade com as estruturas de dados guardadas anteriormente.

As operações de criação, publicação e remoção devem actualizar os dados persistidos.

Depois de fechar e reabrir a aplicação, os dados devem continuar disponíveis.

As alterações de estado devem reflectir-se imediatamente nos componentes que dependem desses dados.

Não utilizes apenas estados locais de componentes para funcionalidades que precisam de persistência entre sessões.

---

## 13. TRATAMENTO DE ERROS E ESTADOS DA INTERFACE

Todos os ecrãs envolvidos devem apresentar estados de interface adequados.

### Estado normal

Apresenta os dados da loja e os produtos disponíveis.

### Estado vazio

Apresenta mensagens claras quando não existem produtos ou vendas.

### Estado de validação

Indica quais os campos inválidos e o que o utilizador deve corrigir.

### Estado de carregamento

Desactiva temporariamente os botões relevantes e apresenta feedback visual durante as operações.

Mantém os padrões de carregamento existentes, como os estados de validação e registo.

### Estado de sucesso

Apresenta feedback discreto quando uma conta é criada ou um produto é publicado ou removido.

### Estado de erro

Apresenta mensagens claras quando uma operação falha.

Não apagues os dados preenchidos no formulário quando uma operação falhar.

Não deixes a interface bloqueada após uma excepção.

Evita mensagens técnicas desnecessárias para o utilizador final.

---

## 14. SEGURANÇA E LIMITAÇÕES ACTUAIS

A versão actual da OWEJI é um protótipo funcional local.

Não existe actualmente:

- Backend remoto.
- API de autenticação.
- Base de dados remota.
- Sincronização entre dispositivos.
- Autenticação real por email ou SMS.
- Processamento real de pagamentos.
- Integração com transportadoras.
- Confirmação automática de pagamentos.

Por isso, implementa o fluxo solicitado utilizando a arquitectura existente, sem afirmar que estas funcionalidades já existem.

Não introduzas um backend novo, um serviço de autenticação ou uma base de dados externa sem necessidade e sem verificar primeiro a estrutura actual do projecto.

A autenticação local não deve ser apresentada como uma solução de produção.

Não inventes transacções financeiras, vendas, utilizadores ou confirmações de pagamento.

Mantém a separação lógica entre os dados do comerciante e os dados de outros utilizadores, reconhecendo que a persistência local, por si só, não constitui uma fronteira de segurança real.

---

## 15. REGRAS PARA ALTERAÇÕES AO CÓDIGO

Antes de escrever código, analisa a estrutura do projecto.

Consulta especialmente:

- `src/app/register.tsx`
- `src/app/login.tsx`
- `src/app/splash.tsx`
- `src/app/shop.tsx`
- `src/app/(tabs)/profile.tsx`
- `src/app/(tabs)/index.tsx`
- `src/app/(tabs)/explore.tsx`
- `src/app/product/[id].tsx`
- `src/app/checkout.tsx`
- `src/app/orders.tsx`
- `src/app/orders/[id].tsx`
- `src/store/`
- `src/features/auth/`
- `src/features/products/`
- `src/constants/palette.ts`
- `src/types/`
- `src/components/`

Os caminhos são referências à estrutura documentada; verifica os ficheiros e os nomes reais antes de os modificar.

### Regras obrigatórias

1. Não recries ficheiros que já existem sem necessidade.
2. Não substituas o projecto actual por uma implementação nova.
3. Não removas funcionalidades já implementadas.
4. Não alteres o design system.
5. Não introduzas dependências sem justificação.
6. Não dupliques a lógica de autenticação.
7. Não dupliques os dados dos produtos.
8. Não quebres a compatibilidade com os pedidos existentes.
9. Não alteres o fluxo de compra do cliente sem necessidade.
10. Não utilizes dados fictícios para simular funcionalidades concluídas.
11. Mantém o TypeScript estrito.
12. Mantém os componentes reutilizáveis.
13. Respeita a organização actual do projecto.
14. Utiliza as funções e os stores existentes sempre que possível.
15. Corrige os problemas encontrados sem refactorizações desnecessárias.

Se uma funcionalidade já estiver correctamente implementada, preserva-a em vez de a reescrever.

---

## 16. TESTES OBRIGATÓRIOS

Depois da implementação, verifica os seguintes cenários.

### Cenário A — Registo de comerciante

- Abrir o ecrã de registo.
- Seleccionar Comerciante.
- Preencher os dados obrigatórios.
- Introduzir um nome de loja válido.
- Criar a conta.
- Confirmar o encaminhamento para `/shop`.
- Confirmar que o nome da loja aparece correctamente.

### Cenário B — Validação do registo

- Tentar submeter campos vazios.
- Introduzir um email inválido.
- Introduzir uma palavra-passe demasiado curta.
- Introduzir palavras-passe diferentes.
- Introduzir um nome de loja inválido.

Confirmar que o formulário impede o registo inválido e apresenta mensagens adequadas.

### Cenário C — Publicação de produtos

- Abrir a área de comerciante.
- Publicar um produto válido.
- Confirmar que aparece na lista da loja.
- Confirmar que aparece no catálogo geral.
- Confirmar que as métricas são actualizadas.
- Fechar e reabrir a aplicação.
- Confirmar que o produto continua disponível.

### Cenário D — Remoção de produtos

- Remover um produto.
- Confirmar a apresentação da confirmação.
- Confirmar que o produto deixa de aparecer na loja e no catálogo.
- Confirmar que as métricas são actualizadas.
- Confirmar que os pedidos históricos não são apagados.

### Cenário E — Vendas

- Verificar pedidos que contêm produtos do comerciante.
- Confirmar que os valores apresentados correspondem apenas aos produtos da loja.
- Confirmar que um mesmo pedido não é contado várias vezes.
- Confirmar que pedidos de outros comerciantes não são apresentados.
- Confirmar que os estados de pagamento são representados correctamente.

### Cenário F — Persistência

- Criar uma conta de comerciante.
- Publicar produtos.
- Fechar e reabrir a aplicação.
- Confirmar que os dados persistem.
- Confirmar que o comerciante continua a aceder à sua loja.

### Cenário G — Compatibilidade com clientes

- Criar ou utilizar uma conta de cliente.
- Confirmar que o cliente continua a entrar na página inicial.
- Confirmar que consegue pesquisar produtos.
- Confirmar que consegue adicionar produtos ao carrinho.
- Confirmar que consegue utilizar os favoritos.
- Confirmar que o checkout e os pedidos continuam a funcionar.

### Cenário H — Qualidade técnica

Executa os comandos disponíveis no projecto:

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

Corrige os erros introduzidos pela implementação.

Se algum comando falhar por problemas preexistentes ou por incompatibilidade de dependências, identifica claramente a causa, sem afirmar que os testes passaram.

---

## 17. CRITÉRIOS DE ACEITAÇÃO

A implementação só estará concluída quando:

- [ ] O utilizador consegue seleccionar Comerciante no registo.
- [ ] O formulário apresenta o campo do nome da loja.
- [ ] As validações funcionam correctamente.
- [ ] A conta é guardada como `merchant`.
- [ ] O nome da loja fica associado ao perfil.
- [ ] O fluxo de navegação encaminha o comerciante para `/shop`.
- [ ] A área da loja apresenta métricas calculadas a partir dos dados existentes.
- [ ] O comerciante consegue publicar produtos.
- [ ] Os produtos publicados aparecem no catálogo geral.
- [ ] O comerciante consegue consultar os seus produtos.
- [ ] O comerciante consegue remover os seus produtos.
- [ ] Os dados dos pedidos históricos são preservados.
- [ ] As vendas são calculadas sem incluir produtos de outros comerciantes.
- [ ] Os dados persistem entre sessões.
- [ ] O perfil e a navegação existentes continuam a funcionar.
- [ ] O fluxo de compra do cliente não é quebrado.
- [ ] A identidade visual original da OWEJI é preservada.
- [ ] O TypeScript e o lint não apresentam novos erros introduzidos pelas alterações.

---

## 18. RESULTADO ESPERADO

Quero uma implementação funcional, integrada no projecto actual e não apenas uma demonstração visual.

O utilizador deve conseguir seleccionar a opção de comerciante, criar a conta, entrar na sua loja, publicar produtos, gerir as publicações e consultar as vendas com base nos dados existentes.

Todas as funcionalidades devem utilizar a arquitectura actual da OWEJI, mantendo a consistência dos dados, a persistência local e a compatibilidade com a experiência dos clientes.

**Prioridade máxima: preservar o visual actual, reutilizar o código existente e implementar correctamente o fluxo de comerciante.**

Começa por analisar o projecto e identificar o que já está implementado. Depois, executa as alterações necessárias directamente nos ficheiros existentes.

No final, apresenta um resumo dos ficheiros modificados, das funcionalidades implementadas, dos testes executados e das limitações que continuam por resolver.