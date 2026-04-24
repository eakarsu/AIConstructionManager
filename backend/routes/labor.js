const createCrudRouter = require('./crudFactory');
const columns = ['worker_name', 'role', 'project_name', 'hourly_rate', 'hours_worked', 'total_pay', 'start_date', 'status', 'skills'];
module.exports = createCrudRouter('labor', columns);
