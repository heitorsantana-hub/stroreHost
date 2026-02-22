import { Schema, model } from "mongoose";

const StoreSchema = new Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: String,
  cnpj: String,
});

export default model("Store", StoreSchema); //Primeiro argumento nome do Model, Segundo Argumento esquema do Model
