const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'date', 'weather', 'crew_count', 'work_completed', 'issues', 'materials_used', 'visitor_log', 'submitted_by'];
module.exports = createCrudRouter('daily_reports', columns);
