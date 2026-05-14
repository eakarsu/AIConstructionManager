/**
 * RFIs — Full CRUD + status workflow (open → answered → closed)
 */

const express = require('express');
const router = express.Router();
const { aiQuery } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const pool = require('../db');

const RFI_COLUMNS = [
  'project_name', 'rfi_number', 'subject', 'question', 'submitted_by',
  'assigned_to', 'date_submitted', 'date_due', 'date_responded',
  'response', 'priority', 'status', 'cost_impact',
];

// GET /api/rfis — paginated
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
    if (req.query.status) {
      params.push(req.query.status);
      where += where ? ` AND status = $${params.length}` : ` WHERE status = $${params.length}`;
    }

    const [result, countResult] = await Promise.all([
      pool.query(`SELECT * FROM rfis${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM rfis${where}`, params),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rfis/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rfis WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'RFI not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rfis
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.subject || !req.body.question) {
      return res.status(422).json({ error: 'subject and question are required' });
    }
    const cols = RFI_COLUMNS.filter((c) => req.body[c] !== undefined);
    // Default status to 'open'
    if (!req.body.status && !cols.includes('status')) {
      cols.push('status');
      req.body.status = 'open';
    }
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO rfis (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/rfis/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const cols = RFI_COLUMNS.filter((c) => req.body[c] !== undefined);
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE rfis SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'RFI not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/rfis/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rfis WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'RFI not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/rfis/:id/status — status workflow: open → answered → closed
const VALID_RFI_TRANSITIONS = {
  open: ['answered'],
  answered: ['closed', 'open'],
  closed: [],
};

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, response, date_responded } = req.body;
    if (!status) return res.status(422).json({ error: 'status is required' });

    const current = await pool.query('SELECT status FROM rfis WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'RFI not found' });

    const currentStatus = current.rows[0].status || 'open';
    const allowed = VALID_RFI_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(422).json({
        error: `Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
      });
    }

    const updates = { status };
    if (status === 'answered' && response) {
      updates.response = response;
      updates.date_responded = date_responded || new Date().toISOString().split('T')[0];
    }

    const cols = Object.keys(updates);
    const vals = Object.values(updates);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);

    const result = await pool.query(
      `UPDATE rfis SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
