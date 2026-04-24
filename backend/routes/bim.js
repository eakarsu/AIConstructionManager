const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const columns = ['project_name', 'model_name', 'discipline', 'version', 'clash_count', 'resolved_count', 'author', 'software', 'lod_level', 'file_size', 'last_updated', 'status', 'notes'];
const router = createCrudRouter('bim_models', columns);

router.post('/ai-analyze', auth, async (req, res) => {
  const { project_name, disciplines, clash_description, project_phase } = req.body;
  const systemPrompt = `You are an expert BIM (Building Information Modeling) coordinator with deep knowledge of clash detection, LOD specifications, model federation, and construction technology integration. Provide detailed BIM coordination analysis with markdown formatting.`;
  const userPrompt = `Analyze BIM coordination for:
Project: ${project_name}
Disciplines: ${disciplines || 'Architectural, Structural, MEP'}
Clash Description: ${clash_description || 'General coordination review'}
Project Phase: ${project_phase || 'Not specified'}

Please provide:
1. BIM execution plan recommendations
2. Model federation and coordination workflow
3. Clash detection strategy by discipline pairs
4. LOD (Level of Development) requirements per phase
5. Common clash categories and resolution priorities
6. 4D scheduling integration recommendations
7. 5D cost estimation integration approach
8. Quality assurance checks for model accuracy
9. Data handoff procedures between disciplines
10. Technology stack recommendations (software, hardware)`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
