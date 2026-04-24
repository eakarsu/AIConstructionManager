const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'risk_type', 'description', 'probability', 'impact', 'risk_score', 'mitigation', 'owner', 'status'];
const router = createCrudRouter('risk_assessments', columns);

router.post('/ai-assess', auth, async (req, res) => {
  const { project_name, risk_type, description, project_details } = req.body;
  const systemPrompt = `You are an expert construction risk management consultant. Analyze project risks and provide comprehensive mitigation strategies. Use markdown formatting with clear sections, risk matrices, and actionable plans.`;
  const userPrompt = `Assess risks for this construction project:
Project: ${project_name}
Risk Type: ${risk_type || 'Comprehensive assessment'}
Description: ${description}
Project Details: ${project_details || 'Not specified'}

Please provide:
1. Risk identification and categorization
2. Probability and impact assessment (1-5 scale)
3. Risk matrix visualization (text-based)
4. Mitigation strategies for each risk
5. Contingency plans
6. Risk monitoring recommendations
7. Insurance and bonding considerations`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
