const createCrudRouter = require('./crudFactory');
const columns = ['project_name', 'meeting_type', 'date', 'location', 'attendees', 'agenda', 'discussion', 'action_items', 'decisions', 'next_meeting_date', 'recorded_by', 'status'];
module.exports = createCrudRouter('meeting_minutes', columns);
