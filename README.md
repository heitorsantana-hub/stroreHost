# StoreHost 🏪 | Sistema de Gestão Multi-tenant

![Licença](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)

**StoreHost** é uma solução completa de ERP e PDV (Ponto de Venda) desenvolvida para micro e pequenos empreendedores. O sistema permite o controle total de estoque, vendas e fluxo financeiro em uma interface moderna, minimalista e intuitiva.

## 🚀 Funcionalidades

- **Dashboard Executivo:** Visão geral de vendas, despesas e alertas de estoque baixo.
- **Gestão de Estoque:** Controle de entradas e saídas com histórico de auditoria.
- **PDV (Ponto de Venda):** Registro rápido de transações com snapshot de preços (garantia de histórico financeiro).
- **Módulo Financeiro:** Gráficos interativos (Doughnut/Pie) para análise de fluxo de caixa por categoria.
- **Gestão de Equipes:** Sistema de autenticação e controle de colaboradores por unidade.
- **Arquitetura Multi-tenant:** Cada loja possui isolamento completo de seus dados.

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js com Express.
- **Frontend:** Handlebars (HBS) com CSS Vanilla.
- **Banco de Dados:** MongoDB (via Mongoose).
- **Gráficos:** Chart.js.
- **Segurança:** Bcrypt para criptografia de senhas e Session para controle de acesso.

## 📦 Como rodar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/seu-usuario/storehost.git](https://github.com/seu-usuario/storehost.git)

   Instale as dependências:

Bash
npm install
Configure as variáveis de ambiente no arquivo .env (use o .env.example como guia).

Inicie o servidor:

Bash
npm start
🔒 Segurança e Boas Práticas
Este projeto segue rigorosos padrões de segurança:

Variáveis de Ambiente: Credenciais sensíveis nunca são expostas no repositório.

Sanitização de Dados: Proteção contra entradas inválidas e cálculos de estoque via backend.

Arquitetura MVC: Código organizado e fácil de escalar.
