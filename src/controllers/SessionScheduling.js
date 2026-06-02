import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';

class SessionScheduling {
  // Carrega a página da agenda com os dados do banco
  async index(req, res) {
    try {
      const schedules = await Schedule.find().lean();
      const employees = await Employee.find().lean();
      
      return res.render('scheduling', { 
        schedules, 
        employees,
        layout: 'dashboard' 
      });
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      return res.status(500).send("Erro interno do servidor.");
    }
  }

  // Cria um novo agendamento
  async create(req, res) {
    try {
      const { employee_id, scheduled_date, scheduled_time, service_type, customer_name, customer_phone, notes } = req.body;
      
      // Busca o nome do funcionário para salvar junto no card
      const employee = await Employee.findById(employee_id);
      const employee_name = employee ? employee.name : 'Não informado';

      await Schedule.create({
        employee_id,
        employee_name,
        scheduled_date,
        scheduled_time,
        service_type,
        customer_name,
        customer_phone,
        notes,
        status: 'Pendente' // Todo agendamento nasce pendente
      });

      return res.redirect('/dashboard/scheduling');
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return res.status(500).send("Erro ao salvar agendamento.");
    }
  }

  // Atualiza o agendamento (Edição)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { scheduled_date, scheduled_time, service_type, customer_name, customer_phone, status } = req.body;

      await Schedule.findByIdAndUpdate(id, {
        scheduled_date,
        scheduled_time,
        service_type,
        customer_name,
        customer_phone,
        status
      });

      return res.redirect('/dashboard/scheduling');
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      return res.status(500).send("Erro ao atualizar.");
    }
  }

  // Deleta um agendamento
  async delete(req, res) {
    try {
      const { schedule_id } = req.body;
      await Schedule.findByIdAndDelete(schedule_id);
      return res.redirect('/dashboard/scheduling');
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      return res.status(500).send("Erro ao deletar.");
    }
  }
}

export default new SessionScheduling();