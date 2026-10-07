<div align="center">
  <img src="assets/products/splesh.jpeg" alt="Imagem da splash screen do OWEJI" width="180" />

  # OWEJI

  **Marketplace de moda feito para descobrir, guardar e comprar peças com personalidade.**

  Uma aplicação mobile-first desenvolvida com Expo e React Native, com experiências para clientes e comerciantes.

  <p>
    <img alt="Expo SDK 57" src="https://img.shields.io/badge/Expo-SDK%2057-4630EB?logo=expo&logoColor=white" />
    <img alt="React Native 0.86" src="https://img.shields.io/badge/React%20Native-0.86-20232A?logo=react&logoColor=61DAFB" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" />
    <img alt="Plataformas" src="https://img.shields.io/badge/Plataformas-Android%20%7C%20iOS%20%7C%20Web-CC527A" />
  </p>
</div>

---

## Sobre o projeto

O OWEJI aproxima clientes de uma coleção de moda e oferece aos comerciantes uma área simples para publicar produtos. A experiência inclui navegação por categorias, pesquisa, detalhes de cada peça, favoritos, carrinho e registo demonstrativo de pedidos.

O projeto está em desenvolvimento. Os dados são guardados localmente no dispositivo; o checkout é demonstrativo e não processa pagamentos.

## Funcionalidades

### Para clientes

- Explorar produtos por categoria, pesquisa, preço e disponibilidade.
- Consultar imagens, descrições, preços em kwanzas, tamanhos e cores.
- Guardar produtos nos favoritos.
- Adicionar peças ao carrinho e ajustar quantidades.
- Registar um pedido de demonstração e consultar notificações.
- Criar perfil de cliente ou comerciante.

### Para comerciantes

- Criar uma loja no perfil.
- Publicar e remover produtos a partir de opções de imagem disponíveis na aplicação.
- Consultar um resumo local de produtos, pedidos e vendas registadas no dispositivo.

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) | Desenvolvimento multiplataforma e ferramentas Expo |
| [React Native 0.86](https://reactnative.dev/) | Interface para Android, iOS e Web |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegação baseada em ficheiros |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Zustand](https://zustand.docs.pmnd.rs/) | Estado da aplicação |
| AsyncStorage | Persistência local dos dados |
| React Native Reanimated | Animações da experiência de abertura |

## Começar

### Requisitos

- Node.js 22.13 ou superior.
- npm.
- Expo Go para uma pré-visualização rápida em dispositivo, ou emulador Android/iOS para desenvolvimento nativo.

### Instalação

```bash
git clone <URL_DO_REPOSITORIO>
cd Oweji
npm install
npx expo start
```

Depois de iniciar o Expo, leia o QR code com o Expo Go ou escolha um destino no terminal. Para abrir directamente no browser:

```bash
npx expo start --web
```

## Comandos úteis

```bash
npx expo start       # Iniciar o servidor de desenvolvimento
npx expo start --web # Executar a versão Web
npx expo lint        # Verificar o código com ESLint
npx tsc --noEmit     # Verificar os tipos TypeScript
```

## Estrutura do projecto

```text
src/
├── app/                  # Rotas e ecrãs Expo Router
│   ├── (tabs)/           # Início, explorar, favoritos, carrinho e perfil
│   ├── product/[id].tsx  # Detalhes de produto
│   ├── login.tsx         # Entrada demonstrativa
│   ├── register.tsx      # Registo de cliente ou comerciante
│   ├── shop.tsx          # Área do comerciante
│   └── notifications.tsx # Notificações
├── components/           # Componentes partilhados
├── features/products/    # Catálogo, categorias e tipos de produto
└── store/                # Estado local e persistido
assets/
├── images/               # Ícones e recursos visuais da aplicação
└── products/             # Imagens da coleção e da splash screen
```

## Estado actual

Esta versão é um protótipo funcional de interface. O catálogo inicial, perfis, favoritos, carrinho, notificações, produtos publicados e pedidos usam dados locais. O registo e o login não estão ligados a um serviço de autenticação; a finalização do pedido não efectua cobrança nem integra transportadoras.

## Contribuir

Contribuições são bem-vindas. Abra uma issue para discutir uma alteração maior ou envie um pull request com uma descrição clara do que mudou.

Antes de enviar alterações, execute:

```bash
npx expo lint
npx tsc --noEmit
```

## Licença

Ainda não foi definida uma licença para este repositório. Contacte os responsáveis pelo projecto antes de reutilizar ou distribuir o código.
