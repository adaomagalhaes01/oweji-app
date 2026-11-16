# OWEJI · Dashboard Web Administrativa & Comerciante

Dashboard web completa desenvolvida com **React**, **Vite**, **Tailwind CSS** e ícones **Lucide**, mantendo rigorosamente a identidade visual e as regras de negócio do aplicativo móvel **OWEJI** (marketplace de moda em Angola).

---

## 🎨 Paleta de Cores (Fiel ao App Móvel)

| Token | Hex | Aplicação no Dashboard |
| :--- | :--- | :--- |
| **Primary** | `#E98A9A` | Botões de ação, badges principais e destaques |
| **Primary Dark** | `#C95F72` | Hover, títulos de valores em Kwanzas e ícones de auditoria |
| **Background** | `#FFF8FA` | Fundo principal de todas as páginas |
| **Surface** | `#FFFFFF` | Cartões, tabelas e janelas modais |
| **Soft Pink** | `#FCE7EC` | Badges de status pendente e fundos de ícones ativos |
| **Text** | `#252225` | Títulos e texto principal |
| **Text Secondary**| `#777277` | Legendas, datas e descrições auxiliares |
| **Border** | `#F0E5E8` | Linhas de divisão, contornos de tabelas e inputs |
| **Success** | `#4FA982` | Encomendas entregues e saldos líquidos positivos |
| **Error** | `#D95C68` | Comprovativos rejeitados e produtos esgotados |
| **Warning** | `#D99A52` | Alertas de stock crítico (`<= 3` peças) |

---

## 👥 Perfis de Acesso Implementados

### 1. Administrador Geral (Governança da Plataforma)
- **Visão Geral**: Volume transacionado (GMV), total de encomendas, lojas parceiras ativas e comprovativos pendentes.
- **Validação Bancária**: Ecrã de conferência de comprovativos de transferência (Multicaixa Express, BAI Directo, BFA Net) com pré-visualização em alta resolução e botões de aprovação/rejeição com avanço de estado.
- **Lojas & Comerciantes**: Lista de lojistas, aprovação de novas lojas (`Ativa`, `Sob Análise`, `Suspensa`) e configuração da comissão percentual retida pela OWEJI.
- **Catálogo Global & Moderação**: Consulta de todas as peças publicadas com capacidade de pausar ou remover anúncios irregulares.
- **Todas as Encomendas**: Registo global de pedidos em Angola por província.

### 2. Comerciante (Gestão da Loja Parceira)
- **Painel da Loja**: Faturamento bruto e líquido, peças ativas, unidades em stock e alertas de stock baixo.
- **Os Meus Produtos**: CRUD completo de peças com fotografia, preço em Kwanzas, condição (`Novo`, `Seminovo`, `Segunda mão`), stock e tamanhos.
- **Encomendas dos Clientes**: Gestão de pedidos recebidos com morada completa do comprador (província, município e ponto de referência) e fluxo de expedição (`Em Preparação` ➔ `A Caminho` ➔ `Entregue`).
- **Vendas & Repasses**: Cálculo automático do valor retido pela plataforma e saldo líquido a receber.
- **Perfil & IBAN**: Configurações da loja, localização física em Angola, contactos e dados bancários para repasse.

---

## 🚀 Como Executar

### Opção 1: Servidor Local Integrado (Recomendado)
A partir da raiz do projeto:
```bash
npm run admin
```
Aceda no navegador a: **`http://localhost:5173`**

### Opção 2: Abrir diretamente no Navegador
Pode também abrir o ficheiro `admin-web/preview.html` diretamente em qualquer navegador web.

---

## 📁 Estrutura de Ficheiros

```text
admin-web/
├── index.html                   # Entrada do Vite
├── preview.html                 # Versão autónoma completa interativa
├── serve.js                     # Servidor HTTP Node.js local
├── package.json                 # Dependências e scripts
├── vite.config.ts               # Configuração do Vite e aliases
├── tsconfig.json                # Tipagem TypeScript estrita
└── src/
    ├── constants/               # Palette de cores e estados de pedidos
    ├── types/                   # Modelos de Store, Product, Order e User
    ├── data/mockData.ts         # Dados de exemplo realistas de Angola (BAI, BFA, Talatona, etc.)
    ├── context/AppContext.tsx   # Estado global em React com persistência no LocalStorage
    ├── components/
    │   ├── ui/                  # Badge, Button, Card, Modal
    │   ├── common/              # ReceiptViewerModal (auditoria de transferências)
    │   └── layout/              # Sidebar (com alternador de perfil) e Topbar
    ├── pages/
    │   ├── admin/               # 5 Ecrãs do Administrador
    │   └── merchant/            # 5 Ecrãs do Comerciante
    └── App.tsx                  # Roteador e layout principal
```
