/**
 * Budgets — Full CRUD + GET /api/budgets/:id/variance
 */

const express = require('express');
const router = express.Router();
const { aiQuery } = require('../openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const pool = require('../db');

const COLUMNS = [
  'project_name', 'category', 'allocated_amount', 'spent_amount',
  'remaining', 'period', 'status', 'approved_by', 'notes',
];

// GET /api/budgets — paginated
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
      pool.query(`SELECT * FROM budgets${where} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) FROM budgets${where}`, params),
    ]);
    const total = parseInt(countResult.rows[0].count, 10);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/budgets/:id/variance — budget variance analysis
router.get('/:id/variance', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budgets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });

    const budget = result.rows[0];
    const allocated = Number(budget.allocated_amount || 0);
    const spent = Number(budget.spent_amount || 0);
    const remaining = Number(budget.remaining ?? (allocated - spent));
    const variance = allocated - spent;
    const variancePct = allocated > 0 ? ((variance / allocated) * 100).toFixed(2) : null;
    const burnRate = allocated > 0 ? ((spent / allocated) * 100).toFixed(2) : null;
    const status = variance < 0 ? 'over_budget' : variance === 0 ? 'on_budget' : 'under_budget';

    // Get all budget lines for same project for comparison
    const projectBudgets = await pool.query(
      'SELECT * FROM budgets WHERE project_name = $1',
      [budget.project_name]
    );
    const totalAllocated = projectBudgets.rows.reduce((s, b) => s + Number(b.allocated_amount || 0), 0);
    const totalSpent = projectBudgets.rows.reduce((s, b) => s + Number(b.spent_amount || 0), 0);

    res.json({
      budget,
      variance: {
        amount: variance,
        percentage: variancePct ? parseFloat(variancePct) : null,
        status,
        burn_rate_pct: burnRate ? parseFloat(burnRate) : null,
        remaining_amount: remaining,
      },
      project_totals: {
        project_name: budget.project_name,
        total_allocated: totalAllocated,
        total_spent: totalSpent,
        total_variance: totalAllocated - totalSpent,
        total_variance_pct: totalAllocated > 0 ? parseFloat(((totalAllocated - totalSpent) / totalAllocated * 100).toFixed(2)) : null,
        budget_lines: projectBudgets.rows.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/budgets/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budgets WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.project_name || !req.body.category) {
      return res.status(422).json({ error: 'project_name and category are required' });
    }
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    // Auto-calculate remaining if not provided
    if (!req.body.remaining && req.body.allocated_amount && req.body.spent_amount !== undefined) {
      cols.push('remaining');
      req.body.remaining = Number(req.body.allocated_amount) - Number(req.body.spent_amount);
    }
    const vals = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await pool.query(
      `INSERT INTO budgets (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`,
      vals
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/budgets/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const cols = COLUMNS.filter((c) => req.body[c] !== undefined);
    // Auto-calculate remaining
    if (req.body.allocated_amount !== undefined && req.body.spent_amount !== undefined) {
      if (!req.body.remaining) {
        if (!cols.includes('remaining')) cols.push('remaining');
        req.body.remaining = Number(req.body.allocated_amount) - Number(req.body.spent_amount);
      }
    }
    const vals = cols.map((c) => req.body[c]);
    const sets = cols.map((c, i) => `${c}=$${i + 1}`);
    vals.push(req.params.id);
    const result = await pool.query(
      `UPDATE budgets SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets/ai-forecast
router.post('/ai-forecast', auth, aiRateLimiter, async (req, res) => {
  const { project_name, budget_data } = req.body;
  if (!project_name) return res.status(422).json({ error: 'project_name is required' });

  const systemPrompt = `You are an expert construction financial analyst specializing in budget forecasting and cost control.`;
  const userPrompt = `Analyze this project budget and provide a forecast:
Project: ${project_name}
Budget Data: ${budget_data ? JSON.stringify(budget_data, null, 2) : 'Fetch from current records'}

Please provide:
1. Current budget health assessment
2. Burn rate analysis and trend
3. Cost-at-completion forecast (EAC)
4. Variance analysis by category
5. Areas of concern (potential overruns)
6. Cost recovery recommendations
7. Cash flow forecast for remaining project`;

  const aiResult = await aiQuery(systemPrompt, userPrompt);
  res.json(aiResult);
});

module.exports = router;
