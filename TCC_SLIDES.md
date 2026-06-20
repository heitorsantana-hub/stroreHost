# 🎓 Estrutura de Slides para Apresentação do TCC: StoreHost

Este documento serve como um roteiro e script completo para você desenvolver seus slides (no PowerPoint, Canva ou Google Slides) e treinar sua fala para a apresentação do seu **Trabalho de Conclusão de Curso (TCC)**.

---

## 📋 Resumo Estratégico da Apresentação
* **Tempo sugerido:** 15 a 20 minutos (média de 1.5 a 2 minutos por slide).
* **Tom da apresentação:** Técnico, profissional e focado em problemas reais de mercado resolvidos por engenharia de software e inovação (Inteligência Artificial).
* **Dica de Ouro:** Não leia os slides. Use os tópicos dos slides como apoio visual e guie-se pelo **Roteiro de Fala** abaixo para falar com segurança.

---

## 🖥️ Roteiro Slide a Slide

### Slide 1: Capa da Apresentação
* **Título do Slide:** StoreHost 🏪: Plataforma Multi-tenant de Gestão e ERP Integrada com Inteligência Artificial para Micro e Pequenos Empreendimentos
* **Foco Visual:** Logo da instituição, seu nome, nome do orientador e um mockup do sistema (pode usar o print de `public/mockup.png` ou uma foto da tela do dashboard principal).
* **Tópicos no Slide:**
  * Nome do Aluno: [Seu Nome Completo]
  * Orientador(a): [Nome do Orientador]
  * Curso: [Seu Curso - ex: Engenharia de Software / Análise e Desenvolvimento de Sistemas]
  * Ano: 2026
* **🎙️ Roteiro de Fala:**
  > "Cumprimento a banca examinadora, meu orientador e a todos os presentes. Meu nome é [Seu Nome], e hoje apresentarei meu Trabalho de Conclusão de Curso intitulado 'StoreHost: Plataforma Multi-tenant de Gestão e ERP Integrada com Inteligência Artificial para Micro e Pequenos Empreendimentos'. Este projeto propõe uma solução moderna para a digitalização e otimização de pequenos negócios através de recursos inteligentes de software."
* **💡 Dica para a Banca:** Mantenha a postura ereta, faça contato visual com os avaliadores e fale pausadamente para demonstrar calma desde o primeiro segundo.

---

### Slide 2: Contextualização e O Problema
* **Título do Slide:** O Cenário dos Pequenos Negócios & Desafios
* **Foco Visual:** Elementos gráficos simples (ícones) mostrando: Planilhas complexas ❌, ERPs Caros ❌, Falta de Dados Estratégicos ❌.
* **Tópicos no Slide:**
  * **Complexidade Operacional:** Pequenos lojistas usam controles descentralizados (papel, planilhas) sujeitos a erros humanos.
  * **Barreira de Entrada Financeira:** Sistemas ERP robustos do mercado possuem custos proibitivos para novos empreendedores.
  * **Análise de Dados Limitada:** Proprietários não sabem interpretar relatórios financeiros complexos para tomar decisões.
  * **Centralização de Franquias:** Dificuldade em gerenciar múltiplos pontos de venda com isolamento seguro de dados.
* **🎙️ Roteiro de Fala:**
  > "No Brasil, as micro e pequenas empresas representam a maior parte dos negócios ativos, mas sofrem com alta taxa de mortalidade nos primeiros anos. Um dos motivos é a falha na gestão administrativa. Os empreendedores costumam utilizar controles ineficientes, como planilhas ou papel. Quando tentam migrar para sistemas ERP, enfrentam duas barreiras: o alto custo de licenças multi-lojas e a complexidade técnica das interfaces, que geram gráficos difíceis de interpretar sem um conhecimento prévio de contabilidade."
* **💡 Dica para a Banca:** Enfatize que o problema não é apenas a falta de um sistema, mas a *usabilidade* e o *custo* das soluções atuais.

---

### Slide 3: A Solução Proposta
* **Título do Slide:** Proposta do Projeto: StoreHost
* **Foco Visual:** Três pilares ilustrados: 1. Acesso Simples (Web Responsivo) 📱; 2. Arquitetura Isolada (Multi-tenant) 🔐; 3. Consultor IA Nativo (Insights de Negócios) ✨.
* **Tópicos no Slide:**
  * **Painel Integrado (All-in-One):** Controle de produtos, auditoria de estoque, histórico de vendas (PDV), fluxo de caixa e agenda de serviços no mesmo lugar.
  * **Arquitetura Multilojas (Multi-tenant):** Única infraestrutura de banco de dados capaz de hospedar centenas de lojas com isolamento físico/lógico completo.
  * **Inteligência Artificial Nativa:** Integração direta com IA Generativa para atuar como um coach de negócios baseado em dados reais da empresa.
  * **Interface Premium & Minimalista:** Desenvolvido focando na usabilidade rápida, reduzindo a necessidade de treinamentos complexos.
* **🎙️ Roteiro de Fala:**
  > "Como resposta a esse problema, desenvolvi o StoreHost. Trata-se de uma plataforma web completa que unifica as rotinas essenciais de uma empresa: o controle de estoque, o fluxo financeiro de entradas e despesas, o ponto de vendas físico e a agenda de prestação de serviços. O sistema se destaca em dois pontos cruciais: a arquitetura multi-tenant, permitindo que uma mesma infraestrutura atenda a múltiplos lojistas de forma isolada, e a presença de uma inteligência artificial que lê o contexto de faturamento do lojista e sugere ações estratégicas."

---

### Slide 4: Arquitetura de Software e Tecnologias
* **Título do Slide:** Arquitetura do Sistema e Stack Tecnológica
* **Foco Visual:** O diagrama simplificado do fluxo MVC (use o diagrama de fluxo do item 2 do `README.md`).
* **Tópicos no Slide:**
  * **Backend:** Node.js (ambiente de execução assíncrono) com framework Express.js.
  * **Frontend:** Engine de templates Express Handlebars com Javascript nativo (Vanilla CSS + Bootstrap 5).
  * **Banco de Dados:** MongoDB (NoSQL) orientado a documentos, gerenciado via Mongoose ODM.
  * **Serviços de IA:** REST API integrada ao Google Gemini (Modelo 2.5/3.5 Flash).
  * **Padrão de Projeto:** MVC (Model-View-Controller) com rotas modulares protegidas por sessões seguras.
* **🎙️ Roteiro de Fala:**
  > "Para garantir que o StoreHost seja performático e fácil de manter, adotei uma arquitetura limpa sob o padrão Model-View-Controller (MVC). No backend, utilizamos Node.js com Express e ES Modules. A persistência de dados é feita no MongoDB Atlas através do Mongoose ODM. Optamos por um banco NoSQL pela flexibilidade de alteração de esquemas à medida que novas features são adicionadas. Para a interface, escolhemos Handlebars para renderização no servidor, agilizando o carregamento de páginas críticas, estilizada com CSS Vanilla e componentes do Bootstrap 5 para responsividade móvel."

---

### Slide 5: Modelagem de Dados & Multi-tenancy
* **Título do Slide:** Modelo Entidade-Relacionamento e Isolamento de Dados
* **Foco Visual:** Diagrama de tabelas do banco de dados (use o diagrama Mermaid de Banco de Dados do item 4 do `README.md`).
* **Tópicos no Slide:**
  * **Isolamento por Identificador (`store_id`):** O documento da loja (`Store`) funciona como a raiz. Todos os outros registros possuem referência direta indexada a ela.
  * **Rastreabilidade:** Logs automáticos de alteração de estoque (`StockMovement`) vinculados ao `product_id`.
  * **Segurança na Sessão:** Validação em nível de servidor. Rotas bloqueadas exigem `storeId` válido armazenado em `req.session`.
* **🎙️ Roteiro de Fala:**
  > "Um dos principais desafios técnicos de sistemas multilojas é garantir que uma empresa nunca acesse ou veja os dados de outra. No StoreHost, resolvemos isso no modelo de dados. Cada documento cadastrado no banco — seja produto, venda, transação financeira ou funcionário — carrega obrigatoriamente a propriedade 'store_id' como referência ao ID da loja no MongoDB. Esse campo possui um índice de busca indexado, o que otimiza as queries e garante que toda requisição ao banco filtre apenas o escopo da loja autenticada na sessão do servidor."
* **💡 Dica para a Banca:** A banca adora aspectos de segurança em bancos de dados. Explicar como o `store_id` com índice evita vazamento de dados é um excelente ponto de defesa.

---

### Slide 6: Funcionalidades em Destaque: PDV e Estoque
* **Título do Slide:** Engenharia de Dados: Integridade no PDV e Auditoria de Estoque
* **Foco Visual:** Exemplo visual do fluxo de compra: Produto (Nome Antigo/Preço Velho) ➔ Venda Realizada (Snapshot Gravado) ➔ Produto Editado (Novos Valores) ➔ Venda Antiga Inalterada.
* **Tópicos no Slide:**
  * **Snapshot de Vendas:** Cópia estática do preço e nome do produto no momento do checkout, evitando inconsistências históricas por edições posteriores.
  * **Auditoria de Estoque Ativa:** Criação automática de movimentações (`StockMovement`) vinculando entradas (`in`) e saídas (`out`) a cada transação ou ajuste manual.
  * **Proteção de Integridade:** Validações de backend que impedem estoque negativo ou valores inválidos de vendas.
* **🎙️ Roteiro de Fala:**
  > "Gostaria de destacar dois padrões de engenharia aplicados no módulo de Vendas e Estoque. O primeiro é o padrão de 'Snapshot de Venda'. Em sistemas comuns, se um produto muda de preço ou é excluído, o histórico de vendas passado pode ser corrompido. No StoreHost, quando uma venda é efetuada, nós copiamos o nome e o preço unitário do produto e gravamos de forma estática no documento da venda. O segundo é a auditoria de estoque ativa: qualquer entrada de mercadoria ou saída pelo caixa dispara um gatilho de transação que atualiza o saldo e gera um log auditável em outra coleção do banco, impedindo inconsistências ou estoque negativo."

---

### Slide 7: O Diferencial Tecnológico: StoreHost AI
* **Título do Slide:** StoreHost AI: Consultoria Baseada em Contexto Híbrido
* **Foco Visual:** Ilustração do fluxo de prompt:
  `[Dados da Loja no DB (Faturamento/Estoque)] + [Mensagem do Usuário] ➔ Gemini API ➔ Resposta Estratégica Customizada.`
* **Tópicos no Slide:**
  * **Contextualização em Tempo Real:** A IA recebe a contagem de produtos e o faturamento total bruto da loja diretamente do MongoDB.
  * **Integração com Gemini API:** Uso do modelo Gemini Flash para geração rápida de texto com baixo consumo de memória.
  * **Comunicação Segura:** Chave de API protegida em variáveis de ambiente (`.env`) no servidor, sem exposição no cliente.
  * **Interface Integrada:** Widget de chat flutuante de fácil acesso.
* **🎙️ Roteiro de Fala:**
  > "O grande diferencial competitivo deste projeto é a integração da inteligência artificial. Criamos o StoreHost AI. Diferente de um chatbot genérico, nossa integração com a API do Gemini faz uma busca prévia no banco de dados da loja do usuário no momento do clique. O servidor calcula em paralelo o faturamento total acumulado e a quantidade de itens em estoque. Esses dados reais alimentam o prompt da IA nos bastidores de forma invisível. Assim, se o usuário pergunta 'Como posso melhorar minhas vendas?', a IA sabe exatamente o tamanho da loja dele e o seu faturamento atual, oferecendo uma resposta totalmente personalizada e viável para o negócio."
* **💡 Dica para a Banca:** Explique que essa abordagem reduz alucinações da IA e resolve o problema de o microempreendedor não saber usar engenharia de prompt, pois o sistema constrói o prompt ideal por ele.

---

### Slide 8: Otimização de Performance e Segurança
* **Título do Slide:** Performance de Carregamento e Segurança de Acesso
* **Foco Visual:** Ícones de Performance (Promise.all) e Segurança (Bcrypt + Express Sessions).
* **Tópicos no Slide:**
  * **Paralelismo no Banco de Dados (`Promise.all`):** Carregamento do dashboard principal executa 8 consultas assíncronas concorrentes ao MongoDB, diminuindo o tempo de resposta do servidor.
  * **Criptografia Unidirecional (Bcrypt):** Armazenamento de senhas via hashes seguros e salgados de alta complexidade.
  * **Gerenciamento de Sessões:** Uso de cookies de sessão assinados para controle de login no lado do servidor, evitando exposição de dados sensíveis no localStorage do navegador.
* **🎙️ Roteiro de Fala:**
  > "Sob a ótica de desempenho, o carregamento do Dashboard consome dados de várias coleções do banco. Para evitar gargalos e requisições sequenciais lentas, aplicamos o paralelismo de Promises do Javascript. Usando 'Promise.all', o servidor dispara e processa as 8 consultas críticas ao MongoDB em paralelo, reduzindo drasticamente o tempo de resposta. Em termos de segurança, nenhuma credencial de acesso é armazenada em texto limpo. Utilizamos a biblioteca Bcrypt com 10 rounds de salt para criptografar as senhas e gerenciamos a autenticação por sessões assinadas no backend, protegendo o usuário de ataques comuns na web."

---

### Slide 9: Demonstração Prática (Live Demo ou Telas)
* **Título do Slide:** Demonstração Prática do Sistema StoreHost
* **Foco Visual:** Galeria de capturas de tela do sistema ou um vídeo curto mostrando o sistema em execução (Cadastro de Produtos, Dashboard de Vendas, Chat com IA, Agenda de Serviços).
* **Tópicos no Slide:**
  * Fluxo de Criação de Loja (Multi-tenant).
  * Painel de Controle Consolidado com Gráficos Financeiros.
  * Ponto de Venda e Dedução Automática de Estoque.
  * Interação ao Vivo com o Assistente de IA.
  * Módulo de Agenda estilo Apple Calendar.
* **🎙️ Roteiro de Fala:**
  > "Agora realizarei uma demonstração prática do fluxo de trabalho no StoreHost. Mostrarei a criação de uma nova loja, o cadastro de um produto com upload de imagem, a realização de uma venda pelo PDV com atualização em tempo real dos gráficos financeiros e, por fim, uma pergunta direta ao assistente StoreHost AI sobre a saúde financeira do negócio demonstrado."
* **💡 Dica para a Banca:** Se for fazer live demo, certifique-se de que o servidor local está rodando e teste o fluxo duas vezes antes da apresentação. Caso não queira arriscar, coloque prints sequenciais de alta qualidade ou um vídeo pré-gravado no slide.

---

### Slide 10: Conclusões e Trabalhos Futuros
* **Título do Slide:** Considerações Finais e Evolução do Projeto
* **Foco Visual:** Lista de conquistas e próximas metas de desenvolvimento.
* **Tópicos no Slide:**
  * **Metas Alcançadas:** Implementação de isolamento multi-tenant estável, dashboard ágil, PDV íntegro e inteligência de negócios integrada e funcional.
  * **Evoluções Futuras (Roadmap):**
    * Aplicativo Mobile nativo para uso offline (PDV Offline com sincronização posterior).
    * Integração com impressoras térmicas de cupons fiscais.
    * Geração de relatórios contábeis automatizados assinados digitalmente.
* **🎙️ Roteiro de Fala:**
  > "Concluindo, o StoreHost atingiu plenamente seus objetivos. Conseguimos criar uma plataforma de ERP viável, performática, fácil de usar e que realmente apoia o empreendedor através da IA. A arquitetura multi-tenant provou-se estável e econômica em recursos de servidor. Como trabalhos futuros, planejamos o desenvolvimento de um módulo de PDV com suporte offline para evitar paradas na operação do lojista caso falte internet, além da homologação com impressoras térmicas e a integração nativa com emissão de notas fiscais eletrônicas."

---

### Slide 11: Agradecimentos
* **Título do Slide:** Obrigado! / Perguntas da Banca
* **Foco Visual:** Frase de agradecimento, seus dados de contato (E-mail, LinkedIn, Link do GitHub) e a mensagem "Dúvidas e Considerações".
* **Tópicos no Slide:**
  * Contato: [Seu E-mail]
  * GitHub: [Link do Repositório GitHub]
  * Agradecimento especial à banca examinadora e ao orientador.
* **🎙️ Roteiro de Fala:**
  > "Gostaria de expressar meu agradecimento à banca examinadora pela leitura atenta e contribuições para este trabalho, e ao meu orientador pelo suporte ao longo deste projeto. O código completo e a documentação estão disponíveis no meu repositório do GitHub. Fico à disposição da banca para responder às perguntas e ouvir as considerações finais. Muito obrigado."

---

## 🛠️ Como preparar-se para as perguntas comuns da banca

Aqui estão as 3 perguntas mais prováveis que a banca pode fazer sobre o seu projeto e como você deve respondê-las técnica e conceitualmente:

### 1. "Como você garante que o faturamento de uma loja não vaze para outra na chamada do chat da Inteligência Artificial?"
* **Resposta ideal:** 
  > "A chamada para o chat da IA passa pelo middleware de autenticação no backend. O controlador `SessionAIFeedback` não confia em dados enviados pelo frontend; ele lê o `storeId` diretamente da sessão assinada no servidor (`req.session.storeId`). Com esse ID, fazemos as agregações de faturamento e contagem de produtos no banco. A chave da API do Gemini fica no servidor `.env`, e os dados da loja só são anexados ao prompt após a autenticação segura. O frontend nunca tem acesso a esses dados agregados diretamente e nem à chave de API."

### 2. "Por que você escolheu o MongoDB em vez de um banco de dados relacional como PostgreSQL para um ERP, que por natureza é muito relacional?"
* **Resposta ideal:** 
  > "Escolhemos o MongoDB pela flexibilidade de esquema e facilidade de escala horizontal. Em um ambiente de microempresas, os atributos de produtos podem variar muito (um pet shop precisa de campos diferentes de uma loja de roupas). Com o MongoDB, podemos gerenciar esquemas flexíveis sem migrations complexas. A integridade relacional entre as coleções (como venda e produto) é garantida na camada de aplicação utilizando o Mongoose ODM com validações estritas de schema no backend."

### 3. "Se você usar o Promise.all e uma das 8 requisições falhar, o dashboard inteiro quebra. Como você contorna isso?"
* **Resposta ideal:** 
  > "Na versão atual, o dashboard usa o `Promise.all` clássico para garantir que todos os dados essenciais carreguem juntos, pois um KPI depende do outro para a correta visualização da saúde financeira. No entanto, para aumentar a resiliência, podemos migrar para o `Promise.allSettled`, tratando individualmente eventuais falhas em consultas não críticas (como o feed de auditoria) sem bloquear a renderização dos blocos principais de faturamento e vendas."
