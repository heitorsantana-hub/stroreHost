import mongoose from "mongoose";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Transaction from "../models/Transaction.js";
import StockMovement from "../models/StockMovement.js";

class DashboardController {
  async index(req, res) {
    try {
      const storeId = req.session.storeId;

      // Proteção de Rota
      if (!storeId) {
        return res.redirect("/login");
      }

      // Converte a string da sessão para um ObjectId real do MongoDB (Necessário para o Aggregate)
      const objectId = new mongoose.Types.ObjectId(storeId);

      // 1. ALTA PERFORMANCE: Executa todas as buscas ao mesmo tempo!
      const [
        loja,
        produtosCount,
        estoqueBaixoCount,
        vendasAgrupadas,
        despesasAgrupadas,
        ultimasVendas,
        ultimasMovimentacoes,
      ] = await Promise.all([
        Store.findById(storeId).lean(), // Pega o nome da loja
        Product.countDocuments({ store_id: storeId }), // Conta todos os produtos
        Product.countDocuments({
          store_id: storeId,
          current_stock: { $lt: 5 },
        }), // Produtos quase esgotados

        // A Mágica do MongoDB: Soma todos os "total_price" de todas as vendas desta loja
        Sale.aggregate([
          { $match: { store_id: objectId } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),

        // A Mágica do MongoDB: Soma todos os "amount" de transações que sejam "expense" (saídas)
        Transaction.aggregate([
          { $match: { store_id: objectId, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        // Traz apenas as últimas 4 vendas ordenadas da mais recente para a mais antiga
        Sale.find({ store_id: storeId })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),

        // Traz apenas as últimas 4 movimentações de stock
        StockMovement.find({ store_id: storeId })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),
      ]);

      // 2. Processar os Totais Financeiros (Se a loja for nova e não tiver vendas, o aggregate retorna vazio)
      const totalVendas =
        vendasAgrupadas.length > 0 ? vendasAgrupadas[0].total : 0;
      const totalDespesas =
        despesasAgrupadas.length > 0 ? despesasAgrupadas[0].total : 0;

      // 3. Formatar os dados para a Tabela de Vendas
      const vendasFormatadas = ultimasVendas.map((venda) => {
        const dataObj = new Date(venda.createdAt);
        // Formata a data e hora (Ex: 22/02/2026 às 14:30)
        venda.data_formatada = `${dataObj.toLocaleDateString("pt-PT")} às ${dataObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`;

        // Garante que o valor terá sempre duas casas decimais
        venda.total_price = venda.total_price.toFixed(2);
        return venda;
      });

      // 4. Formatar os dados para o Feed de Stock
      const movimentosFormatados = ultimasMovimentacoes.map((mov) => {
        const dataObj = new Date(mov.createdAt);
        mov.data_formatada = `${dataObj.toLocaleDateString("pt-PT")} às ${dataObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`;

        // Cria as variáveis que o Handlebars precisa para pintar a bolinha de Verde ou Vermelho
        mov.isEntrada = mov.type === "in";
        mov.tipo_texto = mov.type === "in" ? "Entrada" : "Saída";

        return mov;
      });

      // 5. Enviar o "Banquete" de Dados para o Handlebars renderizar o ecrã
      res.render("dashboard", {
        // Altere "index" para o nome exato do seu ficheiro .hbs do dashboard
        layout: "dashboard",
        storeName: loja ? loja.name : "Minha Loja",
        kpiVendas: totalVendas.toFixed(2),
        kpiProdutos: produtosCount,
        kpiEstoqueBaixo: estoqueBaixoCount,
        kpiDespesas: totalDespesas.toFixed(2),
        ultimasVendas: vendasFormatadas,
        ultimasMovimentacoes: movimentosFormatados,
      });
    } catch (error) {
      console.log("Erro grave ao carregar o Painel de Controlo:", error);
      res.send("Erro interno ao carregar o dashboard.");
    }
  }
}

export default new DashboardController();
