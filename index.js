import express from "express";
import session from "express-session";
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
import { error } from "console";
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

// Rotas
app.get("/dashboard", SessionDashboard.index);

// Sessão de Produtos
app.post("/dashboard/products/create", SessionProduct.store);

app.get("/dashboard/product", async (req, res) => {
  // 1. Verifica se a pessoa está logada
  if (!req.session.storeId) {
    return res.redirect("/login");
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

app.get("/dashboard/stock", async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login");
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

app.get("/dashboard/employee", async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login");
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

app.get("/dashboard/sales", async (req, res) => {
  if (!req.session.storeId) {
    return res.redirect("/login");
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

app.get("/dashboard/finance", SessionFinance.index);

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
