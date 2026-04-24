const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'permit_type', 'issuing_authority', 'application_date', 'approval_date', 'expiry_date', 'status', 'cost', 'notes'];
module.exports = createCrudRouter('permits', columns);
