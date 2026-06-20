import Role from "../models/Role.js"; //importando o banco dos cargos

class SessionRole {
  async store(req, res) {
    const {
      name,
      view_dashboard,
      view_stock,
      view_finance,
      view_products,
      view_sales,
      view_employee,
    } = req.body;

    try {
      const storeId = req.session.storeId;

      const dashboardBoolean =
        view_dashboard === "on" || view_dashboard === true;
      const stockBoolean = view_stock === "on" || view_stock === true;
      const financeBoolean = view_finance === "on" || view_finance === true;
      const productsBoolean = view_products === "on" || view_products === true;
      const salesBoolean = view_sales === "on" || view_sales === true;
      const employeeBoolean = view_employee === "on" || view_employee === true;

      const newRole = await Role.create({
        store_id: storeId,
        name_role: name,
        dashboard: dashboardBoolean,
        finance: financeBoolean,
        products: productsBoolean,
        sales: salesBoolean,
        employee: employeeBoolean,
      });

      res.status(201).json({
        message: "Cargo criado com sucesso!",
        cargo: newRole,
      });
    } catch (error) {
      console.error("Erro foi capturado: " + error);
      res
        .status(500)
        .json({ erro: "Falha interna ao salvar no banco de dados." });
    }
  }
}

export default new SessionRole();
