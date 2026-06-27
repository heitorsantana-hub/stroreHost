import Employee from "../models/Employee.js";
import Store from "../models/Store.js";
import jwt from "jsonwebtoken";

class SessionLogin {
  async store(req, res) {
    const { email, password } = req.body;

    //Teste de encontrar adm
    const user = await Store.findOne({ email });
    let isEmployee = false;

    if (!user) {
      user = await Employee.findOne({ email }).populate("role_id");
      isEmployee = true;
    }

    // Se não achou nem loja ou funcionario
    if (!user) {
      // Adiciona ?error=1 na URL
      return res.redirect("/login?error=notfound");
    }

    if (user.password != password) {
      console.log("Senha errada");
      return res.redirect("/login?error=password");
    }

    // 4. Define as permissões
    let permissions = {};
    if (isEmployee) {
      // Se for funcionário, as permissões são as do cargo dele
      permissions = user.role_id;
    } else {
      // Se for o dono da loja, damos acesso total (Admin) forçado na sessão
      permissions = {
        dashboard: true,
        products: true,
        stock: true,
        sales: true,
        finance: true,
        appointments: true,
        employee: true,
      };
    }

    // 5. Salva os dados na Sessão
    req.session.statusLogin = true;
    req.session.userType = isEmployee ? "employee" : "admin"; // Define quem está logado
    req.session.userId = user._id;
    req.session.storeId = isEmployee ? user.store_id : user._id; // O ID da loja principal
    req.session.userName = user.name || user.name_role;
    req.session.permissions = permissions; // Salvamos as permissões na sessão!

    // Rediriocinamento
    return res.status(201).redirect("/dashboard");
  }
}

export default new SessionLogin();
