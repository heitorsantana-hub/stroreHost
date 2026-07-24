import { app } from "./src/app.js";
const port = 8989;

// Rodando o servidor
app.listen(port, (req, res) => {
  console.log(`Servidor rodando: http://localhost:8989/`);
});
