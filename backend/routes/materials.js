const createCrudRouter = require('./crudFactory');
const columns = ['name', 'category', 'quantity', 'unit', 'unit_cost', 'total_cost', 'supplier', 'status', 'project_name'];
module.exports = createCrudRouter('materials', columns);
