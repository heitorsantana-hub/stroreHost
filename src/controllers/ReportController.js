import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Transaction from "../models/Transaction.js";
import StockMovement from "../models/StockMovement.js";

class ReportController {
  async getDashboardData(req, res) {
    // 🛡️ PROTEÇÃO EXTRA: Se a sessão cair, redireciona em vez de quebrar o servidor
    if (!req.session || !req.session.storeId) {
      return res.redirect("/login?error=session");
    }

    try {
      // 1. A CORREÇÃO DO ERRO: Criamos as duas versões do ID necessárias para o MongoDB
      const storeIdString = req.session.storeId;
      const objectId = new mongoose.Types.ObjectId(storeIdString);

      // ALTA PERFORMANCE: Executa todas as buscas ao mesmo tempo
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
        Store.findById(storeIdString).lean(),
        Product.countDocuments({ store_id: storeIdString }),
        Product.countDocuments({
          store_id: storeIdString,
          $expr: { $lte: ["$current_stock", "$min_stock"] },
        }),

        // Usando o 'objectId' perfeitamente instanciado
        Sale.aggregate([
          { $match: { store_id: objectId } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),

        Transaction.aggregate([
          { $match: { store_id: objectId, type: "expense" } },
          { $group: { _id: "$category", total: { $sum: "$amount" } } },
        ]),

        Sale.find({ store_id: storeIdString })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),

        StockMovement.find({ store_id: storeIdString })
          .populate("product_id")
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),

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

      // 2. Processar os Totais Financeiros
      const totalVendas =
        vendasAgrupadas.length > 0 ? vendasAgrupadas[0].total : 0;
      const totalDespesas = despesasAgrupadas.reduce(
        (sum, item) => sum + item.total,
        0,
      );

      // Dados para o Gráfico de Despesas
      const categoriasDespesas = despesasAgrupadas.map(
        (d) => d._id || "Outros",
      );
      const valoresDespesas = despesasAgrupadas.map((d) => d.total);

      // Dados para o Gráfico de Faturamento
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
        venda.data_formatada = `${dataObj.toLocaleDateString("pt-BR")} às ${dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
        venda.total_price = venda.total_price.toFixed(2);
        return venda;
      });

      // 4. Formatar os dados para o Feed de Stock
      const movimentosFormatados = ultimasMovimentacoes.map((mov) => {
        const dataObj = new Date(mov.createdAt);
        mov.data_formatada = `${dataObj.toLocaleDateString("pt-BR")} às ${dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
        mov.isEntrada = mov.type === "in";
        mov.tipo_texto = mov.type === "in" ? "Entrada" : "Saída";
        mov.productName = mov.product_id
          ? mov.product_id.name
          : "Produto Removido";
        return mov;
      });

      // 5. Cálculos Adicionais
      const topProdutos = await Sale.aggregate([
        { $match: { store_id: objectId } },
        {
          $group: { _id: "$product_name", totalVendido: { $sum: "$quantity" } },
        },
        { $sort: { totalVendido: -1 } },
        { $limit: 5 },
      ]);

      const faturamentoPagamento = await Sale.aggregate([
        { $match: { store_id: objectId } },
        { $group: { _id: "$payment_method", total: { $sum: "$total_price" } } },
      ]);

      // 6. Injeção Final para o Handlebars
      res.render("reports", {
        layout: "dashboard",
        topProdutos,
        kpiVendas: totalVendas.toFixed(2),
        kpiProdutos: produtosCount,
        kpiEstoqueBaixo: estoqueBaixoCount,
        kpiDespesas: totalDespesas.toFixed(2),
        faturamentoPagamento: JSON.stringify(faturamentoPagamento),
        ultimasVendas: vendasFormatadas,
        ultimasMovimentacoes: movimentosFormatados,
        labelsFaturamento: JSON.stringify(mesesLabelsExibir),
        dadosFaturamento: JSON.stringify(faturamentoValoresExibir),
        labelsDespesas: JSON.stringify(categoriasDespesas),
        dadosDespesas: JSON.stringify(valoresDespesas),
      });
    } catch (error) {
      console.error("Erro no Dashboard:", error);
      res.status(500).send("Erro interno ao carregar o painel.");
    }
  }

  async exportCsv(req, res) {
    const vendas = await Sale.find({ store_id: req.session.storeId }).lean();
    let csv = "ID,Produto,Quantidade,Total,Pagamento,Data\n";
    vendas.forEach((v) => {
      csv += `${v._id},${v.product_name},${v.quantity},${v.total_price},${v.payment_method},${v.createdAt}\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="vendas.csv"');
    res.send(csv);
  }

  async downloadReport(req, res) {
    const { relatorio } = req.body;
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="relatorio.pdf"',
    );
    doc.pipe(res);
    doc.fontSize(20).text("Relatório StoreHost", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(relatorio);
    doc.end();
  }

  // NOVO MÉTODO: Busca vendas de um dia específico via API (AJAX)
  async getDailySales(req, res) {
    try {
      const storeId = req.session.storeId;
      const { date } = req.query; // Espera o formato YYYY-MM-DD

      if (!storeId || !date) {
        return res.status(400).json({ error: "Faltam parâmetros." });
      }

      // Cria a margem de tempo: desde as 00:00:00 até às 23:59:59 do dia escolhido
      // O UTC-3 garante o fuso horário correto (Brasil)
      const startDate = new Date(`${date}T00:00:00-03:00`);
      const endDate = new Date(`${date}T23:59:59-03:00`);

      const vendasDoDia = await Sale.find({
        store_id: storeId,
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: -1 })
        .lean();

      // Formata os dados para devolver uma resposta limpa ao Front-end
      const vendasFormatadas = vendasDoDia.map((v) => {
        const dataObj = new Date(v.createdAt);
        return {
          hora: dataObj.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          product_name: v.product_name,
          quantity: v.quantity,
          total_price: v.total_price.toFixed(2),
          payment_method: v.payment_method,
        };
      });

      return res.status(200).json(vendasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar vendas diárias:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
}

export default new ReportController();
