const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'item', 'manufacturer', 'warranty_type', 'start_date', 'end_date', 'duration_years', 'coverage', 'contact_info', 'claim_procedure', 'status', 'notes'];
module.exports = createCrudRouter('warranties', columns);
