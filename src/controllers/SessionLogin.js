import Store from "../models/Store.js";
import jwt from "jsonwebtoken";

class SessionLogin {
  async store(req, res) {
    const { email, password } = req.body;

    const store = await Store.findOne({ email });

    // Loja não encontrada
    if (!store) {
      console.log("Loja não existe");
      return res.status(400).redirect("/login");
    }

    if (store.password != password) {
      console.log("Senha errada");
      return res.status(401).redirect("/login");
    }

    // Dados da sessão
    req.session.statusLogin = true;
    req.session.storeName = store.name;
    req.session.storeId = store._id;

    // Rediriocinamento
    return res.status(201).redirect("/dashboard");
  }
}

export default new SessionLogin();
