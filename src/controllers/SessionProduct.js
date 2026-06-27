import Product from "../models/Product.js";

class SessionProduct {
  async store(req, res) {
    // 1. Recebemos os novos campos do formulário
    const {
      name,
      price,
      category,
      description,
      unit_of_measure,
      tags,
      barcode,
      cost_price,
      min_stock,
      max_stock,
    } = req.body;

    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : "/img/default.png";

    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.redirect("/login?error=session");

      // 2. Transformar a string de tags em um Array (Ex: "carne, churrasco" -> ["carne", "churrasco"])
      const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

      const product = await Product.create({
        store_id: storeId,
        name,
        category,
        description,
        image_url,
        // Novos campos adicionados:
        unit_of_measure: unit_of_measure || "UN",
        tags: tagsArray,
        barcode,
        cost_price: parseFloat(cost_price) || 0,
        price: parseFloat(price) || 0,
        min_stock: parseInt(min_stock) || 5,
        max_stock: parseInt(max_stock) || 100,
      });

      console.log("Produto criado com sucesso:", product.name);
      return res.redirect("/dashboard/product?sucess=create");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }

  // ... (O método destroy continua igual)

  async update(req, res) {
    // Mesma lógica de desestruturação do store() para os novos campos
    const {
      name,
      category,
      price,
      description,
      unit_of_measure,
      tags,
      barcode,
      cost_price,
      min_stock,
      max_stock,
    } = req.body;

    const { id } = req.params;

    try {
      const storeId = req.session.storeId;
      const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

      const updateData = {
        name,
        category,
        description,
        unit_of_measure,
        tags: tagsArray,
        barcode,
        cost_price: parseFloat(cost_price),
        price: parseFloat(price),
        min_stock: parseInt(min_stock),
        max_stock: parseInt(max_stock),
      };

      if (req.file) updateData.image_url = `/uploads/${req.file.filename}`;

      await Product.updateOne(
        { _id: id, store_id: storeId },
        { $set: updateData },
      );

      return res.redirect("/dashboard/product?sucess=update");
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
}

export default new SessionProduct();
