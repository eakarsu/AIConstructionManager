const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'category', 'allocated_amount', 'spent_amount', 'remaining', 'period', 'status', 'approved_by', 'notes'];
module.exports = createCrudRouter('budgets', columns);
