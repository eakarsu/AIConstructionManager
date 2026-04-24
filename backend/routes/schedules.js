const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'task_name', 'start_date', 'end_date', 'duration_days', 'dependencies', 'assigned_to', 'status', 'priority'];
const router = createCrudRouter('schedules', columns);

router.post('/ai-optimize', auth, async (req, res) => {
  const { project_name, tasks, deadline, constraints } = req.body;
  const systemPrompt = `You are an expert construction project scheduler and optimizer. Analyze schedules and provide optimized timelines using critical path methodology. Format responses with clear markdown headers, timelines, and actionable recommendations.`;
  const userPrompt = `Optimize the construction schedule for:
Project: ${project_name}
Tasks: ${tasks || 'General construction tasks'}
Deadline: ${deadline || 'Not specified'}
Constraints: ${constraints || 'None specified'}

Please provide:
1. Optimized task sequence with dependencies
2. Critical path analysis
3. Resource leveling recommendations
4. Potential bottlenecks and mitigation strategies
5. Suggested milestones and checkpoints
6. Float analysis for non-critical tasks`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
