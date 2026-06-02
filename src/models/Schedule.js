import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employee_name: {
    type: String,
    required: true
  },
  scheduled_date: {
    type: Date,
    required: true
  },
  scheduled_time: {
    type: String, // Guardado como "14:30"
    required: true
  },
  service_type: {
    type: String,
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  customer_phone: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['Pendente', 'Confirmado', 'Concluído', 'Cancelado'],
    default: 'Pendente'
  }
}, { timestamps: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;