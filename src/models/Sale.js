import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    // 1. Isolamento Multi-tenant (A Venda pertence à Loja)
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // 2. Referência ao Catálogo
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // 3. O Snapshot (Fotografia dos dados no momento da venda)
    // Se o gerente mudar o nome ou preço do produto no futuro, este recibo fica intacto.
    product_name: {
      type: String,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
    },

    // 4. Dados da Transação Financeira (Vêm do formulário HTML)
    quantity: {
      type: Number,
      required: true,
      min: 1, // Não existe venda de 0 itens ou itens negativos
    },
    total_price: {
      type: Number,
      required: true, // Será calculado no Controller: quantity * unit_price
    },
    payment_method: {
      type: String,
      enum: ["Pix", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"],
      required: true,
    },
    status: {
      type: String,
      default: "Concluída", // Futuramente você pode ter "Cancelada" ou "Reembolsada"
    },
  },
  {
    // O Mongoose cria automaticamente o campo "createdAt" que será a Data da Venda
    timestamps: true,
  },
);

export default mongoose.model("Sale", SaleSchema);
