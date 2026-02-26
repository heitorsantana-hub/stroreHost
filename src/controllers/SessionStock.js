import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";

class SessionStock {
  async update(req, res) {
    const { product_id, quantity } = req.body;
    const storeId = req.session.storeId;

    if (!storeId) return res.redirect("/login?erro=session");

    try {
      // Procurando um produto que exista na loja específica
      const product = await Product.findOne({
        _id: product_id,
        store_id: storeId,
      });

      if (!product) {
        console.log("Produto não encontrado");
        return res.redirect("/dashboard/stock");
      }

      const qtd = parseInt(quantity, 10);

      product.current_stock += qtd;
      await product.save();

      await StockMovement.create({
        store_id: storeId,
        product_id: product_id,
        quantity: qtd,
      });

      console.log("Resgitro Feito com Sucesso");
      return res.redirect("/dashboard/stock?sucess=create");
    } catch (error) {
      console.log("Erro ao movimentar estoque:", error);
      return res.redirect("/dashboard/stock");
    }
  }

  async update2(req, res) {
    const { id } = req.params;
    const { quantity } = req.body;

    try {
      const storeId = req.session.storeId;

      if (!storeId) {
        return res.redirect("/login?erro=session");
      }

      const result = await Product.updateOne(
        { _id: id, store_id: storeId },
        { $set: { current_stock: quantity } }, // Use o $set para garantir a alteração
      );

      console.log({ result });
      return res.redirect("/dashboard/stock?sucess=create");
    } catch (err) {
      console.log(err);
    }
  }
}

export default new SessionStock();
