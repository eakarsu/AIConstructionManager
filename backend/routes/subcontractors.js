const createCrudRouter = require('./crudFactory');
const columns = ['company_name', 'contact_person', 'email', 'phone', 'specialty', 'project_name', 'contract_value', 'status', 'rating'];
module.exports = createCrudRouter('subcontractors', columns);
