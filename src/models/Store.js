import { Schema, model } from "mongoose";

const StoreSchema = new Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: String,
  cnpj: String,
  primaryColor: {
    type: String,
    default: "#2563EB",
  },
  logoUrl: { type: String, default: "" },

  // NOVOS CAMPOS PARA O ONBOARDING COM IA
  onboardingCompleted: { type: Boolean, default: false },
  diagnostic: { type: String, default: "" },
});

export default model("Store", StoreSchema);
