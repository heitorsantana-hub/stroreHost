import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";

class SessionEmployee {
  async store(req, res) {
    const { name, email, password, cargo, confirm_senha } = req.body;

    try {
      const storeId = req.session.storeId;

      // Sessão não logada
      if (!storeId) {
        console.log("sesssão não criada");
        return res.redirect("/login");
      }

      // Campos vazios
      if (!name || !email || !password || !cargo) {
        console.log("Erro, por favor insira os dados corretos");
        return res.redirect("/dashboard/product");
      }

      // REGRA DE NEGÓCIO 1: As senhas batem?
      if (password !== confirm_senha) {
        console.log("Erro: As senhas não coincidem.");
        return res.redirect("/dashboard/employee");
      }

      // REGRA DE NEGÓCIO 2: O email já existe nesta loja?
      const userExists = await Employee.findOne({
        email: email,
        store_id: storeId,
      });
      if (userExists) {
        console.log("Erro: Este email já pertence a um funcionário.");
        return res.redirect("/dashboard/employee");
      }

      // REGRA DE NEGÓCIO 3: Criptografando a senha (Hash)
      const salt = await bcrypt.genSalt(10); // Gera uma camada de complexidade
      const hashedPassword = await bcrypt.hash(password, salt); // Transforma a senha

      // Criando o funcionario
      const employee = await Employee.create({
        store_id: storeId,
        name,
        email,
        password: hashedPassword,
        cargo,
      });

      console.log("Funcionario cadastrado: ", employee.name);
      return res.redirect("/dashboard/employee");
    } catch (error) {
      console.log("Deu erro aqui: ", error);
      return res.redirect("/dashboard/employee");
    }
  }
}

export default new SessionEmployee();
