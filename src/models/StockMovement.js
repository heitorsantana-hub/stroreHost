import mongoose from "mongoose";

const StockMovementSchema = new mongoose.Schema(
  {
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // --- ATUALIZADO: PERMITE DECIMAIS ---
    quantity: {
      type: Number,
      required: true,
      min: 0.001, // Alterado de 1 para 0.001 para permitir vender gramas/ml
    },

    type: {
      type: String,
      enum: ["in", "out"],
      required: true,
      default: "in",
    },
    reason: {
      type: String,
      enum: ["compra", "venda", "devolucao", "ajuste", "perda_validade"],
      required: true,
    },

    // --- NOVO: RASTREIO FINANCEIRO DA MOVIMENTAÇÃO ---
    unit_value: {
      type: Number,
      min: 0,
      // Representa o custo de 1 unidade/KG nesta transação específica.
      // (Não é required para todos, pois um "ajuste" pode não envolver dinheiro novo)
    },
    total_value: {
      type: Number,
      min: 0,
      // É a multiplicação de quantity * unit_value.
      // Salvar isso direto no banco acelera MUITO a geração de relatórios!
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("StockMovement", StockMovementSchema);
