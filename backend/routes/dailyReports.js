/**
 * Daily Reports — Full CRUD + GET /api/daily-reports/project/:project_name
 */

const express = require('express');
const router = express.Router();
const { aiQuery } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const pool = require('../db');

const COLUMNS = [
  'project_name', 'date', 'weather', 'crew_count', 'work_completed',
  'issues', 'materials_used', 'visitor_log', 'submitted_by',
];

// GET /api/daily-reports — paginated
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const params = [];
    let where = '';
    if (req.query.project_name) {
      params.push(`%${req.query.project_name}%`);
      where = ` WHERE project_name ILIKE $${params.length}`;
    }

    const [result, countResult] = await Promise.all([
      pool.query(`SELECT * FROM daily_reports${where} ORDER BY date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM daily_reports${where}`, params),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/daily-reports/project/:project_name — all reports for a project
router.get('/project/:project_name', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 30));
    const offset = (page - 1) * limit;

    const projectName = decodeURIComponent(req.params.project_name);
    const [result, countResult] = await Promise.all([
      pool.query(
        'SELECT * FROM daily_reports WHERE project_name ILIKE $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
        [`%${projectName}%`, limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM daily_reports WHERE project_name ILIKE $1', [`%${projectName}%`]),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, project: projectName, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/daily-reports/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Daily report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-reports
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.project_name) return res.status(422).json({ error: 'project_name is required' });
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO daily_reports (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/daily-reports/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE daily_reports SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Daily report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/daily-reports/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM daily_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Daily report not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-reports/ai-generate
router.post('/ai-generate', auth, aiRateLimiter, async (req, res) => {
  const { work_completed, project_name } = req.body;
  if (!work_completed) return res.status(422).json({ error: 'work_completed is required' });

  const { date, weather, crew_count, issues, materials_used, equipment_used, visitor_log } = req.body;

  const systemPrompt = `You are a professional construction project manager. Generate well-formatted daily construction reports suitable for owner review and legal documentation.`;
  const userPrompt = `Generate a professional daily construction report:

Project: ${project_name || 'Construction Project'}
Date: ${date || new Date().toLocaleDateString()}
Weather: ${weather || 'Not recorded'}
Crew Count: ${crew_count || 'Not recorded'}
Work Completed: ${work_completed}
Issues/Delays: ${issues || 'None'}
Materials Used: ${materials_used || 'Not recorded'}
Equipment Used: ${equipment_used || 'Not recorded'}
Visitor Log: ${visitor_log || 'None'}

Format as a professional daily report with: Executive Summary, Work Completed, Work In Progress, Issues/RFIs, Safety Observations, Schedule Status, Tomorrow's Plan, Action Items.`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
