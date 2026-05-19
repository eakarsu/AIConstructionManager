/**
 * Change Orders — Full CRUD + status workflow
 * Status: submitted → under_review → approved / rejected
 */

const express = require('express');
const router = express.Router();
const { aiQuery } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const pool = require('../db');

const TABLE = 'change_orders';
const COLUMNS = [
  'project_name', 'title', 'description', 'requested_by',
  'cost_impact', 'schedule_impact_days', 'priority', 'status', 'justification',
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
      pool.query(`SELECT * FROM ${TABLE}${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM ${TABLE}${where}`, params),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
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
    if (!req.body.title) return res.status(422).json({ error: 'title is required' });
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    if (!req.body.status && !cols.includes('status')) {
      cols.push('status');
      req.body.status = 'submitted';
    }
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

// ─── PATCH /:id/status — status workflow ──────────────────────────────────────
const VALID_TRANSITIONS = {
  submitted: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: [],
  rejected: ['submitted'],
};

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(422).json({ error: 'status is required' });

    const current = await pool.query('SELECT status FROM change_orders WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Change order not found' });

    const currentStatus = current.rows[0].status || 'submitted';
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(422).json({
        error: `Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
      });
    }

    const result = await pool.query(
      'UPDATE change_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Analysis ──────────────────────────────────────────────────────────────
router.post('/ai-analyze', auth, aiRateLimiter, async (req, res) => {
  const { project_name, title, description, cost_impact, schedule_impact_days } = req.body;
  if (!description) return res.status(422).json({ error: 'description is required' });

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
