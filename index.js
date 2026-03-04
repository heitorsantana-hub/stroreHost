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
import Product from "./src/models/Product.js";
import Employee from "./src/models/Employee.js";
import Sale from "./src/models/Sale.js";
import path, { join } from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import SessionSale from "./src/controllers/SessionSale.js";
import SessionDashboard from "./src/controllers/SessionDashboard.js";
const app = express();
const port = 3000;

dotenv.config(); //Configurando o arquivo .env
mongoose.connect(process.env.MONGO_URL); //Lendo o Arquivo .env

// Configuração necessária para caminhos em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurando as views
app.set("views", path.join(__dirname, "src", "views"));
app.engine(
  "handlebars",
  engine({
    partialsDir: [path.join(__dirname, "src", "views", "partials")],
    layoutsDir: path.join(__dirname, "src", "views", "layouts"),
    defaultLayout: "main",

    // Configuração de Formatação de Datas tabela
    // Na configuração do seu app.engine('handlebars', ...)
    helpers: {
      // ... seu helper firstLetter que já existe ...

      formatDate: function (date) {
        if (!date) return "Sem registro";

        // Criamos um objeto de data e formatamos para o padrão Brasil
        return new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo", // Garante o fuso horário correto
        }).format(new Date(date));
      },
    },
  }),
);
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
    saveUninitialized: false,
  }),
);

// Multer para colocar imagem nos produtos

const storage = multer.diskStorage({
  // Define a pasta de destino
  destination: (req, file, cb) => {
    cb(null, path.resolve("public", "uploads"));
  },
  // Gera um nome único para evitar ficheiros duplicados
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);
      const fileName = `${hash.toString("hex")}-${file.originalname}`;
      cb(null, fileName);
    });
  },
});

export const upload = multer({ storage });

// Rotas
app.get("/dashboard", SessionDashboard.index);

// Sessão de Produtos
app.post(
  "/dashboard/products/create",
  upload.single("image"),
  SessionProduct.store,
);
app.post(
  "/dashboard/product/update/:id",
  upload.single("image"),
  SessionProduct.update,
);
app.post("/dashboard/product/delete", SessionProduct.destroy);

app.get("/dashboard/product", async (req, res) => {
  // 1. Verifica se a pessoa está logada
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    // 2. Busca SÓ os produtos que pertencem à loja logada
    // O .lean() é obrigatório para o Handlebars conseguir ler os dados!
    const meusProdutos = await Product.find({
      store_id: req.session.storeId,
    }).lean();

    // 3. Envia a lista de produtos para o HTML
    res.render("product", {
      layout: "dashboard",
      produtos: meusProdutos,
      storeName: req.session.storeName, // Enviando a variável para a view
    });
  } catch (error) {
    console.log("Erro ao buscar produtos:", error);
    res.send("Erro interno ao carregar a página.");
  }
});

app.post("/dashboard/stock/update", SesssionStock.update);
app.post("/dashboard/stock/update/:id", SesssionStock.update2);

app.get("/dashboard/stock", async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    // Procura de produto
    const meusProdutos = await Product.find({
      store_id: req.session.storeId,
    }).lean(); // lean() o motivo é por causa do MongoDB

    res.render("stock", {
      layout: "dashboard",
      produtos: meusProdutos,
      storeName: req.session.storeName,
    });
  } catch (error) {
    console.log("Erro ao buscar os produtos: ", error);
    res.send("Erro ao carregar a página");
  }
});

app.post("/dashboard/employee/post", SessionEmployee.store);
app.post("/dashboard/employee/update/:id", SessionEmployee.update);
app.post("/dashboard/employee/delete", SessionEmployee.destroy);

app.get("/dashboard/employee", async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    // Procura de produto
    const meusFuncionarios = await Employee.find({
      store_id: req.session.storeId,
    }).lean(); // lean() o motivo é por causa do MongoDB

    res.render("employee", {
      layout: "dashboard",
      employees: meusFuncionarios,
      storeName: req.session.storeName,
    });
  } catch (error) {
    console.log("Erro ao buscar os produtos: ", error);
    res.send("Erro ao carregar a página");
  }
});

app.post("/dashboard/sales/create", SessionSale.store);
app.post("/dashboard/sales/delete", SessionSale.destroy);
app.post("/dashboard/sales/update/:id", SessionSale.update);

app.get("/dashboard/sales", async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login?error=session");
  }

  try {
    // Procura de produto
    const meusProdutos = await Product.find({
      store_id: req.session.storeId,
    }).lean(); // lean() o motivo é por causa do MngoDB

    const minhasVenda = await Sale.find({
      store_id: req.session.storeId,
    }).lean(); // lean() o motivo é por causa do MngoDB

    res.render("sale", {
      layout: "dashboard",
      produtos: meusProdutos,
      vendas: minhasVenda,
      storeName: req.session.storeName,
    });
  } catch (error) {
    console.log("Erro ao buscar os produtos: ", error);
    res.send("Erro ao carregar a página");
  }
});

// Rotas da página do Financeiro

app.get("/dashboard/finance", SessionFinance.index);
app.post("/dashboard/finance/delete", SessionFinance.destroy);
app.post("/dashboard/finance/update/:id", SessionFinance.update);
app.post("/dashboard/finance/create", SessionFinance.store);

//Página de Loging
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

// Criando servidor
app.listen(port, () => {
  console.log(`Porta rodando em: ${port}`);
});
