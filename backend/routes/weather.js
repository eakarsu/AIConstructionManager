const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'date', 'condition', 'temperature', 'wind_speed', 'precipitation', 'impact_level', 'work_status', 'notes'];
const router = createCrudRouter('weather_impacts', columns);

router.post('/ai-analyze', auth, async (req, res) => {
  const { project_name, location, season, project_type } = req.body;
  const systemPrompt = `You are an expert construction weather impact analyst. Analyze how weather conditions affect construction projects and provide mitigation strategies. Use markdown formatting with clear sections and actionable recommendations.`;
  const userPrompt = `Analyze weather impact for:
Project: ${project_name}
Location: ${location || 'Not specified'}
Season: ${season || 'Not specified'}
Project Type: ${project_type || 'General construction'}

Please provide:
1. Weather risk assessment for the location/season
2. Impact on different construction activities
3. Seasonal planning recommendations
4. Weather delay mitigation strategies
5. Safety protocols for adverse weather
6. Schedule buffer recommendations
7. Material protection measures`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
