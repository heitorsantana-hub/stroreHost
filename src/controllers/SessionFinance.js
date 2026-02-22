import Transaction from "../models/Transaction.js";

class SessionFinance {
  // 1. Método para RENDERIZAR a página (GET)
  async index(req, res) {
    try {
      const storeId = req.session.storeId;
      if (!storeId) return res.redirect("/login");

      // Busca todas as transações da loja
      const transactions = await Transaction.find({ store_id: storeId })
        .sort({ createdAt: -1 })
        .lean();

      // --- INÍCIO DA MATEMÁTICA DOS GRÁFICOS ---
      let totalEntradas = 0;
      let totalSaidas = 0;

      // Objetos para agrupar valores por categoria (Ex: { "Contas Fixas": 500, "Impostos": 200 })
      const categoriasEntrada = {};
      const categoriasSaida = {};

      const formatadas = transactions.map((t) => {
        t.isIncome = t.type === "income";

        // Formatação de data
        const dataObjeto = new Date(t.createdAt);
        t.data_formatada = dataObjeto.toLocaleDateString("pt-BR");

        // Agrupamento e Soma
        if (t.isIncome) {
          totalEntradas += t.amount;
          // Se a categoria já existe, soma. Se não, cria com o valor atual.
          categoriasEntrada[t.category] =
            (categoriasEntrada[t.category] || 0) + t.amount;
        } else {
          totalSaidas += t.amount;
          categoriasSaida[t.category] =
            (categoriasSaida[t.category] || 0) + t.amount;
        }

        return t;
      });
      // --- FIM DA MATEMÁTICA ---

      // Envia os dados prontos para a tela (Convertendo os agrupamentos em Arrays tipo JSON)
      res.render("finance", {
        layout: "dashboard",
        transacoes: formatadas,
        storeName: req.session.storeName,

        // Dados para os Gráficos
        labelsEntradas: JSON.stringify(Object.keys(categoriasEntrada)), // Nomes das categorias
        dadosEntradas: JSON.stringify(Object.values(categoriasEntrada)), // Valores somados

        labelsSaidas: JSON.stringify(Object.keys(categoriasSaida)),
        dadosSaidas: JSON.stringify(Object.values(categoriasSaida)),

        totalEntradas: totalEntradas,
        totalSaidas: totalSaidas,
      });
    } catch (error) {
      console.log("Erro ao carregar o painel financeiro:", error);
      res.redirect("/dashboard");
    }
  }

  // 2. Método para SALVAR um novo lançamento (POST)
  async store(req, res) {
    const { type, description, category, amount } = req.body;
    const storeId = req.session.storeId;

    if (!storeId) return res.redirect("/login");

    try {
      // Validação de campos vazios
      if (!type || !description || !category || !amount) {
        console.log("Erro: Todos os campos são obrigatórios.");
        return res.redirect("/dashboard/finance");
      }

      // REGRA DE NEGÓCIO: Converte o valor para número decimal (Float)
      // O replace garante que se o usuário digitar vírgula (10,50), o JS entenda como ponto (10.50)
      const valorLimpo = amount.replace(",", ".");
      const valorNumerico = parseFloat(valorLimpo);

      // Bloqueia valores inválidos, zerados ou negativos
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        console.log("Erro: O valor deve ser numérico e maior que zero.");
        return res.redirect("/dashboard/finance");
      }

      // Salva no banco de dados
      await Transaction.create({
        store_id: storeId,
        type: type, // "income" ou "expense"
        description: description,
        category: category,
        amount: valorNumerico,
      });

      console.log("Lançamento financeiro registrado com sucesso!");
      return res.redirect("/dashboard/finance");
    } catch (error) {
      console.log("Erro interno ao registrar transação:", error);
      return res.redirect("/dashboard/finance");
    }
  }
}

export default new SessionFinance();
