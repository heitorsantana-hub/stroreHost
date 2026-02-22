import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    // 1. Vínculo com a Loja (Regra de Ouro)
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // 2. Dados exatos do seu formulário HTML (Atributos 'name')
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true, // Padroniza para evitar erros de login com letras maiúsculas
      trim: true,
    },
    password: {
      type: String,
      required: true, // Lembrete: Criptografar com bcrypt no Controller antes de salvar!
    },

    // 3. Dados da Tabela
    cargo: {
      type: String,
      default: "Operador de Estoque", // Valor padrão já que o formulário atual não tem esse <select>
    },
  },
  {
    timestamps: true, // Cria a data de admissão (createdAt) automaticamente
  },
);

export default mongoose.model("Employee", EmployeeSchema);
