import express from "express";
import multer from "multer";
import session from "express-session";
import crypto from "node:crypto";
import { engine } from "express-handlebars";
import SessionRegister from "./src/controllers/SessionRegister.js";
import SessionLogin from "./src/controllers/SessionLogin.js";
import SessionProduct from "./src/controllers/SessionProduct.js";
import SesssionStock from "./src/controllers/SessionStock.js";
import SessionEmployee from "./src/controllers/SessionEmployee.js";
import SessionFinance from "./src/controllers/SessionFinance.js";
import SessionScheduling from "./src/controllers/SessionScheduling.js";
import SessionRole from "./src/controllers/SessionRole.js";
import Schedule from "./src/models/Schedule.js";
import Product from "./src/models/Product.js";
import Employee from "./src/models/Employee.js";
import Role from "./src/models/Role.js";
import Sale from "./src/models/Sale.js";
import path, { join } from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import SessionSale from "./src/controllers/SessionSale.js";
import SessionDashboard from "./src/controllers/SessionDashboard.js";
import SessionAIFeedback from "./src/controllers/SessionAIFeedback.js";
import AiController from "./src/controllers/AiController.js";
import ReportController from "./src/controllers/ReportController.js";

// IMPORTANTE: Importando o Middleware de Permissões
// (Certifique-se de que o caminho do arquivo esteja correto de acordo com o seu projeto)
import { checkPermission } from "./src/middlewares/checkPermission.js";

const app = express();
const port = 8888;

dotenv.config(); //Configurando o arquivo .env
mongoose.connect(process.env.MONGO_URL); //Lendo o Arquivo .env

// Configuração necessária para caminhos em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurando as views
// Configurando as views
app.set("views", path.join(__dirname, "src", "views"));
app.engine(
  "handlebars",
  engine({
    partialsDir: [path.join(__dirname, "src", "views", "partials")],
    layoutsDir: path.join(__dirname, "src", "views", "layouts"),
    defaultLayout: "main",

    // Configuração dos Helpers customizados
    helpers: {
      formatDate: function (date) {
        if (!date) return "Sem registro";

        return new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo", // Garante o fuso horário correto
        }).format(new Date(date));
      },
      // 🚀 NOVO HELPER: Compara dois valores (Necessário para a view de produtos)
      eq: function (v1, v2) {
        return v1 === v2;
      },
    },
  }),
);
app.set("view engine", "handlebars");
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public"))); // Criando para o CSS funcionar

// Captura de dados do HTML
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());

// Configurando Session
app.use(
  session({
    secret: "chave-secreta-do-storehost",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(async (req, res, next) => {
  if (req.session && req.session.storeId) {
    try {
      const Store = (await import("./src/models/Store.js")).default;
      const loja = await Store.findById(req.session.storeId).lean();

      if (loja) {
        // Força a injeção global idêntica para TODOS os controladores
        res.locals.storeName = loja.name || "Minha Loja";
        res.locals.storeColor = loja.primaryColor || "#2563EB";
        res.locals.storeLogo = loja.logoUrl || "";
      }
    } catch (err) {
      console.error("Erro no middleware global:", err);
    }
  }
  next();
});

// Multer para colocar imagem nos produtos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("public", "uploads"));
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);
      const fileName = `${hash.toString("hex")}-${file.originalname}`;
      cb(null, fileName);
    });
  },
});

export const upload = multer({ storage });

// ==========================================
// ROTAS DO DASHBOARD (COM MIDDLEWARE)
// ==========================================

// O middleware foi adicionado como o segundo parâmetro em todas as rotas protegidas
app.get("/dashboard", checkPermission("dashboard"), SessionDashboard.index);

// Rota para o Cockpit Inteligente da IA
app.get(
  "/api/cockpit",
  checkPermission("dashboard"),
  AiController.generateCockpit,
);

// Rota de busca por data de venda
app.get(
  "/api/reports/daily-sales",
  checkPermission("dashboard"),
  ReportController.getDailySales,
);

// Rota para configuração de personalização do sistema
app.post(
  "/dashboard/settings",
  upload.single("logo"),
  SessionDashboard.updateSettings,
);

// Rota para a IA (Note que é um GET, pois vamos chamar via Fetch no Front-end)
app.get("/dashboard/ai-report", AiController.generateReport);

// Rota para IA gerar o Diagnostico de sistema
app.post(
  "/api/ai-diagnostic",
  checkPermission("dashboard"),
  AiController.generateDiagnostic,
);

// Rota para baixar o pdf da IA
app.post("/dashboard/ai-report/download", AiController.downloadReport);

// Rota de Relátorios
app.get("/dashboard/reports", ReportController.getDashboardData);
app.get("/dashboard/reports/csv", ReportController.exportCsv);

// Sessão de Produtos
app.post(
  "/dashboard/products/create",
  checkPermission("products"),
  upload.single("image"),
  SessionProduct.store,
);
app.post(
  "/dashboard/product/update/:id",
  checkPermission("products"),
  upload.single("image"),
  SessionProduct.update,
);
app.post(
  "/dashboard/product/delete",
  checkPermission("products"),
  SessionProduct.destroy,
);

app.get("/dashboard/product", checkPermission("products"), async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    const meusProdutos = await Product.find({
      store_id: req.session.storeId,
    }).lean();

    res.render("product", {
      layout: "dashboard",
      produtos: meusProdutos,
      activeProduct: true,
    });
  } catch (error) {
    console.log("Erro ao buscar produtos:", error);
    res.send("Erro interno ao carregar a página.");
  }
});

// Sessão de Estoque
app.post(
  "/dashboard/stock/update",
  checkPermission("stock"),
  SesssionStock.update,
);
app.post(
  "/dashboard/stock/update/:id",
  checkPermission("stock"),
  SesssionStock.update,
);

app.get("/dashboard/stock", checkPermission("stock"), async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    const storeId = req.session.storeId;

    // Converte a string da sessão para um ObjectId real do MongoDB (Necessário para a soma matemática)
    const objectId = new mongoose.Types.ObjectId(storeId);

    // 1. Busca os produtos para renderizar na tabela/lista
    const meusProdutos = await Product.find({
      store_id: storeId,
    }).lean();

    // 2. Calcula "Total em Estoque" e "Valor Imobilizado" usando alta performance do Banco de Dados
    const kpisEstoque = await Product.aggregate([
      { $match: { store_id: objectId } },
      {
        $group: {
          _id: null,
          // Soma o total de itens físicos
          totalUnidades: { $sum: "$current_stock" },
          // Multiplica a quantidade de cada item pelo seu custo de fábrica e soma tudo
          valorTotal: {
            $sum: { $multiply: ["$current_stock", "$cost_price"] },
          },
        },
      },
    ]);

    // Extrai os valores calculados acima (proteção caso a loja não tenha produtos ainda)
    const total_estoque =
      kpisEstoque.length > 0 ? kpisEstoque[0].totalUnidades : 0;
    const valor_imobilizado =
      kpisEstoque.length > 0 ? kpisEstoque[0].valorTotal.toFixed(2) : "0.00";

    // 3. Calcula "Itens Críticos" (Produtos onde o stock atual atingiu ou caiu abaixo do limite mínimo)
    const itens_criticos = await Product.countDocuments({
      store_id: storeId,
      $expr: { $lte: ["$current_stock", "$min_stock"] },
    });

    // 4. Giro Médio (Fixo para demonstrar na banca)
    const giro_medio = "Alto";

    // 5. Envia o pacote completo de variáveis para o Handlebars renderizar a interface
    res.render("stock", {
      layout: "dashboard",
      produtos: meusProdutos,
      activeStock: true,
      // Novas variáveis dos cartões do topo:
      total_estoque: total_estoque,
      itens_criticos: itens_criticos,
      giro_medio: giro_medio,
      valor_imobilizado: valor_imobilizado,
    });
  } catch (error) {
    console.log("Erro ao buscar os produtos: ", error);
    res.send("Erro ao carregar a página de estoque");
  }
});

// Sessão de Funcionários
app.post(
  "/dashboard/employee/post",
  checkPermission("employee"),
  SessionEmployee.store,
);
app.post(
  "/dashboard/employee/update/:id",
  checkPermission("employee"),
  SessionEmployee.update,
);
app.post(
  "/dashboard/employee/delete",
  checkPermission("employee"),
  SessionEmployee.destroy,
);
app.post(
  "/dashboard/employee/add/role",
  checkPermission("employee"),
  SessionRole.store,
);

app.get(
  "/dashboard/employee",
  checkPermission("employee"),
  async (req, res) => {
    if (!req.session.storeId) {
      return res.redirect("/login?error=session");
    }

    try {
      const storeId = req.session.storeId;

      // 1. Busca Funcionários e Cargos (Role)
      const meusFuncionarios = await Employee.find({
        store_id: storeId,
      }).lean();
      const meusCargos = await Role.find({ store_id: storeId }).lean();

      // 2. Lógica para processar dados (Iniciais e Metas)
      const funcionariosFormatados = meusFuncionarios.map((emp) => {
        // Gera iniciais (ex: "Rafael Costa" -> "RC")
        const nomes = emp.name.split(" ");
        const iniciais =
          nomes.length > 1
            ? nomes[0][0] + nomes[nomes.length - 1][0]
            : nomes[0][0];

        // Cálculo de meta (Simulado para o TCC)
        const vendas = emp.vendas || 0;
        const meta = emp.meta || 150;
        const pct = Math.min(Math.round((vendas / meta) * 100), 100);

        return {
          ...emp,
          iniciais: iniciais.toUpperCase(),
          pct,
          vendas,
          meta,
        };
      });

      // 3. Renderiza com os dados processados
      res.render("employee", {
        layout: "dashboard",
        funcionarios: funcionariosFormatados, // Use "funcionarios" no {{#each}} do handlebars
        roles: meusCargos,
        activeEmployee: true,
        // KPIs de topo calculados
        total_time: funcionariosFormatados.length,
        ativos_hoje: funcionariosFormatados.length,
        top_vendedor:
          funcionariosFormatados.length > 0
            ? funcionariosFormatados.reduce((prev, curr) =>
                curr.vendas > prev.vendas ? curr : prev,
              ).name
            : "Nenhum",
        metas_batidas: funcionariosFormatados.filter((f) => f.vendas >= f.meta)
          .length,
      });
    } catch (error) {
      console.error("Erro ao carregar equipe: ", error);
      res.status(500).send("Erro ao carregar a página");
    }
  },
);

// Sessão de Vendas
app.post(
  "/dashboard/sales/create",
  checkPermission("sales"),
  SessionSale.store,
);
app.post(
  "/dashboard/sales/delete",
  checkPermission("sales"),
  SessionSale.destroy,
);
app.post(
  "/dashboard/sales/update/:id",
  checkPermission("sales"),
  SessionSale.update,
);

app.get("/dashboard/sales", checkPermission("sales"), async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    const meusProdutos = await Product.find({
      store_id: req.session.storeId,
    }).lean();

    const minhasVenda = await Sale.find({
      store_id: req.session.storeId,
    }).lean();

    res.render("sale", {
      layout: "dashboard",
      produtos: meusProdutos,
      vendas: minhasVenda,
      activeSales: true,
    });
  } catch (error) {
    console.log("Erro ao buscar os produtos: ", error);
    res.send("Erro ao carregar a página");
  }
});

// Rotas do Financeiro
app.get("/dashboard/finance", checkPermission("finance"), SessionFinance.index);
app.post(
  "/dashboard/finance/delete",
  checkPermission("finance"),
  SessionFinance.destroy,
);
app.post(
  "/dashboard/finance/update/:id",
  checkPermission("finance"),
  SessionFinance.update,
);
app.post(
  "/dashboard/finance/create",
  checkPermission("finance"),
  SessionFinance.store,
);

// ==========================================
// ROTAS DE AGENDAMENTO
// ==========================================
app.get(
  "/dashboard/scheduling",
  checkPermission("appointments"),
  async (req, res) => {
    if (!req.session.storeId) return res.redirect("/login?error=session");
    return SessionScheduling.index(req, res);
  },
);

app.post(
  "/dashboard/scheduling/create",
  checkPermission("appointments"),
  async (req, res) => {
    if (!req.session.storeId) return res.status(401).send("Sessão expirada.");
    return SessionScheduling.create(req, res);
  },
);

app.post(
  "/dashboard/scheduling/update/:id",
  checkPermission("appointments"),
  async (req, res) => {
    if (!req.session.storeId) return res.status(401).send("Sessão expirada.");
    return SessionScheduling.update(req, res);
  },
);

app.post(
  "/dashboard/scheduling/delete",
  checkPermission("appointments"),
  async (req, res) => {
    if (!req.session.storeId) return res.status(401).send("Sessão expirada.");
    return SessionScheduling.delete(req, res);
  },
);

// Feedback AI (Geralmente no Dashboard, então vamos exigir acesso básico ao dashboard)
app.post(
  "/api/ai-feedback",
  checkPermission("dashboard"),
  SessionAIFeedback.postChat,
);

// ==========================================
// ROTAS PÚBLICAS (NÃO PRECISAM DE PERMISSÃO)
// ==========================================

// Página de Login
app.post("/login/post", SessionLogin.store);

app.get("/login", (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

// Página de Registro
app.post("/register/store", SessionRegister.store);

app.get("/register", (req, res) => {
  res.render("register", {
    layout: "register",
  });
});

app.get("/", (req, res) => {
  res.render("home", {
    layout: "main",
  });
});

app.listen(port, (req, res) => {
  console.log("funcionando;");
});
