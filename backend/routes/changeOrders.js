const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'title', 'description', 'requested_by', 'cost_impact', 'schedule_impact_days', 'priority', 'status', 'justification'];
const router = createCrudRouter('change_orders', columns);

router.post('/ai-analyze', auth, async (req, res) => {
  const { project_name, title, description, cost_impact, schedule_impact_days } = req.body;
  const systemPrompt = `You are an expert construction change order analyst. Evaluate change orders for their impact on cost, schedule, and project scope. Provide detailed analysis with markdown formatting.`;
  const userPrompt = `Analyze this change order:
Project: ${project_name}
Change Order: ${title}
Description: ${description}
Estimated Cost Impact: $${cost_impact || 'Not specified'}
Schedule Impact: ${schedule_impact_days || 'Not specified'} days

Please provide:
1. Impact assessment (cost, schedule, scope)
2. Risk analysis of approving vs rejecting
3. Alternative approaches to minimize impact
4. Contract and legal implications
5. Recommendation with justification
6. Negotiation strategies for cost reduction`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
