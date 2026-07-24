import { Router } from "express";
import SessionDashboard from "../controllers/SessionDashboard.js";
import AiController from "../controllers/AiController.js";
import multer from "multer";

export const dashboardRoutes = Router();

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

dashboardRoutes.get("/", SessionDashboard.index);

// Rota para configuração de personalização do sistema
dashboardRoutes.post(
  "/settings",
  upload.single("logo"),
  SessionDashboard.updateSettings,
);

// Rota para a IA (Note que é um GET, pois vamos chamar via Fetch no Front-end)
dashboardRoutes.get("/ai-report", AiController.generateReport);

// Rota para baixar o pdf da IA
dashboardRoutes.post("/ai-report/download", AiController.downloadReport);
