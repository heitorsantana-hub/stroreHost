import Store from "../models/Store.js"; // Pegando o Banco de Lojas
import path from "path";

class SessionRegister {
  async store(req, res) {
    const { name, email, password, address, phone, cnpj } = req.body;
    try {
      let store = await Store.findOne({ email });
      if (store) {
        return res.status(400).json({ error: "Store already exists" });
      }
      store = await Store.create({
        name,
        email,
        password,
        address,
        phone,
        cnpj,
      });
      console.log({ store });
      return res.status(201).redirect("/login");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
}

export default new SessionRegister();
