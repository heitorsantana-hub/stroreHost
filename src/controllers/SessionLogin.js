import Store from "../models/Store.js";
import jwt from "jsonwebtoken";

class SessionLogin {
  async store(req, res) {
    const { email, password } = req.body;

    const store = await Store.findOne({ email });

    // Loja não encontrada
    if (!store) {
      // Adiciona ?error=1 na URL
      return res.redirect("/login?error=notfound");
    }

    if (store.password != password) {
      console.log("Senha errada");
      return res.redirect("/login?error=password");
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
