const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'contract_number', 'title', 'contractor', 'contract_type', 'original_value', 'revised_value', 'start_date', 'end_date', 'retainage_pct', 'status', 'signed_date', 'notes'];
module.exports = createCrudRouter('contracts', columns);
