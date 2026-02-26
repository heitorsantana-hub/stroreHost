import Store from "../models/Store.js"; // Pegando o Banco de Lojas

class SessionRegister {
  async store(req, res) {
    const { name, email, password, address, phone, cnpj } = req.body;
    try {
      let store = await Store.findOne({ email });
      if (store) {
        console.log("Loja já existe");
        return res.redirect("/register?error=exists");
      }
      store = await Store.create({
        name,
        email,
        password,
        address,
        phone,
        cnpj,
      });
      return res.redirect("/login");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
}

export default new SessionRegister();
