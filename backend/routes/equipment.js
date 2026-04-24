const createCrudRouter = require('./crudFactory');
const columns = ['name', 'type', 'serial_number', 'project_name', 'daily_rate', 'status', 'operator', 'condition_rating', 'next_maintenance'];
module.exports = createCrudRouter('equipment', columns);
