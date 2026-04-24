const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'worker_name', 'role', 'date', 'start_time', 'end_time', 'hours_regular', 'hours_overtime', 'break_hours', 'task_description', 'approved_by', 'status'];
module.exports = createCrudRouter('timesheets', columns);
