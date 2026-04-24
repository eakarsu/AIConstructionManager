const createCrudRouter = require('./crudFactory');
const columns = ['name', 'description', 'location', 'start_date', 'end_date', 'budget', 'status', 'client', 'manager'];
module.exports = createCrudRouter('projects', columns);
