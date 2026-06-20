# 📊 ANALISE DETALHADA DO SISTEMA STOREHOST
**Resumo Estruturado para Base de Conhecimento - Sistema de Gestão de Loja Multitenant**

---

## 1️⃣ VISÃO GERAL DO PROJETO

### Propósito
StoreHost é um **sistema web de gestão integrada para lojas físicas**, construído com **Node.js + Express** (backend) e **Express Handlebars** (frontend). O sistema é **multitenant** (cada loja tem seus próprios dados isolados).

### Stack Tecnológico
- **Backend**: Node.js + Express.js
- **Frontend**: Express Handlebars (template engine)
- **Banco de Dados**: MongoDB + Mongoose ODM
- **Autenticação**: Session-based (express-session)
- **Segurança**: bcrypt (hash de senhas), JWT disponível mas não usado
- **Upload de Arquivos**: Multer
- **Template Admin**: SB Admin 2 (Bootstrap 5)

---

## 2️⃣ ROTAS E TELAS DISPONÍVEIS

### 📍 TELAS PÚBLICAS (SEM AUTENTICAÇÃO)

#### 🏠 Home (`GET /`)
- **Renderiza**: `home.handlebars` (layout: `main`)
- **Função**: Landing page inicial do sistema
- **Dados Gerenciados**: Nenhum
- **Fluxo**: Usuário não autenticado vê página de boas-vindas

#### 🔐 Login (`GET /login`)
- **Renderiza**: `login.handlebars` (layout: `login`)
- **Função**: Formulário de autenticação de loja
- **Campos Esperados**: `email`, `password`
- **POST para**: `/login/post`

#### 📝 Registro (`GET /register`)
- **Renderiza**: `register.handlebars` (layout: `register`)
- **Função**: Formulário de cadastro de nova loja
- **Campos Esperados**: `name`, `email`, `password`, `address`, `phone`, `cnpj`
- **POST para**: `/register/store`

---

### 📍 TELAS AUTENTICADAS (ÁREA DO DASHBOARD)

#### 📊 Dashboard Principal (`GET /dashboard`)
- **Renderiza**: `dashboard.handlebars` (layout: `dashboard`)
- **Função**: Painel de controle com KPIs e gráficos
- **Dados Gerenciados**:
  - Contagem total de produtos da loja
  - Contagem de produtos com estoque crítico (< 5 unidades)
  - Total de vendas (faturamento agregado)
  - Total de despesas por categoria
  - Últimas 4 vendas realizadas
  - Últimas 4 movimentações de estoque
  - Gráfico de faturamento mensal (ano corrente)
  - Gráfico de despesas por categoria

#### 🛍️ Gestão de Produtos (`GET /dashboard/product`)
- **Renderiza**: `product.handlebars` (layout: `dashboard`)
- **Dados Gerenciados**:
  - Lista completa de produtos da loja
  - Nome, categoria, descrição, preço, imagem, estoque
- **Operações Disponíveis**:
  - ✅ `POST /dashboard/products/create` - Criar novo produto (com upload de imagem)
  - ✏️ `POST /dashboard/product/update/:id` - Editar produto
  - ❌ `POST /dashboard/product/delete` - Deletar produto

#### 📦 Gestão de Estoque (`GET /dashboard/stock`)
- **Renderiza**: `stock.handlebars` (layout: `dashboard`)
- **Dados Gerenciados**:
  - Lista de produtos com estoque atual
  - Histórico de movimentações de estoque (entrada/saída)
- **Operações Disponíveis**:
  - ✅ `POST /dashboard/stock/update` - Adicionar entrada de estoque (registra movimentação)
  - ✏️ `POST /dashboard/stock/update/:id` - Definir estoque direto (ajuste manual)

#### 👥 Gestão de Funcionários (`GET /dashboard/employee`)
- **Renderiza**: `employee.handlebars` (layout: `dashboard`)
- **Dados Gerenciados**:
  - Lista de funcionários cadastrados
  - Nome, email, cargo, data de admissão
- **Operações Disponíveis**:
  - ✅ `POST /dashboard/employee/post` - Cadastrar novo funcionário
  - ✏️ `POST /dashboard/employee/update/:id` - Editar funcionário
  - ❌ `POST /dashboard/employee/delete` - Deletar funcionário

#### 💰 Gestão de Vendas (`GET /dashboard/sales`)
- **Renderiza**: `sale.handlebars` (layout: `dashboard`)
- **Dados Gerenciados**:
  - Lista de todas as vendas realizadas
  - Produto vendido, quantidade, preço unitário, total, forma de pagamento
  - Status da venda (Concluída, Cancelada, Reembolsada)
- **Operações Disponíveis**:
  - ✅ `POST /dashboard/sales/create` - Registrar nova venda
  - ✏️ `POST /dashboard/sales/update/:id` - Editar venda
  - ❌ `POST /dashboard/sales/delete` - Deletar/cancelar venda

#### 💸 Gestão Financeira (`GET /dashboard/finance`)
- **Renderiza**: `finance.handlebars` (layout: `dashboard`)
- **Dados Gerenciados**:
  - Lançamentos de receitas e despesas
  - Categoria, descrição, valor, tipo (entrada/saída)
  - Total de entradas vs saídas
  - Breakdown por categoria
- **Operações Disponíveis**:
  - ✅ `POST /dashboard/finance/create` - Registrar novo lançamento
  - ✏️ `POST /dashboard/finance/update/:id` - Editar lançamento
  - ❌ `POST /dashboard/finance/delete` - Deletar lançamento

#### 📅 Gestão de Agendamentos (`GET /dashboard/scheduling`)
- **Renderiza**: `scheduling.handlebars` (layout: `dashboard`)
- **Dados Gerenciados**:
  - Agenda de serviços/atendimentos
  - Funcionário responsável, data, hora, tipo de serviço
  - Dados do cliente (nome, telefone)
  - Status do agendamento (Pendente, Confirmado, Concluído, Cancelado)
- **Operações Disponíveis**:
  - ✅ `POST /dashboard/scheduling/create` - Criar agendamento
  - ✏️ `POST /dashboard/scheduling/update/:id` - Editar agendamento
  - ❌ `POST /dashboard/scheduling/delete` - Deletar agendamento

---

## 3️⃣ REGRAS DE NEGÓCIO IMPLÍCITAS

### 🔐 Autenticação e Sessão
1. **Login de Loja**: Autenticação por email + senha simples (sem bcrypt no login de Store)
   - Armazena na sessão: `req.session.storeId`, `req.session.storeName`, `req.session.statusLogin`
   - Validade: Sessão do navegador (até fechar browser)

2. **Proteção de Rotas**: Todas as rotas autenticadas verificam `if (!req.session.storeId)`
   - Se não autenticado → redireciona para `/login?error=session`

3. **Isolamento Multitenant**: 
   - Cada busca no banco filtra obrigatoriamente por `store_id`
   - Impossível um usuário de uma loja ver dados de outra loja

---

### 📦 Gestão de Estoque

1. **Estoque Inicial**: Todo produto novo nasce com `current_stock = 0`

2. **Estoque Crítico**:
   - Dashboard alerta produtos com `current_stock < 5` unidades
   - Estes aparecem em destaque no KPI

3. **Movimentação de Estoque**:
   - Cada movimento (entrada/saída) gera um registro em `StockMovement`
   - Tipos: `"in"` (entrada) ou `"out"` (saída)
   - Rastreabilidade completa com timestamp

4. **Ajuste Manual**:
   - `POST /dashboard/stock/update/:id` permite definir estoque direto
   - Útil para sincronizar com contagem física

---

### 💰 Gestão de Vendas e Estoque

1. **Venda com Validação de Estoque**:
   - Verifica se `product.current_stock >= quantidade_a_vender`
   - Se insuficiente → redireciona com erro `?error=quantity`

2. **Snapshot de Preço**: 
   - Ao vender, o preço atual do produto é "fotografado"
   - Salva em `unit_price` e `product_name` na venda
   - Se gerente mudar preço depois, recibo mantém valor original

3. **Cálculo Automático**:
   - `total_price = unit_price × quantity` (calculado no backend)
   - Evita manipulação do cliente

4. **Baixa Automática de Estoque**:
   - Ao registrar venda → `product.current_stock -= qtdVendida`
   - Simultaneamente registra saída em `StockMovement` (type: "out")

5. **Formas de Pagamento Aceitas**:
   - Pix, Cartão de Crédito, Cartão de Débito, Dinheiro
   - Armazenado mas não interfere na lógica (apenas registro)

6. **Status de Venda**:
   - Padrão ao criar: "Concluída"
   - Possibilidade futura: "Cancelada", "Reembolsada"

---

### 👥 Gestão de Funcionários

1. **Email Único por Loja**:
   - Verifica `Employee.findOne({ email, store_id })`
   - Não permite duplicação de email na mesma loja
   - Redireciona com erro: `?error=email`

2. **Senha Criptografada**:
   - Usa bcrypt com salt de 10 rounds
   - Hash nunca pode ser revertido (apenas verificado)

3. **Cargo Padrão**:
   - Se não informado, recebe "Operador de Estoque"

4. **Auditoria de Data**:
   - `createdAt` registra automaticamente data de admissão

---

### 💸 Gestão Financeira

1. **Tipos de Transação**:
   - `"income"` (receita/entrada)
   - `"expense"` (despesa/saída)

2. **Validação de Valor**:
   - `amount > 0` (obrigatoriamente positivo)
   - Suporta vírgula (10,50) e ponto (10.50) → normalizado para decimal

3. **Categorização Flexível**:
   - Categoria é texto livre (não é enum)
   - Usado para agrupamento em gráficos

4. **Rastreabilidade**:
   - Cada lançamento tem descrição textual
   - Timestamp automático

5. **Análise no Dashboard**:
   - Gráfico de despesas por categoria (Pie/Doughnut)
   - Agregação: `Transaction.aggregate()` agrupa por `category` e soma `amount`

---

### 📅 Agendamentos

1. **Vínculo com Funcionário**:
   - Salva `employee_id` e `employee_name` (snapshot)
   - Nome do funcionário copiado para o card do agendamento

2. **Status Padrão**: 
   - Todo agendamento novo nasce com status `"Pendente"`
   - Estados possíveis: Pendente, Confirmado, Concluído, Cancelado

3. **Dados do Cliente**:
   - Nome e telefone obrigatórios
   - Notas opcionais para observações

4. **Data e Hora**:
   - `scheduled_date` é Date
   - `scheduled_time` é String (formato "14:30")

---

### 🖼️ Upload de Imagens

1. **Multer Storage**:
   - Destino: `/public/uploads/`
   - Nome gerado: `{hash_aleatorio}-{nome_original}`
   - Previne conflitos de nomes

2. **Imagem Padrão**:
   - Se não houver upload → `image_url = "/img/default.png"`

3. **Atualização de Imagem**:
   - Ao editar produto, nova imagem sobrescreve a antiga (sem exclusão do arquivo antigo)

---

## 4️⃣ ESTRUTURA DE DADOS DO BANCO

### 📋 Modelo: **Store** (Lojas)
```
{
  _id: ObjectId (auto),
  name: String,           // Nome da loja
  email: String,          // Email único
  password: String,       // Senha simples (NÃO criptografada no Store)
  address: String,        // Endereço
  phone: String,          // Telefone
  cnpj: String            // CNPJ
}
```

### 🛍️ Modelo: **Product** (Produtos)
```
{
  _id: ObjectId (auto),
  store_id: ObjectId,     // Referência à loja (isolamento multitenant)
  name: String,           // Nome do produto
  category: String,       // Categoria (Ex: "Eletrônicos")
  description: String,    // Descrição detalhada
  price: Number,          // Preço atual
  current_stock: Number,  // Quantidade em estoque (padrão: 0)
  image_url: String,      // URL da imagem
  createdAt: Date,        // Data de criação (automático)
  updatedAt: Date         // Data de atualização (automático)
}
```

### 👤 Modelo: **Employee** (Funcionários)
```
{
  _id: ObjectId (auto),
  store_id: ObjectId,     // Referência à loja
  name: String,           // Nome completo
  email: String,          // Email único por loja
  password: String,       // Senha criptografada com bcrypt
  cargo: String,          // Cargo (padrão: "Operador de Estoque")
  createdAt: Date,        // Data de admissão (automático)
  updatedAt: Date         // Data de atualização (automático)
}
```

### 💳 Modelo: **Sale** (Vendas)
```
{
  _id: ObjectId (auto),
  store_id: ObjectId,     // Referência à loja
  product_id: ObjectId,   // Referência ao produto (para futuros relacionamentos)
  product_name: String,   // Snapshot: nome do produto na venda
  unit_price: Number,     // Snapshot: preço unitário no momento da venda
  quantity: Number,       // Quantidade vendida
  total_price: Number,    // Valor total (quantity × unit_price)
  payment_method: String, // Pix | Cartão de Crédito | Cartão de Débito | Dinheiro
  status: String,         // Padrão: "Concluída" (futuros: "Cancelada", "Reembolsada")
  notes: String,          // Anotações opcionais
  createdAt: Date,        // Data da venda (automático)
  updatedAt: Date         // Data de atualização (automático)
}
```

### 📦 Modelo: **StockMovement** (Movimentações de Estoque)
```
{
  _id: ObjectId (auto),
  store_id: ObjectId,     // Referência à loja
  product_id: ObjectId,   // Referência ao produto
  quantity: Number,       // Quantidade movimentada
  type: String,           // "in" (entrada) | "out" (saída)
  createdAt: Date,        // Data da movimentação (automático)
  updatedAt: Date         // Data de atualização (automático)
}
```

### 💸 Modelo: **Transaction** (Transações Financeiras)
```
{
  _id: ObjectId (auto),
  store_id: ObjectId,     // Referência à loja
  type: String,           // "income" (receita) | "expense" (despesa)
  description: String,    // Descrição textual
  category: String,       // Categoria (texto livre)
  amount: Number,         // Valor (mínimo: 0.01)
  createdAt: Date,        // Data do lançamento (automático)
  updatedAt: Date         // Data de atualização (automático)
}
```

### 📅 Modelo: **Schedule** (Agendamentos)
```
{
  _id: ObjectId (auto),
  employee_id: ObjectId,  // Referência ao funcionário
  employee_name: String,  // Snapshot: nome do funcionário
  scheduled_date: Date,   // Data do agendamento
  scheduled_time: String, // Hora do agendamento (Ex: "14:30")
  service_type: String,   // Tipo de serviço
  customer_name: String,  // Nome do cliente
  customer_phone: String, // Telefone do cliente
  notes: String,          // Observações opcionais
  status: String,         // Padrão: "Pendente" (Confirmado | Concluído | Cancelado)
  createdAt: Date,        // Data de criação (automático)
  updatedAt: Date         // Data de atualização (automático)
}
```

---

## 5️⃣ FLUXOS PRINCIPAIS DO SISTEMA

### 🔄 Fluxo de Registro de Loja
```
1. Usuário acessa GET /register
2. Preenche formulário (name, email, password, address, phone, cnpj)
3. POST /register/store
4. Sistema verifica se email já existe
5. Se não existe → cria Store no MongoDB
6. Redireciona para /login
7. Usuário faz login com email + password
```

### 🔄 Fluxo de Venda
```
1. Gerente acessa /dashboard/sales
2. Seleciona produto da lista
3. Insere quantidade + forma de pagamento
4. POST /dashboard/sales/create
5. Sistema valida:
   - Estoque suficiente?
   - Campos obrigatórios preenchidos?
6. Se OK:
   - Cria venda (com snapshot de preço)
   - Reduz estoque: product.current_stock -= qtd
   - Registra saída em StockMovement
7. Redireciona com sucesso
```

### 🔄 Fluxo de Gestão de Estoque
```
1. Gerente recebe mercadoria
2. Acessa /dashboard/stock
3. Seleciona produto → insere quantidade
4. POST /dashboard/stock/update
5. Sistema:
   - Aumenta estoque: product.current_stock += qtd
   - Registra entrada em StockMovement (type: "in")
6. Movimentação aparece no histórico

OU para ajuste manual:
   - POST /dashboard/stock/update/:id com nova quantidade
   - Define estoque direto (sem gerar movimentação)
```

### 🔄 Fluxo de Dashboard
```
1. Usuário autenticado acessa /dashboard
2. Sistema executa 8 agregações MongoDB em paralelo
3. Calcula KPIs:
   - Total de produtos
   - Produtos com estoque crítico
   - Faturamento total
   - Despesas por categoria
4. Prepara dados para gráficos:
   - Faturamento mensal (ano atual)
   - Despesas por categoria
5. Renderiza dashboard com todos os dados
```

---

## 6️⃣ VALIDAÇÕES E SEGURANÇA

### ✅ Validações Implementadas

| Entidade | Validação | Ação |
|----------|-----------|------|
| **Produto** | Preço ≥ 0 | Schema rejeita |
| **Produto** | Estoque ≥ 0 | Schema rejeita |
| **Venda** | Quantidade ≥ 1 | Schema rejeita |
| **Venda** | Estoque suficiente | Controller bloqueia |
| **Funcionário** | Email único por loja | Controller verifica |
| **Funcionário** | Todos campos obrigatórios | Controller valida |
| **Transação** | Amount > 0 | Controller valida |
| **Transação** | Tipo = income ou expense | Schema rejeita |
| **Estoque** | Quantidade ≥ 1 | Schema rejeita |

### 🔒 Segurança

1. **Isolamento de Dados**: Todas as queries incluem `store_id` filter
2. **Autenticação**: Session-based (não stateless)
3. **Hashing de Senha**: bcrypt com salt 10 para funcionários
4. **CSRF Protection**: Não implementada (Spring session não usa)
5. **SQL Injection**: Não aplicável (MongoDB)
6. **XSS**: Mitigado pelo Handlebars (escapa variáveis por padrão)

---

## 7️⃣ PERFORMANCE E OTIMIZAÇÕES

### Índices no MongoDB
- `Product`: índice em `store_id` (busca rápida de produtos da loja)
- `Employee`: índice em `store_id`
- `Sale`: índice em `store_id`
- `StockMovement`: índice em `store_id`
- `Transaction`: índice em `store_id`

### Aggregation Pipeline (Dashboard)
- Usa `.aggregate()` para somas e agrupamentos direto no banco
- Exemplo: `Total de vendas = Sale.aggregate([{$match}, {$group}, {$sum}])`
- Reduz transferência de dados (já vem agregado)

### `.lean()` em Queries
- Desativa o Mongoose para documentos "read-only"
- Usado em listagens para melhor performance

### Promise.all()
- Dashboard executa 8 queries em paralelo
- Reduz latência total em ~75%

---

## 8️⃣ PONTOS DE ATENÇÃO / DÍVIDAS TÉCNICAS

⚠️ **CRÍTICO**
- [ ] Senha da Store não é criptografada (varia "password != password" é plain-text)
- [ ] Sem Rate Limiting nas rotas de login/registro
- [ ] Sem validação de CNPJ no formato

⚠️ **IMPORTANTE**
- [ ] JWT é importado mas não utilizado
- [ ] Agendamentos não filtram por `store_id` (falta isolamento multitenant)
- [ ] Sem paginação em listagens (pode virar gargalo com muitos dados)
- [ ] Sem rollback transacional (se venda falhar após estoque reduzido)

⚠️ **BOM-PARA-TER**
- [ ] Soft delete (ao invés de deletar, marcar como deletado)
- [ ] Auditoria de quem criou/editou cada registro
- [ ] Backup automático
- [ ] Limite de tamanho de imagem (multer)

---

## 9️⃣ GLOSSÁRIO DE TERMOS

| Termo | Significado |
|-------|------------|
| **Store** | Loja/Gerenciador do sistema |
| **Multitenant** | Múltiplos clientes compartilhando a mesma aplicação (dados isolados) |
| **store_id** | ID único que identifica a loja no MongoDB |
| **Snapshot** | "Fotografia" de dados no momento da venda (preço imutável) |
| **Estoque Crítico** | Produtos com quantidade < 5 unidades |
| **KPI** | Indicador-chave de desempenho (Vendas, Produtos, Estoque, Despesas) |
| **Agregation** | Pipeline do MongoDB para processar/agrupar dados |
| **Lean Query** | Query Mongoose otimizada (sem wrapper Mongoose) |
| **bcrypt** | Algoritmo de hash seguro para senhas |
| **JWT** | JSON Web Token (autenticação stateless - não usado aqui) |

---

## 🔟 EXEMPLOS DE QUERIES COMUNS

### Buscar todos os produtos de uma loja
```javascript
Product.find({ store_id: lojaId }).lean()
```

### Calcular faturamento total
```javascript
Sale.aggregate([
  { $match: { store_id: lojaId } },
  { $group: { _id: null, total: { $sum: "$total_price" } } }
])
```

### Listar últimas 4 vendas
```javascript
Sale.find({ store_id: lojaId })
  .sort({ createdAt: -1 })
  .limit(4)
  .lean()
```

### Contar produtos com estoque baixo
```javascript
Product.countDocuments({
  store_id: lojaId,
  current_stock: { $lt: 5 }
})
```

### Agrupar despesas por categoria
```javascript
Transaction.aggregate([
  { $match: { store_id: lojaId, type: "expense" } },
  { $group: { _id: "$category", total: { $sum: "$amount" } } }
])
```

---

## 📞 CONTACTS RÁPIDOS DE DESENVOLVIMENTO

- **Porta Padrão**: 3000
- **Arquivo de Configuração**: `.env` (MONGO_URL)
- **Starter Command**: `npm start` (roda nodemon /index.js 3000)
- **Diretório de Uploads**: `/public/uploads/`
- **Diretório de Views**: `/src/views/`
- **Diretório de Controllers**: `/src/controllers/`
- **Diretório de Models**: `/src/models/`

---

**Última Atualização**: 3 de junho de 2026  
**Versão do Sistema**: 1.0.0  
**Análise Realizada Por**: GitHub Copilot AI Assistant
