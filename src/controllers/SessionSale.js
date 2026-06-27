import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

class SessionSale {
  async store(req, res) {
    const { quantity, product_id, payment_method, notes } = req.body;

    try {
      const storeId = req.session.storeId;

      if (!storeId) {
        return res.redirect("/dashboard/login?erro=session");
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
        return res.redirect("/dashboard/sales?error=quantity");
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

      // Registrar a movimentação de estoque de saída
      await StockMovement.create({
        store_id: storeId,
        product_id: product._id,
        quantity: qtdVendida,
        type: "out",
      });

      console.log(`Venda Registrada com Sucesso! Recibo: #${sale._id}`);

      // 7. Retorno de sucesso corrigido
      return res.redirect("/dashboard/sales?sucess=create");
    } catch (error) {
      console.log("Deu erro aqui: ", error);
      return res.redirect("/dashboard/sales");
    }
  }

  async destroy(req, res) {
    const { sale_id } = req.body; // Vem daquele input type="hidden" no HTML

    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.redirect("/login?error=session");

      // 1. BUSCAR A VENDA ANTES DE DELETAR (Precisamos saber o que foi vendido)
      const sale = await Sale.findOne({ _id: sale_id, store_id: storeId });

      if (!sale) {
        console.log("Venda não encontrada para exclusão.");
        return res.redirect("/dashboard/sales?error=not_found");
      }

      // 2. DEVOLVER AO ESTOQUE
      const product = await Product.findOne({
        _id: sale.product_id,
        store_id: storeId,
      });

      if (product) {
        // Soma a quantidade de volta
        product.current_stock += sale.quantity;
        await product.save();

        // 3. REGISTRAR O HISTÓRICO DA DEVOLUÇÃO
        await StockMovement.create({
          store_id: storeId,
          product_id: product._id,
          quantity: sale.quantity,
          type: "in",
          reason: "devolucao", // Lembra que criamos esse motivo? Ele brilha aqui!
          unit_value: product.cost_price,
          total_value: sale.quantity * product.cost_price,
        });
      }

      // 4. ACERTAR O FINANCEIRO (Retirar o dinheiro do caixa)
      // Pega os últimos 4 dígitos do ID da venda para ficar bonito no relatório
      const shortId = sale._id.toString().slice(-4).toUpperCase();

      await Transaction.create({
        store_id: storeId,
        type: "expense", // É uma "saída" porque estamos devolvendo o dinheiro ao cliente
        description: `Estorno de Venda #${shortId}`,
        category: "Devolução / Estorno",
        amount: sale.total_price, // O valor total que havia sido pago
        isIncome: false,
        data_formatada: new Date().toLocaleDateString("pt-BR"), // Adapte para como seu model salva datas
      });

      // 5. FINALMENTE, DELETAR A VENDA
      await Sale.deleteOne({ _id: sale_id });

      console.log(`Venda ${sale_id} estornada com sucesso.`);
      return res.redirect("/dashboard/sales?sucess=delete");
    } catch (err) {
      console.error("Erro grave ao tentar estornar venda:", err);
      return res.status(500).redirect("/dashboard/sales?error=internal");
    }
  }

  async update(req, res) {
    // 1. No seu formulário, o campo se chama 'product_id', não 'name'
    const { product_id, quantity, payment_method } = req.body;
    const { id } = req.params; // ID da VENDA
    const storeId = req.session.storeId;

    try {
      // 2. Precisamos do preço atual do produto para recalcular o total
      const product = await Product.findOne({
        _id: product_id,
        store_id: storeId,
      });

      if (!product) {
        return res.status(404).send("Produto não encontrado.");
      }

      const total_price = product.price * quantity;

      // 3. Criamos o objeto de atualização (agora com o total certo)
      const updateData = {
        product_id: product_id,
        product_name: product.name, // Mantendo o nome atualizado
        quantity: quantity,
        payment_method: payment_method,
        total_price: total_price,
      };

      // 4. ATENÇÃO: Aqui deve ser o seu modelo de Vendas (ex: Sale)
      // Se você usar Product, vai sobrescrever um produto com dados de uma venda!
      await Sale.updateOne(
        { _id: id, store_id: storeId },
        { $set: updateData },
      );

      return res.redirect("/dashboard/sales?sucess=update");
    } catch (err) {
      console.error("Erro na atualização da venda:", err);
      res.status(500).send("Erro interno ao atualizar.");
    }
  }
}

export default new SessionSale();
