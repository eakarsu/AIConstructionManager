const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'rfi_number', 'subject', 'question', 'submitted_by', 'assigned_to', 'date_submitted', 'date_due', 'date_responded', 'response', 'priority', 'status', 'cost_impact'];
module.exports = createCrudRouter('rfis', columns);
