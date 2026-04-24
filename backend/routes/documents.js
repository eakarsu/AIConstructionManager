const createCrudRouter = require('./crudFactory');
const columns = ['title', 'type', 'project_name', 'uploaded_by', 'description', 'version', 'status', 'file_path', 'tags'];
module.exports = createCrudRouter('documents', columns);
