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
    quantity: {
      type: Number,
      required: true,
      min: 1, // Ninguém pode movimentar 0 ou quantidades negativas
    },
  },
  {
    timestamps: true, // Salva a data e hora exata da movimentação
  },
);

export default mongoose.model("StockMovement", StockMovementSchema);
