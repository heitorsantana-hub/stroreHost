import { Router } from "express";
import ReportController from "../controllers/ReportController.js";

export const reportsRoutes = Router();

// Rota de Relátorios
reportsRoutes.get("/reports", ReportController.getDashboardData);
reportsRoutes.get("/reports/csv", ReportController.exportCsv);
