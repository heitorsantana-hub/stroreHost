import Product from "../models/Product.js";
import Store from "../models/Store.js";

class SessionProduct {
  async store(req, res) {
    const { name, price, category, description } = req.body;

    try {
      const storeId = req.session.storeId;

      // Sessão não logada
      if (!storeId) {
        console.log("sesssão não criada");
        return res.redirect("/login");
      }

      // Campos vazios
      if (!name || !price || !category || !description) {
        console.log("Erro, por favor insira os dados corretos");
        return res.redirect("/dashboard/product");
      }

      const product = await Product.create({
        store_id: storeId, // Pega o _id que o MongoDB acabou de achar na constante "store"
        name,
        price,
        category,
        description,
      });

      console.log("Produto criado com sucesso:", product.name);

      return res.redirect("/dashboard/product");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
}

export default new SessionProduct();
