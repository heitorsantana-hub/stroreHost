import { Schema, model } from "mongoose";

const StoreSchema = new Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: String,
  cnpj: String,
  // NOVO: Campo de cor para o White-Label Dinâmico
  primaryColor: {
    type: String,
    default: "#2563EB", // Azul padrão do StoreHost
  },
  logoUrl: { type: String, default: "" },
});

export default model("Store", StoreSchema);
