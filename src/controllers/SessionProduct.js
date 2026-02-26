import Employee from "../models/Employee.js";
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
        return res.redirect("/login?error=session");
      }

      // Campos vazios
      if (!name || !price || !category || !description) {
        console.log("Erro, por favor insira os dados corretos");
        return res.redirect("/dashboard/product?error=dados");
      }

      const product = await Product.create({
        store_id: storeId, // Pega o _id que o MongoDB acabou de achar na constante "store"
        name,
        price,
        category,
        description,
      });

      console.log("Produto criado com sucesso:", product.name);

      return res.redirect("/dashboard/product?sucess=create");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  async destroy(req, res) {
    const product_id = req.body.product_id;

    try {
      const storeId = req.session.storeId;

      if (!storeId) {
        return res.redirect("/login?error=session");
      }

      const result = await Product.deleteOne({
        store_id: storeId,
        _id: product_id,
      });

      console.log({ result });
      console.log("ID que chegou:", product_id);

      return res.redirect("/dashboard/product?sucesss=create");
    } catch (err) {
      console.log(err);
    }
  }

  async update(req, res) {
    const { name, category, price } = req.body;
    const { id } = req.params;
    try {
      const storeId = req.session.storeId;

      const result = await Product.updateOne(
        {
          _id: id,
          store_id: storeId,
        },
        {
          name,
          category,
          price,
        },
      );

      console.log(result);
      return res.redirect("/dashboard/product?sucess=update");
    } catch (err) {
      console.log(err);
    }
  }
}

export default new SessionProduct();
