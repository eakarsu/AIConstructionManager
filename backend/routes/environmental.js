const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'compliance_type', 'regulation', 'description', 'monitoring_date', 'result', 'inspector', 'corrective_action', 'deadline', 'agency', 'status', 'notes'];
const router = createCrudRouter('environmental_compliance', columns);

router.post('/ai-analyze', auth, async (req, res) => {
  const { project_name, compliance_type, description, location, project_type } = req.body;
  const systemPrompt = `You are an expert environmental compliance officer for construction projects with deep knowledge of EPA, NEPA, Clean Water Act, Clean Air Act, RCRA, and state environmental regulations. Provide detailed compliance analysis with markdown formatting.`;
  const userPrompt = `Analyze environmental compliance for:
Project: ${project_name}
Compliance Type: ${compliance_type || 'Comprehensive review'}
Description: ${description}
Location: ${location || 'Not specified'}
Project Type: ${project_type || 'General construction'}

Please provide:
1. Applicable federal environmental regulations
2. State and local environmental requirements
3. Required environmental permits and approvals
4. Stormwater pollution prevention plan (SWPPP) requirements
5. Air quality and dust control measures
6. Noise and vibration limits
7. Wetland and endangered species considerations
8. Waste management and disposal requirements
9. Environmental monitoring schedule
10. Potential penalties for non-compliance`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
