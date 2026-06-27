import dotenv from "dotenv";
dotenv.config();

async function descobrirModelos() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("❌ Chave API não encontrada no .env!");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    console.log("⏳ Consultando os servidores do Google...");
    const response = await fetch(url);
    const data = await response.json();

    console.log(
      "\n✅ Modelos que a SUA chave tem permissão para usar neste projeto:",
    );

    // Filtra apenas os modelos que servem para gerar texto (generateContent)
    const modelosParaTexto = data.models.filter((m) =>
      m.supportedGenerationMethods.includes("generateContent"),
    );

    modelosParaTexto.forEach((m) => {
      // O Google devolve algo como "models/gemini-pro", nós cortamos a palavra "models/"
      console.log(`👉 ${m.name.replace("models/", "")}`);
    });

    console.log(
      "\nCopie um dos nomes acima (exatamente como está escrito) e cole no seu AiController.js!",
    );
  } catch (err) {
    console.error("Erro ao consultar a API:", err);
  }
}

descobrirModelos();
