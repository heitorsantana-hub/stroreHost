// controllers/AiController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Modelo rápido e barato

      const result = await model.generateContent(prompt);
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
}

export default new AiController();
