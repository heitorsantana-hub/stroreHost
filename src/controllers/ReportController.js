import PDFDocument from "pdfkit";
import Sale from "../models/Sale.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

class ReportController {
  async getDashboardData(req, res) {
    const storeId = new mongoose.Types.ObjectId(req.session.storeId);

    // Exemplo: Produto que mais vendeu no mês (agregando por nome do produto)
    const topProdutos = await Sale.aggregate([
      { $match: { store_id: storeId } },
      { $group: { _id: "$product_name", totalVendido: { $sum: "$quantity" } } },
      { $sort: { totalVendido: -1 } },
      { $limit: 5 },
    ]);

    // Exemplo: Faturamento por tipo de pagamento
    const faturamentoPagamento = await Sale.aggregate([
      { $match: { store_id: storeId } },
      { $group: { _id: "$payment_method", total: { $sum: "$total_price" } } },
    ]);

    res.render("reports", {
      layout: "dashboard",
      topProdutos,
      faturamentoPagamento,
    });
  }

  // Lógica de exportação CSV
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

  // Se for usar o PDF, o método ficaria assim:
  async downloadReport(req, res) {
    const { relatorio } = req.body;
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="relatorio.pdf"',
    );

    doc.pipe(res);
    doc.fontSize(20).text("Relatorio StoreHost", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(relatorio);
    doc.end();
  }
}

export default new ReportController();
