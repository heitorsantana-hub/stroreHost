import mongoose from "mongoose";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Transaction from "../models/Transaction.js";
import StockMovement from "../models/StockMovement.js";

class DashboardController {
  async index(req, res) {
    try {
      // 🛡️ BARREIRA DE SEGURANÇA: Verificação rigorosa da sessão
      if (!req.session || !req.session.storeId) {
        console.warn("Acesso ao dashboard sem sessão válida");
        return res.redirect("/login?error=session_expired");
      }

      const storeId = req.session.storeId;

      // Validação adicional: garante que storeId é uma string válida
      if (typeof storeId !== "string" || storeId.trim() === "") {
        console.warn("StoreId inválido na sessão:", storeId);
        return res.redirect("/login?error=invalid_store");
      }

      let objectId;
      try {
        // Converte a string da sessão para um ObjectId real do MongoDB (Necessário para o Aggregate)
        objectId = new mongoose.Types.ObjectId(storeId);
      } catch (mongoError) {
        console.error("Erro ao converter storeId para ObjectId:", mongoError);
        return res.redirect("/login?error=invalid_store_format");
      }

      // 1. ALTA PERFORMANCE: Executa todas as buscas ao mesmo tempo!
      const [
        loja,
        produtosCount,
        estoqueBaixoCount,
        vendasAgrupadas,
        despesasAgrupadas,
        ultimasVendas,
        ultimasMovimentacoes,
        faturamentoMensalAgrupado,
      ] = await Promise.all([
        Store.findById(storeId).lean(), // Pega o nome da loja
        Product.countDocuments({ store_id: storeId }), // Conta todos os produtos
        Product.countDocuments({
          store_id: storeId,
          $expr: { $lte: ["$current_stock", "$min_stock"] },
        }), // Produtos quase esgotados

        // A Mágica do MongoDB: Soma todos os "total_price" de todas as vendas desta loja
        Sale.aggregate([
          { $match: { store_id: objectId } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),

        // A Mágica do MongoDB: Agrupa despesas por categoria
        Transaction.aggregate([
          { $match: { store_id: objectId, type: "expense" } },
          { $group: { _id: "$category", total: { $sum: "$amount" } } },
        ]),

        // Traz apenas as últimas 4 vendas ordenadas da mais recente para a mais antiga
        Sale.find({ store_id: storeId })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),

        // Traz apenas as últimas 4 movimentações de stock (populando o produto)
        StockMovement.find({ store_id: storeId })
          .populate("product_id")
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),

        // Agrupa faturamento por mês no ano corrente
        Sale.aggregate([
          {
            $match: {
              store_id: objectId,
              createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              total: { $sum: "$total_price" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      // 2. Processar os Totais Financeiros (Se a loja for nova e não tiver vendas, o aggregate retorna vazio)
      const totalVendas =
        vendasAgrupadas.length > 0 ? vendasAgrupadas[0].total : 0;
      const totalDespesas = despesasAgrupadas.reduce(
        (sum, item) => sum + item.total,
        0,
      );

      // Dados para o Gráfico de Despesas por Categoria (Pie/Doughnut)
      const categoriasDespesas = despesasAgrupadas.map(
        (d) => d._id || "Outros",
      );
      const valoresDespesas = despesasAgrupadas.map((d) => d.total);

      // Dados para o Gráfico de Faturamento por Mês (Area/Line)
      const faturamentoMesesValores = Array(12).fill(0);
      faturamentoMensalAgrupado.forEach((item) => {
        const mesIndex = item._id - 1;
        if (mesIndex >= 0 && mesIndex < 12) {
          faturamentoMesesValores[mesIndex] = item.total;
        }
      });
      const mesesNomes = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      const mesAtual = new Date().getMonth();
      const mesesLabelsExibir = mesesNomes.slice(0, Math.max(6, mesAtual + 1));
      const faturamentoValoresExibir = faturamentoMesesValores.slice(
        0,
        Math.max(6, mesAtual + 1),
      );

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
        mov.productName = mov.product_id
          ? mov.product_id.name
          : "Produto Removido";

        return mov;
      });

      // 5. Enviar o "Banquete" de Dados para o Handlebars renderizar o ecrã
      res.render("dashboard", {
        layout: "dashboard",
        storeId: storeId,

        kpiVendas: totalVendas.toFixed(2),
        kpiProdutos: produtosCount,
        kpiEstoqueBaixo: estoqueBaixoCount,
        kpiDespesas: totalDespesas.toFixed(2),
        ultimasVendas: vendasFormatadas,
        ultimasMovimentacoes: movimentosFormatados,
        activeDashboard: true,

        // Injeção de variáveis JSON para os gráficos
        labelsFaturamento: JSON.stringify(mesesLabelsExibir),
        dadosFaturamento: JSON.stringify(faturamentoValoresExibir),
        labelsDespesas: JSON.stringify(categoriasDespesas),
        dadosDespesas: JSON.stringify(valoresDespesas),
      });
    } catch (error) {
      console.error("❌ Erro grave ao carregar o Painel de Controlo:", error);

      // Não envia resposta se a resposta já foi iniciada
      if (!res.headersSent) {
        // Diferencia entre erros de sessão e erros internos
        if (
          error.message.includes("session") ||
          error.message.includes("storeId")
        ) {
          return res.redirect("/login?error=session_error");
        }
        res.status(500).render("error", {
          message:
            "Erro interno ao carregar o dashboard. Tente novamente mais tarde.",
          error: process.env.NODE_ENV === "development" ? error : {},
        });
      }
    }
  }

  // NOVO MÉTODO: Salva as configurações de cor e logo da loja
  async updateSettings(req, res) {
    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.redirect("/login?error=session_expired");

      const { primaryColor } = req.body;
      let updateData = { primaryColor };

      // Se o usuário fez upload de uma nova imagem de logo
      if (req.file) {
        updateData.logoUrl = `/uploads/${req.file.filename}`;
      }

      await Store.findByIdAndUpdate(storeId, updateData);

      // Redireciona de volta para o painel para ver as mudanças aplicadas na hora!
      return res.redirect("/dashboard");
    } catch (error) {
      console.error("❌ Erro ao salvar configurações da loja:", error);
      return res.redirect("/dashboard?error=settings_failed");
    }
  }
}

export default new DashboardController();
