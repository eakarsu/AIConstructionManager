const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'date_taken', 'location', 'description', 'phase', 'taken_by', 'category', 'weather_conditions', 'tags', 'file_path', 'status', 'notes'];
module.exports = createCrudRouter('progress_photos', columns);
