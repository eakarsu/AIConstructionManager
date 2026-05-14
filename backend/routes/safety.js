/**
 * Safety — Full CRUD for safety observations, incidents, toolbox talks
 * Tables: safety_incidents, safety_observations, toolbox_talks
 */

const express = require('express');
const router = express.Router();
const createCrudRouter = require('./crudFactory');
const { aiQuery } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const pool = require('../db');

// ─── Safety Incidents (primary resource) ─────────────────────────────────────
const incidentColumns = [
  'project_name', 'incident_type', 'description', 'severity',
  'location', 'reported_by', 'date_reported', 'status', 'corrective_action',
];
const incidentRouter = createCrudRouter('safety_incidents', incidentColumns);

// Paginated list override
router.get('/incidents', auth, async (req, res) => {
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
    if (req.query.severity) {
      params.push(req.query.severity);
      where += where ? ` AND severity = $${params.length}` : ` WHERE severity = $${params.length}`;
    }

    const [result, countResult] = await Promise.all([
      pool.query(`SELECT * FROM safety_incidents${where} ORDER BY date_reported DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM safety_incidents${where}`, params),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/incidents/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM safety_incidents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/incidents', auth, async (req, res) => {
  try {
    const cols = incidentColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO safety_incidents (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/incidents/:id', auth, async (req, res) => {
  try {
    const cols = incidentColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE safety_incidents SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/incidents/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM safety_incidents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Safety Observations ──────────────────────────────────────────────────────
const observationColumns = [
  'project_name', 'observer', 'observation_type', 'description',
  'location', 'severity', 'date_observed', 'status', 'corrective_action', 'due_date',
];

router.get('/observations', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM safety_observations ORDER BY date_observed DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM safety_observations'),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/observations/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM safety_observations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Observation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/observations', auth, async (req, res) => {
  try {
    const cols = observationColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO safety_observations (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/observations/:id', auth, async (req, res) => {
  try {
    const cols = observationColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE safety_observations SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Observation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/observations/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM safety_observations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Observation not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Toolbox Talks ────────────────────────────────────────────────────────────
const toolboxColumns = [
  'project_name', 'topic', 'presenter', 'date_conducted',
  'attendee_count', 'duration_minutes', 'notes', 'status',
];

router.get('/toolbox-talks', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM toolbox_talks ORDER BY date_conducted DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM toolbox_talks'),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/toolbox-talks/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM toolbox_talks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Toolbox talk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/toolbox-talks', auth, async (req, res) => {
  try {
    const cols = toolboxColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO toolbox_talks (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/toolbox-talks/:id', auth, async (req, res) => {
  try {
    const cols = toolboxColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE toolbox_talks SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Toolbox talk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/toolbox-talks/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM toolbox_talks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Toolbox talk not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Legacy root GET / POST / PUT / DELETE (safety_incidents, for backward compat) ──
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM safety_incidents ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM safety_incidents'),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM safety_incidents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const cols = incidentColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO safety_incidents (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const cols = incidentColumns.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE safety_incidents SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM safety_incidents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Analysis ──────────────────────────────────────────────────────────────
router.post('/ai-analyze', auth, aiRateLimiter, async (req, res) => {
  const { project_name, incident_type, description, location } = req.body;
  if (!description) return res.status(422).json({ error: 'description is required' });

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
