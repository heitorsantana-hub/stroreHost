import { Router } from "express";
import SessionLogin from "../controllers/SessionLogin.js";
import SessionRegister from "../controllers/SessionRegister.js";

export const mainRoutes = Router();

// ==========================================
// ROTAS PÚBLICAS (NÃO PRECISAM DE PERMISSÃO)
// ==========================================

// Página de Login
mainRoutes.post("/login/post", SessionLogin.store);

mainRoutes.get("/login", (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

// Página de Registro
mainRoutes.post("/register/store", SessionRegister.store);

mainRoutes.get("/register", (req, res) => {
  res.render("register", {
    layout: "register",
  });
});

mainRoutes.get("/", (req, res) => {
  res.render("home", {
    layout: "main",
  });
});
