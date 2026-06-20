import mongoose from "mongoose";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Transaction from "../models/Transaction.js";

class SessionAIFeedback {
  async postChat(req, res) {
    try {
      const storeId = req.session.storeId;
      const { message } = req.body; // A mensagem que o usuário digitou no chat

      if (!storeId) return res.status(401).json({ error: "Não autenticado." });
      if (!message) return res.status(400).json({ error: "Mensagem vazia." });

      const objectId = new mongoose.Types.ObjectId(storeId);

      // Busca rápida para dar contexto à IA (você pode otimizar isso depois)
      const [loja, produtosCount, vendasAgrupadas] = await Promise.all([
        Store.findById(storeId).lean(),
        Product.countDocuments({ store_id: storeId }),
        Sale.aggregate([
          { $match: { store_id: objectId } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
      ]);

      const totalVendas =
        vendasAgrupadas.length > 0 ? vendasAgrupadas[0].total : 0;
      const lojaNome = loja ? loja.name : "Minha Loja";
      const apiKey = process.env.GEMINI_API_KEY;

      // O Novo Prompt Híbrido (Contexto da Loja + Pergunta do Usuário)
      const prompt = `Você é o assistente virtual inteligente da plataforma StoreHost, ajudando o dono da loja "${lojaNome}".
      Contexto atual da loja: Faturamento R$ ${totalVendas.toFixed(2)}, Total de Produtos: ${produtosCount}.
      
      Regras: Responda de forma amigável, direta e curta (máximo de 3 parágrafos).
      
      Pergunta do usuário: "${message}"`;

      // Chamada ao Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const data = await response.json();
      const feedbackText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      return res.status(200).json({ reply: feedbackText.trim() });
    } catch (error) {
      console.error("Erro no Chat da IA:", error.message);
      if (error.message.includes("429")) {
        return res
          .status(429)
          .json({
            reply:
              "Estou pensando em muitas coisas agora! Aguarde um minutinho e mande a mensagem de novo.",
          });
      }
      return res
        .status(500)
        .json({ reply: "Tive um pequeno curto-circuito. Pode repetir?" });
    }
  }
}

export default new SessionAIFeedback();
