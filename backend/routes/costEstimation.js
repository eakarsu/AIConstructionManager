const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'description', 'category', 'estimated_cost', 'actual_cost', 'variance', 'status', 'estimator', 'notes'];
const router = createCrudRouter('cost_estimations', columns);

router.post('/ai-estimate', auth, async (req, res) => {
  const { project_name, description, category, square_footage, location } = req.body;
  const systemPrompt = `You are an expert construction cost estimator with 30+ years of experience. Provide detailed, professional cost breakdowns for construction projects. Format your response with clear sections using markdown headers (##), bullet points, and tables where appropriate. Include line items with estimated costs. Always provide a total estimated cost range.`;
  const userPrompt = `Estimate the construction cost for:
Project: ${project_name}
Description: ${description}
Category: ${category}
Square Footage: ${square_footage || 'Not specified'}
Location: ${location || 'Not specified'}

Please provide:
1. Detailed cost breakdown by category (materials, labor, equipment, permits, overhead)
2. Cost per square foot analysis
3. Risk factors that could affect the estimate
4. Recommendations for cost savings
5. Total estimated cost range (low/medium/high)`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
