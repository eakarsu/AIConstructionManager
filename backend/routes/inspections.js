const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'inspector', 'type', 'date_scheduled', 'date_completed', 'result', 'notes', 'status', 'follow_up_required'];
module.exports = createCrudRouter('inspections', columns);
