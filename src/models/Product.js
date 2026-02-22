import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // 1. A Regra de Ouro: Isolamento por Loja (Multi-tenant)
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true, // Cria um índice para buscas mais rápidas no banco
    },

    // 2. Dados do Catálogo (Estáticos)
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Preço não pode ser negativo
    },
    current_stock: {
      type: Number,
      default: 0, // Todo produto novo nasce com 0 no estoque
      min: 0, // Proteção extra: o estoque nunca pode ficar negativo no banco
    },
  },
  {
    // 5. Rastreabilidade automática
    timestamps: true, // Cria automaticamente os campos createdAt e updatedAt
  },
);

export default mongoose.model("Product", ProductSchema);
