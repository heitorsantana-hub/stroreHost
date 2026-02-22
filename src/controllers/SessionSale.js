import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

class SessionSale {
  async store(req, res) {
    const { quantity, product_id, payment_method, notes } = req.body;

    try {
      const storeId = req.session.storeId;

      if (!storeId) {
        return res.redirect("/dashboard/sale");
      }

      if (!quantity || !product_id || !payment_method) {
        console.log("Erro, por favor insira os dados corretos");
        return res.redirect("/dashboard/sale");
      }

      // 2. Busca o Produto no banco para tirar a "Fotografia" (Snapshot)
      const product = await Product.findOne({
        _id: product_id,
        store_id: storeId,
      });

      if (!product) {
        console.log("Erro: Produto não encontrado no catálogo.");
        return res.redirect("/dashboard/sale");
      }

      // Converte a quantidade que veio como texto do HTML para Número inteiro
      const qtdVendida = parseInt(quantity, 10);

      // 3. REGRA DE NEGÓCIO: Checagem de Estoque
      if (product.current_stock < qtdVendida) {
        console.log(
          `Erro: Estoque insuficiente. Temos apenas ${product.current_stock} unidades.`,
        );
        return res.redirect("/dashboard/sale");
      }

      // 4. REGRA DE NEGÓCIO: Cálculo Financeiro e Fotografia
      const precoUnitario = product.price;
      const precoTotal = precoUnitario * qtdVendida; // Aqui nasce o seu total_price!

      // 5. Salva a Venda
      const sale = await Sale.create({
        store_id: storeId,
        product_id: product._id,
        product_name: product.name, // Salvando o nome no recibo
        unit_price: precoUnitario, // Salvando o preço no recibo
        quantity: qtdVendida,
        total_price: precoTotal, // O cálculo exato
        payment_method: payment_method,
        notes: notes,
        status: "Concluída", // Definindo o status padrão
      });

      // 6. REGRA DE NEGÓCIO: Dar Baixa Automática no Estoque
      product.current_stock -= qtdVendida;
      await product.save();

      console.log(`Venda Registrada com Sucesso! Recibo: #${sale._id}`);

      // 7. Retorno de sucesso corrigido
      return res.redirect("/dashboard/sales");
    } catch (error) {
      console.log("Deu erro aqui: ", error);
      return res.redirect("/dashboard/sales");
    }
  }
}

export default new SessionSale();
