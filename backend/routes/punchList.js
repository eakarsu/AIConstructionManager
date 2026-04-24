const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'item_number', 'location', 'description', 'category', 'assigned_to', 'date_identified', 'date_due', 'date_completed', 'priority', 'status', 'notes'];
module.exports = createCrudRouter('punch_list', columns);
