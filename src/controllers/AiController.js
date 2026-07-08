// controllers/AiController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Store from "../models/Store.js";

// --- FUNÇÕES AUXILIARES PARA LIDAR COM O ERRO 429 ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(
  model,
  prompt,
  retries = 3,
  initialDelay = 9000,
) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Tenta fazer a requisição para o Gemini
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      // Verifica se é o erro 429 (Too Many Requests) e se ainda temos tentativas
      if (error.status === 429 && attempt < retries - 1) {
        console.warn(
          `⏳ Cota excedida (Erro 429). Aguardando ${initialDelay / 1000}s antes da tentativa ${attempt + 2}...`,
        );
        await delay(initialDelay);
        initialDelay *= 1.5; // Aumenta o tempo em 50% para a próxima tentativa, se falhar de novo
      } else {
        // Se for outro erro (ex: falha de rede) ou acabaram as tentativas, repassa o erro
        throw error;
      }
    }
  }
}
// ----------------------------------------------------

class AiController {
  async generateReport(req, res) {
    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.status(401).json({ error: "Sessão inválida" });

      // 1. Coletando os dados reais do banco para dar contexto à IA
      const objectId = new mongoose.Types.ObjectId(storeId);

      // Busca produtos com estoque crítico (atual <= mínimo)
      const produtosCriticos = await Product.find({
        store_id: storeId,
        $expr: { $lte: ["$current_stock", "$min_stock"] },
      }).lean();

      // Calcula faturamento total
      const vendasTotais = await Sale.aggregate([
        { $match: { store_id: objectId } },
        { $group: { _id: null, total: { $sum: "$total_price" } } },
      ]);
      const faturamento = vendasTotais.length > 0 ? vendasTotais[0].total : 0;

      // 2. Montando o "Prompt" (A mensagem secreta que a IA vai ler)
      let listaCritica = produtosCriticos
        .map((p) => `- ${p.name} (Restam: ${p.current_stock})`)
        .join("\n");
      if (!listaCritica)
        listaCritica = "Nenhum produto em falta! Estoque perfeito.";

      const prompt = `
        Você é um consultor de negócios sênior analisando um sistema de gestão.
        Aqui estão os dados atuais da loja:
        - Faturamento total acumulado: R$ ${faturamento.toFixed(2)}
        - Produtos com estoque crítico (precisam de reposição urgente):
        ${listaCritica}

        Escreva um relatório curto, motivacional e direto (máximo de 3 parágrafos).
        Comece com um cumprimento amigável.
        Destaque os produtos que precisam de atenção.
        Dê uma dica rápida de negócio para aumentar as vendas ou gerir o estoque.
        Não use formatação complexa, apenas negritos se necessário.
      `;

      // 3. Chamando a IA do Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1 .5-flash" }); // Modelo rápido e barato

      // ✅ Usando a nova função com Retry em vez de model.generateContent direto
      const result = await generateWithRetry(model, prompt);
      const response = await result.response;
      const relatorioTexto = response.text();

      // 4. Devolvendo para o Front-end
      return res.status(200).json({ relatorio: relatorioTexto });
    } catch (error) {
      console.error("Erro ao gerar relatório com IA:", error);
      return res
        .status(500)
        .json({ error: "A IA não conseguiu processar os dados agora." });
    }
  }

  async downloadReport(req, res) {
    try {
      const { relatorio } = req.body;

      // Cria o documento PDF
      const doc = new PDFDocument({ margin: 50 });

      // Configura o cabeçalho para forçar o download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="relatorio.pdf"',
      );

      // Pipe o documento para a resposta
      doc.pipe(res);

      // Adiciona conteúdo
      doc.fontSize(20).text("Relatorio StoreHost", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(relatorio);

      // Finaliza o documento
      doc.end();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      res.status(500).send("Erro ao gerar PDF");
    }
  }

  async generateDiagnostic(req, res) {
    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.status(401).json({ error: "Sessão inválida" });

      const { segmento, ticket, cidade, funcionarios } = req.body;

      const prompt = `
        Aja como um consultor de negócios especialista em micro e pequenas empresas.
        Faça um diagnóstico rápido, estratégico e acolhedor (máximo de 2 parágrafos) para uma loja com o seguinte perfil:
        - Segmento: ${segmento}
        - Ticket Médio: R$ ${ticket}
        - Cidade: ${cidade}
        - Número de Funcionários: ${funcionarios}
        
        No final, dê uma dica prática e acionável de gestão ou vendas para este cenário específico.
      `;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // ✅ Usando a nova função com Retry em vez de model.generateContent direto
      const result = await generateWithRetry(model, prompt);
      const diagnosticText = result.response.text();

      // Guarda no banco de dados e marca o onboarding como concluído
      await Store.findByIdAndUpdate(storeId, {
        onboardingCompleted: true,
        diagnostic: diagnosticText,
      });

      return res
        .status(200)
        .json({ success: true, diagnostic: diagnosticText });
    } catch (error) {
      console.error("Erro ao gerar diagnóstico:", error);
      return res
        .status(500)
        .json({ error: "A IA não conseguiu processar os dados." });
    }
  }

  async generateCockpit(req, res) {
    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.status(401).json({ error: "Sessão inválida" });

      const objectId = new mongoose.Types.ObjectId(storeId);

      // 1. MOTOR DE REGRAS E CÁLCULOS (Task 5)
      // Pegamos os produtos com menos de 15 unidades no estoque
      const produtosAbaixo = await Product.find({
        store_id: storeId,
        current_stock: { $lt: 15 },
      })
        .select("name current_stock")
        .limit(3)
        .lean();

      // Somamos o faturamento total da loja
      const vendasTotais = await Sale.aggregate([
        { $match: { store_id: objectId } },
        {
          $group: {
            _id: null,
            total: { $sum: "$total_price" },
            qtd: { $sum: 1 },
          },
        },
      ]);
      const faturamento = vendasTotais.length > 0 ? vendasTotais[0].total : 0;
      const qtdVendas = vendasTotais.length > 0 ? vendasTotais[0].qtd : 0;

      const dadosCrus = `
        Faturamento Total: R$ ${faturamento.toFixed(2)}
        Quantidade de Vendas Realizadas: ${qtdVendas}
        Produtos perto de zerar: ${produtosAbaixo.map((p) => `${p.name} (${p.current_stock} un)`).join(", ") || "Nenhum"}
      `;

      // 2. PROMPT HÍBRIDO DO GEMINI (Task 6)
      const prompt = `
        Analise os dados crus desta loja:
        ${dadosCrus}

        Atue como um sistema de alertas proativos. Gere 3 alertas curtos, diretos e urgentes (máximo de 12 palavras cada).
        Responda EXATAMENTE neste formato JSON, sem marcações markdown ou blocos de código, apenas o JSON puro:
        {
          "alerta_estoque": "texto do alerta focado em repor produtos",
          "alerta_financeiro": "texto do alerta focado no faturamento",
          "alerta_vendas": "texto do alerta focado na quantidade de vendas ou motivação"
        }
      `;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // ✅ Usando a nova função com Retry em vez de model.generateContent direto
      const result = await generateWithRetry(model, prompt);
      let text = result.response.text();

      // Limpeza de segurança caso a IA coloque blocos ```json
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const alertasJSON = JSON.parse(text);

      return res.status(200).json(alertasJSON);
    } catch (error) {
      console.error("Erro no Cockpit IA:", error);
      // Fallback seguro caso a IA falhe, o sistema não quebra
      return res.status(200).json({
        alerta_estoque: "Verifique seus produtos com baixo estoque.",
        alerta_financeiro: "Acompanhe seu faturamento na aba de Relatórios.",
        alerta_vendas: "Continue registrando suas vendas diárias!",
      });
    }
  }
}

export default new AiController();
