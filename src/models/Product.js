import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
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

    // --- NOVO: UNIDADE DE MEDIDA E TAGS ---
    unit_of_measure: {
      type: String,
      enum: ["UN", "KG", "LT", "CX"], // Unidade, Quilo, Litro, Caixa
      default: "UN",
      required: true,
    },
    tags: [
      {
        type: String, // Permite salvar ["vegano", "promoção", "churrasco"]
        trim: true,
      },
    ],
    barcode: {
      type: String, // Serve tanto para código de barras EAN quanto para QR Code
      trim: true,
      index: true, // Facilita a busca rápida com o leitor
    },

    // --- NOVO: FINANCEIRO (CUSTOS E VENDA) ---
    cost_price: {
      type: Number,
      required: true,
      min: 0, // Quanto você pagou no fornecedor
    },
    taxes: {
      type: Number,
      default: 0, // Impostos incidentes (pode ser porcentagem ou valor fixo, você define na lógica)
    },
    price: {
      // Este é o seu preço de VENDA atual
      type: Number,
      required: true,
      min: 0,
    },

    // --- NOVO: GESTÃO DE ESTOQUE E NÍVEIS CRÍTICOS ---
    current_stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    min_stock: {
      type: Number,
      default: 5, // Abaixo disso, o sistema alerta
      min: 0,
    },
    max_stock: {
      type: Number,
      default: 100, // Teto máximo para não lotar o estoque
      min: 0,
    },
    image_url: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", ProductSchema);
