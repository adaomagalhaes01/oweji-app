# OWEJI — Mobile Fashion Marketplace

## 1. CONTEXTO DO PROJETO

Desenvolva o aplicativo mobile **OWEJI**, um marketplace/bazar digital focado principalmente em **roupas femininas, acessórios e produtos de moda**.

O objetivo do Oweji é proporcionar uma experiência de compra moderna, elegante, simples e visualmente agradável, permitindo que utilizadoras descubram produtos, visualizem detalhes, adicionem produtos ao carrinho e gerenciem o seu perfil.

A referência visual fornecida mostra a direção estética desejada.

IMPORTANTE:

- Use a imagem de referência como inspiração visual.
- NÃO copie exatamente o design.
- Crie uma identidade própria para o Oweji.
- O aplicativo deve parecer um produto comercial real.
- Evite aparência de protótipo ou template genérico.
- Priorize experiência mobile.
- A interface deve ser feminina, moderna, elegante, leve e premium.
- Todos os elementos devem ter espaçamento consistente.
- Não utilizar emojis como elementos principais da interface.
- Utilize ícones profissionais através de uma biblioteca de ícones.

---

# 2. STACK TECNOLÓGICA

Utilizar:

- React Native
- Expo — utilizar a versão estável mais recente disponível no momento da implementação
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS para React Native
- React Native Safe Area Context
- Zustand para gerenciamento de estado local
- TanStack Query para dados remotos
- React Hook Form
- Zod para validação
- AsyncStorage para dados locais não sensíveis
- Expo SecureStore para informações sensíveis
- Expo Image para carregamento otimizado de imagens
- Lucide React Native ou outra biblioteca moderna de ícones consistente

Antes de instalar dependências:

1. Verificar a versão estável atual do Expo.
2. Utilizar versões compatíveis entre React Native, Expo e todas as bibliotecas.
3. Evitar dependências desnecessárias.
4. Não utilizar bibliotecas abandonadas ou incompatíveis com a versão atual do Expo.

---

# 3. ARQUITETURA

Utilizar uma arquitetura organizada e escalável.

Preferir arquitetura baseada em funcionalidades:

src/

├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── splash.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── categories.tsx
│       ├── cart.tsx
│       └── profile.tsx
│
├── components/
│   ├── ui/
│   ├── cards/
│   ├── navigation/
│   ├── forms/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── profile/
│   └── categories/
│
├── store/
│   ├── authStore.ts
│   └── cartStore.ts
│
├── services/
│   ├── api.ts
│   ├── authService.ts
│   └── productService.ts
│
├── constants/
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── hooks/
│
├── types/
│
└── utils/

A arquitetura deve permitir posteriormente adicionar:

- Backend
- API
- autenticação real
- pagamentos
- favoritos
- notificações
- vendedores
- avaliações
- pedidos
- sistema de entrega

Sem precisar reescrever toda a aplicação.

---

# 4. IDENTIDADE VISUAL

Nome do aplicativo:

OWEJI

Conceito visual:

- Feminino
- Elegante
- Moderno
- Minimalista
- Premium
- Suave
- Jovem
- Comercial

Evitar:

- cores excessivamente fortes
- excesso de sombras
- excesso de gradientes
- interfaces muito carregadas
- elementos gigantes
- aparência infantil
- excesso de bordas
- excesso de animações

---

# 5. PALETA DE CORES

Criar uma paleta baseada na referência visual.

### Primary

Rosa principal:

#E98A9A

Utilização:

- botões
- estados ativos
- preços destacados
- elementos de destaque
- ações principais

### Primary Dark

#C95F72

Utilização:

- pressed states
- textos importantes
- elementos de contraste

### Background

#FFF8FA

Fundo principal da aplicação.

### Surface

#FFFFFF

Cards e áreas de conteúdo.

### Soft Pink

#FCE7EC

Fundos secundários.

### Text Primary

#252225

Texto principal.

### Text Secondary

#777277

Texto secundário.

### Border

#F0E5E8

Bordas suaves.

### Success

#4FA982

### Error

#D95C68

### Warning

#D99A52

Criar as cores como tokens centralizados.

Não espalhar códigos hexadecimais diretamente pelos componentes.

---

# 6. TIPOGRAFIA

Utilizar uma fonte moderna e elegante.

Preferência:

**Poppins**

Pesos:

- Regular — 400
- Medium — 500
- SemiBold — 600
- Bold — 700

Hierarquia:

### Heading principal

Poppins SemiBold/Bold

24–28px

### Section title

Poppins SemiBold

18–20px

### Product title

Poppins Medium/SemiBold

14–16px

### Body

Poppins Regular

13–15px

### Caption

Poppins Regular

11–12px

### Price

Poppins SemiBold

14–16px

A tipografia deve ser consistente em toda a aplicação.

---

# 7. DESIGN SYSTEM

Criar um pequeno design system.

### Border Radius

Cards:

16–20px

Inputs:

14–16px

Buttons:

14–16px

Product images:

14–18px

Bottom navigation:

20–28px

### Spacing

Utilizar uma escala consistente:

4
8
12
16
20
24
32

Evitar espaçamentos arbitrários.

### Shadows

Utilizar sombras muito suaves.

Exemplo:

shadowOpacity: 0.05

Nunca utilizar sombras muito pesadas.

---

# 8. SPLASH SCREEN

Criar uma splash screen elegante.

Estrutura:

- Fundo #FFF8FA
- Logo OWEJI centralizado
- Nome OWEJI
- Pequeno elemento visual relacionado com moda
- Animação suave de entrada

Animação:

1. Logo aparece com fade-in.
2. Pequeno scale-up.
3. Nome OWEJI aparece suavemente.
4. Após carregamento, navegar automaticamente para o fluxo correto.

Se utilizadora estiver autenticada:

Splash → Home

Se não estiver:

Splash → Login/Criar conta

Não criar uma splash excessivamente carregada.

---

# 9. TELA DE CRIAR CONTA

Criar uma tela moderna e simples.

Header:

"Crie a sua conta"

Subtexto:

"Descubra peças incríveis e encontre o seu estilo."

Campos:

- Nome completo
- Email
- Número de telefone
- Palavra-passe
- Confirmar palavra-passe

Botão principal:

"CRIAR CONTA"

Link:

"Já tenho uma conta"

Adicionar:

- validação visual
- mensagens de erro
- estados de loading
- botão disabled quando formulário inválido
- mostrar/esconder password

A experiência deve ser rápida e sem excesso de campos.

---

# 10. LOGIN

Criar também a tela de login.

Campos:

- Email ou telefone
- Palavra-passe

Elementos:

"Esqueceu a palavra-passe?"

Botão:

"ENTRAR"

Link:

"Ainda não tem uma conta? Criar conta"

Manter a mesma identidade visual do cadastro.

---

# 11. HOME / TELA PRINCIPAL

Esta é uma das telas mais importantes.

Estrutura:

Header:

- Saudação
- Avatar do utilizador
- Ícone de notificações

Exemplo:

"Olá, Adão"

"Encontre o seu próximo look."

Depois:

### Search

Campo de pesquisa:

"Pesquisar roupas, acessórios..."

Utilizar ícone de pesquisa.

### Categories

Categorias horizontais:

- Vestidos
- Tops
- Saias
- Calças
- Acessórios
- Sapatos

Cada categoria deve possuir uma representação visual simples.

### Section

"Em alta agora"

Mostrar produtos em grid.

### Product Card

Cada card deve conter:

- imagem grande do produto
- botão de favorito no canto superior
- nome
- preço
- eventualmente desconto
- indicador de disponibilidade

Exemplo:

Vestido Rosa Listrado

Kz 1.299,00

O card deve ser visualmente semelhante ao conceito apresentado na imagem de referência, mas com identidade própria.

---

# 12. PRODUCT GRID

Utilizar:

2 colunas no mobile.

Cards com:

- imagem 100%
- aspect ratio consistente
- border radius
- nome
- preço
- favorito

As imagens devem ter boa qualidade.

Evitar cards excessivamente altos.

Utilizar FlatList para performance.

Não utilizar ScrollView com centenas de produtos.

---

# 13. DETALHES DO PRODUTO

Ao selecionar um produto:

Mostrar:

- imagem principal grande
- galeria de imagens
- nome
- preço
- descrição
- avaliação
- tamanhos
- cores
- disponibilidade

Exemplo:

Vestido Listrado Rosa

Kz 1.299,00

Tamanhos:

XS | S | M | L | XL

Cores:

círculos de seleção

Botão principal fixo:

"Adicionar ao carrinho"

Permitir seleção de tamanho e cor antes de adicionar.

---

# 14. CARRINHO

Criar uma tela "Meu Carrinho".

Cada item deve apresentar:

- imagem
- nome
- preço
- tamanho
- cor
- quantidade
- botão remover
- controles + e -

Exemplo:

Vestido Verde Listrado
Kz 1.499,00

S

Quantidade:

- 1 +

No final:

Subtotal
Kz X

Frete
Kz X

Total
Kz X

Botão:

"Finalizar compra"

O total deve atualizar automaticamente.

Utilizar Zustand para estado do carrinho.

Persistir carrinho localmente quando apropriado.

---

# 15. PERFIL DO UTILIZADOR

Tela:

"Meu Perfil"

Header:

- Avatar
- Nome
- Email

Seções:

### Minha conta

- Dados pessoais
- Endereços
- Alterar palavra-passe

### Compras

- Meus pedidos
- Histórico de compras
- Favoritos

### Preferências

- Notificações
- Idioma
- Tema

### Segurança

- Privacidade
- Termos e condições
- Sair da conta

Utilizar uma interface limpa com ícones.

---

# 16. BOTTOM NAVIGATION

A navegação principal deve ficar **sempre na parte inferior**.

Utilizar:

1. Início
2. Categorias
3. Carrinho
4. Favoritos
5. Perfil

A referência visual mostra uma barra inferior arredondada.

Criar uma versão moderna dessa ideia.

Características:

- fundo branco
- cantos arredondados
- sombra muito suave
- ícones minimalistas
- ícone ativo em rosa
- ícones inativos em cinza
- label opcional ou apenas ícone dependendo do espaço

O item ativo deve possuir destaque visual.

A barra deve respeitar Safe Area.

---

# 17. FAVORITOS

Criar sistema visual para favoritar produtos.

O botão de coração deve ficar no canto superior direito da imagem.

Estados:

Não favoritado:

outline

Favoritado:

preenchido

A interação deve possuir uma pequena animação.

---

# 18. ANIMAÇÕES

As animações devem ser discretas.

Utilizar preferencialmente:

React Native Reanimated

Animações permitidas:

- fade
- scale
- slide
- press feedback
- heart animation
- product card entrance

Não exagerar nas animações.

A aplicação deve parecer premium, não uma demonstração de animações.

---

# 19. RESPONSIVIDADE

Embora seja um aplicativo mobile, considerar:

- diferentes tamanhos de Android
- diferentes tamanhos de iPhone
- telas pequenas
- telas grandes
- Safe Area
- Dynamic Island/notches
- Android navigation bar

Nunca posicionar elementos importantes usando valores absolutos frágeis.

---

# 20. ACESSIBILIDADE

Implementar:

- accessible labels
- áreas de toque adequadas
- contraste suficiente
- estados disabled
- feedback visual
- suporte a leitores de tela onde apropriado

Botões importantes devem possuir área de toque confortável.

---

# 21. ESTADOS DA INTERFACE

Todas as telas que carregam dados devem considerar:

### Loading

Skeleton loaders quando apropriado.

### Empty

Exemplo:

"Seu carrinho está vazio."

"Você ainda não adicionou favoritos."

### Error

Mensagem amigável:

"Não foi possível carregar os produtos."

Botão:

"Tentar novamente"

### Success

Feedback visual após ações importantes.

---

# 22. DADOS MOCK

Nesta primeira fase, não implementar backend real.

Criar dados mock realistas para:

- produtos
- categorias
- utilizador
- carrinho
- favoritos

Criar uma estrutura que posteriormente possa ser substituída por uma API real sem alterar os componentes da interface.

Exemplo:

Product:

{
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  rating: number;
  available: boolean;
}

---

# 23. PERFORMANCE

Utilizar boas práticas desde o início.

Obrigatório:

- FlatList para listas
- memoização quando necessária
- imagens otimizadas
- evitar renders desnecessários
- componentes reutilizáveis
- Zustand apenas onde necessário
- React Query para dados remotos futuramente

Não criar um componente gigante com toda a aplicação.

---

# 24. COMPONENTIZAÇÃO

Criar componentes reutilizáveis.

Exemplos:

ProductCard
CategoryCard
SearchBar
Avatar
AppButton
AppInput
IconButton
PriceText
Rating
ProductImage
CartItem
BottomNavigation
SectionHeader
EmptyState
LoadingState
ErrorState

Os componentes devem ser pequenos e ter responsabilidades claras.

---

# 25. TEMA

Preparar a aplicação para suportar futuramente:

- Light Mode
- Dark Mode

A primeira versão deve utilizar exclusivamente o tema claro.

---

# 26. EXPERIÊNCIA DO UTILIZADOR

A experiência deve transmitir:

"Estou num marketplace de moda moderno."

Não deve parecer:

- marketplace genérico
- app bancário
- template administrativo
- e-commerce antigo

O utilizador deve conseguir:

Abrir aplicação
↓
Ver produtos
↓
Pesquisar
↓
Abrir produto
↓
Selecionar tamanho/cor
↓
Adicionar ao carrinho
↓
Visualizar carrinho
↓
Finalizar compra

com o mínimo de fricção.

---

# 27. ESTRUTURA DE NAVEGAÇÃO

Fluxo inicial:

Splash
↓
Verificar autenticação
↓
┌─────────────────────┐
│                     │
Não autenticado       Autenticado
│                     │
↓                     ↓
Login/Criar conta     Home
                      │
                      ├── Categorias
                      ├── Produto
                      ├── Carrinho
                      ├── Favoritos
                      └── Perfil

---

# 28. REGRAS IMPORTANTES PARA O DESENVOLVIMENTO

NÃO:

- alterar a arquitetura sem motivo
- instalar bibliotecas desnecessárias
- criar código duplicado
- colocar lógica de negócio diretamente nas telas
- utilizar valores de cores espalhados pelo projeto
- utilizar emojis como ícones
- criar componentes gigantes
- utilizar imagens enormes sem otimização
- utilizar ScrollView para listas grandes
- criar funcionalidades falsas sem indicar que são mocks

SIM:

- TypeScript rigoroso
- componentes reutilizáveis
- código limpo
- arquitetura escalável
- tipagem correta
- separação de responsabilidades
- UI consistente
- UX moderna
- estados de loading/error/empty
- código preparado para backend futuro

---

# 29. PRIMEIRA FASE DE IMPLEMENTAÇÃO

Nesta primeira implementação criar:

1. Splash
2. Login
3. Criar conta
4. Home
5. Categorias
6. Detalhes do produto
7. Carrinho
8. Favoritos
9. Perfil
10. Bottom navigation

Não implementar ainda:

- pagamento real
- backend
- autenticação real
- sistema de entrega
- chat
- painel administrativo
- marketplace para vendedores

Essas funcionalidades serão adicionadas posteriormente.

---

# 30. ORDEM DE DESENVOLVIMENTO

Implementar nesta ordem:

### Fase 1
Configuração do projeto.

### Fase 2
Design system.

### Fase 3
Splash + autenticação.

### Fase 4
Bottom navigation.

### Fase 5
Home.

### Fase 6
Categorias.

### Fase 7
Detalhes do produto.

### Fase 8
Carrinho.

### Fase 9
Favoritos.

### Fase 10
Perfil.

### Fase 11
Estados de loading/error/empty.

### Fase 12
Polimento visual e animações.

---

# 31. RESULTADO ESPERADO

O resultado final deve parecer uma aplicação de e-commerce de moda feminina pronta para ser apresentada a clientes ou investidores.

A aplicação deve transmitir:

**Elegância + simplicidade + moda + confiança + modernidade.**

A referência enviada deve servir como inspiração principal para:

- proporções
- organização
- cards
- utilização de imagens
- navegação inferior
- estética rosa
- sensação de marketplace de moda

Porém, a implementação deve criar uma identidade própria para o OWEJI.

Antes de finalizar:

1. Verificar todos os fluxos.
2. Verificar navegação.
3. Verificar responsividade.
4. Verificar Safe Area.
5. Verificar TypeScript.
6. Verificar erros de lint.
7. Verificar dependências.
8. Garantir que o projeto execute corretamente com Expo.
9. Garantir que nenhuma tela importante fique sem estado de loading/error/empty.
10. Garantir que o código esteja organizado e preparado para integração com backend.

O foco é criar uma **base profissional, escalável e visualmente premium para o OWEJI**.
