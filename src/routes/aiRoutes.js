import { Router } from "express";
import AiController from "../controllers/AiController.js";
import ReportController from "../controllers/ReportController.js";

export const aiRoutes = Router();

// Rota para IA gerar o Diagnostico de sistema
aiRoutes.post("/ai-diagnostic", AiController.generateDiagnostic);

// Rota para o Cockpit Inteligente da IA
aiRoutes.get("/cockpit", AiController.generateCockpit);

// Rota de busca por data de venda
aiRoutes.get("/reports/daily-sales", ReportController.getDailySales);
