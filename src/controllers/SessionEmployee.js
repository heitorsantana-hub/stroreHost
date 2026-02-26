import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";

class SessionEmployee {
  async store(req, res) {
    const { name, email, password, cargo } = req.body;

    try {
      const storeId = req.session.storeId;

      // Sessão não logada
      if (!storeId) {
        console.log("sesssão não criada");
        return res.redirect("/login?erro=session");
      }

      // Campos vazios
      if (!name || !email || !password || !cargo) {
        console.log("Erro, por favor insira os dados corretos");
        return res.redirect("/dashboard/product");
      }

      // REGRA DE NEGÓCIO 2: O email já existe nesta loja?
      const userExists = await Employee.findOne({
        email: email,
        store_id: storeId,
      });
      if (userExists) {
        console.log("Erro: Este email já pertence a um funcionário.");
        return res.redirect("/dashboard/employee?error=email");
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
      return res.redirect("/dashboard/employee?sucess=create");
    } catch (error) {
      console.log("Deu erro aqui: ", error);
      return res.redirect("/dashboard/employee");
    }
  }

  async destroy(req, res) {
    const employee_id = req.body.employee_id;

    try {
      const storeId = req.session.storeId;

      if (!storeId) {
        return res.redirect("/login?error=session");
      }

      const result = await Employee.deleteOne({
        store_id: storeId,
        _id: employee_id,
      });

      console.log(result);
      console.log("ID que chegou:", employee_id);

      return res.redirect("/dashboard/employee?sucess=create");
    } catch (err) {
      console.log(err);
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, email, cargo } = req.body;

    try {
      const storeId = req.session.storeId;

      if (!storeId) {
        return res.redirect("/login?erro=session");
      }

      const result = await Employee.updateOne(
        {
          _id: id,
          store_id: storeId,
        },
        {
          name,
          email,
          cargo,
        },
      );

      console.log({ result });
      console.log("Update");
      return res.redirect("/dashboard/employee?sucess=create");
    } catch (err) {
      console.log(err);
    }
  }
}

export default new SessionEmployee();
