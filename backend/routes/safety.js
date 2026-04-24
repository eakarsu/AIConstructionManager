const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'incident_type', 'description', 'severity', 'location', 'reported_by', 'date_reported', 'status', 'corrective_action'];
const router = createCrudRouter('safety_incidents', columns);

router.post('/ai-analyze', auth, async (req, res) => {
  const { project_name, incident_type, description, location } = req.body;
  const systemPrompt = `You are an expert construction safety officer and OSHA compliance specialist. Analyze safety incidents, identify root causes, and provide detailed compliance recommendations. Format your response professionally with markdown headers and bullet points.`;
  const userPrompt = `Analyze this safety concern:
Project: ${project_name}
Incident Type: ${incident_type || 'General safety review'}
Description: ${description}
Location: ${location || 'Not specified'}

Please provide:
1. Risk assessment and severity classification
2. OSHA compliance requirements applicable
3. Root cause analysis
4. Immediate corrective actions required
5. Long-term preventive measures
6. Required safety training recommendations
7. Documentation and reporting requirements`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
