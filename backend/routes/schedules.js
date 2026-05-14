/**
 * Schedules — Full CRUD + GET /api/schedules/:id/critical-path
 */

const express = require('express');
const router = express.Router();
const { aiQuery } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const pool = require('../db');

const TABLE = 'schedules';
const COLUMNS = [
  'project_name', 'task_name', 'start_date', 'end_date',
  'duration_days', 'dependencies', 'assigned_to', 'status', 'priority',
];

// ─── GET / — paginated ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const params = [];
    const conditions = [];
    if (req.query.project_name) {
      params.push(`%${req.query.project_name}%`);
      conditions.push(`project_name ILIKE $${params.length}`);
    }
    if (req.query.status) {
      params.push(req.query.status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const [result, countResult] = await Promise.all([
      pool.query(`SELECT * FROM ${TABLE}${where} ORDER BY start_date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM ${TABLE}${where}`, params),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /:id/critical-path — MUST be before /:id ────────────────────────────
router.get('/:id/critical-path', auth, aiRateLimiter, async (req, res) => {
  try {
    const taskResult = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [req.params.id]);
    if (taskResult.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });

    const task = taskResult.rows[0];
    const allTasksResult = await pool.query(
      `SELECT * FROM ${TABLE} WHERE project_name = $1 ORDER BY start_date ASC`,
      [task.project_name]
    );

    const systemPrompt = `You are an expert CPM (Critical Path Method) scheduling analyst for construction projects.`;
    const userPrompt = `Analyze the critical path for this project schedule:

Focused Task:
${JSON.stringify(task, null, 2)}

All Project Tasks:
${JSON.stringify(allTasksResult.rows, null, 2)}

Please provide:
1. Critical path identification (list of tasks that form the critical path)
2. Float/slack analysis for each task
3. Which tasks, if delayed, will delay the project completion date
4. Recommended schedule optimization
5. Resource conflict analysis`;

    const aiResult = await aiQuery(systemPrompt, userPrompt);
    res.json({ task, all_tasks: allTasksResult.rows, critical_path_analysis: aiResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id=$1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST / ───────────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.project_name || !req.body.task_name) {
      return res.status(422).json({ error: 'project_name and task_name are required' });
    }
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO ${TABLE} (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE ${TABLE} SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM ${TABLE} WHERE id=$1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /ai-optimize ────────────────────────────────────────────────────────
router.post('/ai-optimize', auth, aiRateLimiter, async (req, res) => {
  const { project_name, tasks, deadline, constraints } = req.body;
  if (!project_name) return res.status(422).json({ error: 'project_name is required' });

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
