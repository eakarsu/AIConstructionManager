const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'submittal_number', 'title', 'spec_section', 'submitted_by', 'reviewer', 'date_submitted', 'date_required', 'date_returned', 'result', 'revision', 'status', 'notes'];
module.exports = createCrudRouter('submittals', columns);
