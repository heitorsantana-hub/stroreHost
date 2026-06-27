import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";

class SessionStock {
  async update(req, res) {
    // 1. Recebemos o motivo, tipo (in/out) e valor unitário
    const { product_id, quantity, type, reason, unit_value } = req.body;
    const storeId = req.session.storeId;

    if (!storeId) return res.redirect("/login?erro=session");

    try {
      const product = await Product.findOne({
        _id: product_id,
        store_id: storeId,
      });
      if (!product) return res.redirect("/dashboard/stock");

      // 2. CRÍTICO: Usar parseFloat em vez de parseInt para aceitar decimais (ex: 1.5 KG)
      const qtd = parseFloat(quantity);

      // 3. Atualiza o estoque do produto baseado se é entrada ou saída
      if (type === "out") {
        product.current_stock -= qtd;
      } else {
        product.current_stock += qtd;
      }
      await product.save();

      // 4. Calcula o valor financeiro do movimento (se houver)
      const valorUnitario = parseFloat(unit_value) || product.cost_price;
      const valorTotal = qtd * valorUnitario;

      // 5. Salva o registro completo
      await StockMovement.create({
        store_id: storeId,
        product_id: product_id,
        quantity: qtd,
        type: type || "in",
        reason: reason || "ajuste",
        unit_value: valorUnitario,
        total_value: valorTotal,
      });

      console.log("Registro Feito com Sucesso");
      return res.redirect("/dashboard/stock?sucess=create");
    } catch (error) {
      console.log("Erro ao movimentar estoque:", error);
      return res.redirect("/dashboard/stock");
    }
  }
}

export default new SessionStock();
