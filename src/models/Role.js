import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    index: true,
  },
  //Nome do cargo
  name_role: {
    type: String,
    required: true,
  },
  //Funções do Cargo
  dashboard: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Boolean,
    default: false,
  },
  sales: {
    type: Boolean,
    default: false,
  },
  finance: {
    type: Boolean,
    default: false,
  },
  appointments: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Role", RoleSchema);
