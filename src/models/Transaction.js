import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    // 1. Isolamento Multi-tenant (A transação pertence exclusivamente a uma loja)
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // 2. Tipo de Movimentação (Restrito a duas opções para evitar erros no banco)
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    // 3. Detalhes Operacionais
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // 4. Valor Financeiro
    amount: {
      type: Number,
      required: true,
      min: 0.01, // Impede que sejam lançadas transações com valor zero ou negativo
    },
  },
  {
    // 5. Auditoria de Data
    // O Mongoose cria o "createdAt" automaticamente, que será a data oficial do lançamento
    timestamps: true,
  },
);

export default mongoose.model("Transaction", TransactionSchema);
