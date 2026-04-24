const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'inspection_area', 'inspector', 'date', 'standard', 'result', 'defects_found', 'corrective_action', 'status'];
module.exports = createCrudRouter('quality_control', columns);
