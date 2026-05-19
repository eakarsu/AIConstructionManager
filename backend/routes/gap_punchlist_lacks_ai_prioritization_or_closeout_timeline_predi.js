/**
 * Gap Feature: gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi
 * 'punchList' lacks AI prioritization or closeout-timeline prediction.
 *
 * POST /api/gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi
 * Auth required. Generated as part of Gaps backend scaffold (batch_02).
 * Integration credentials: process.env.FEATURE_GAP_PUNCHLIST_LACKS_AI_PRIORITIZATION_OR_CLOSEOUT_TIMELINE_PREDI_KEY
 * TODO: configure credentials
 */
// // === Batch 02 Gaps & Frontend Mounts ===
const express = require('express');
const router = express.Router();
let pool = null; try { pool = require('../db'); } catch (_) { pool = null; }
const auth = require('../middleware/auth');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
const FEATURE_KEY = process.env.FEATURE_GAP_PUNCHLIST_LACKS_AI_PRIORITIZATION_OR_CLOSEOUT_TIMELINE_PREDI_KEY;
const SYSTEM_PROMPT = `You are an expert assistant specialized in: 'punchList' lacks AI prioritization or closeout-timeline prediction..\nGoal: 'punchList' lacks AI prioritization or closeout-timeline prediction.\nRespond with clear, actionable analysis. Prefer JSON when structured output is requested.`;

let _gapTableReady = false;
async function ensureGapTable() {
  if (_gapTableReady) return;
  if (!pool || !pool.query) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS gap_features (
      id SERIAL PRIMARY KEY,
      feature_slug VARCHAR(120) NOT NULL,
      input_data_json TEXT,
      result_json TEXT,
      model_used VARCHAR(120),
      user_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    _gapTableReady = true;
  } catch (_) { /* swallow */ }
}

async function callLLM(userPayload) {
  if (!OPENROUTER_API_KEY) {
    const err = new Error('OPENROUTER_API_KEY not configured');
    err.statusCode = 503;
    throw err;
  }
  const fetchFn = global.fetch || (await import('node-fetch')).default;
  const response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AIConstructionManager - gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: typeof userPayload === 'string' ? userPayload : JSON.stringify(userPayload) },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter error');
  if (!data.choices || !data.choices[0]) throw new Error('Invalid AI response');
  const content = data.choices[0].message.content;
  let parsed;
  try { parsed = JSON.parse(content); } catch (_) {
    const m = content.match(/```json\n?([\s\S]*?)\n?```/);
    try { parsed = m ? JSON.parse(m[1]) : { analysis: content }; } catch (__) { parsed = { analysis: content }; }
  }
  return { result: parsed, model: data.model || OPENROUTER_MODEL, tokens: data.usage?.total_tokens || null };
}

router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Request body is required' });
    }
    if (!FEATURE_KEY) res.set('X-Feature-Credentials-Missing', 'FEATURE_GAP_PUNCHLIST_LACKS_AI_PRIORITIZATION_OR_CLOSEOUT_TIMELINE_PREDI_KEY');
    const ai = await callLLM({ feature: 'gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi', goal: '\'punchList\' lacks AI prioritization or closeout-timeline prediction.', input: payload });
    try {
      await ensureGapTable();
      if (pool && pool.query) {
        await pool.query(
          `INSERT INTO gap_features (feature_slug, input_data_json, result_json, model_used, user_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          ['gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi', JSON.stringify(payload), JSON.stringify(ai.result), ai.model, req.user?.id || null]
        );
      }
    } catch (persistErr) {
      console.warn('[gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi] persistence skipped:', persistErr.message);
    }
    return res.json({
      ok: true,
      feature: 'gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi',
      endpoint: '/api/gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi',
      ai_result: ai.result,
      model: ai.model,
      tokens: ai.tokens,
      user_id: req.user?.id || null,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi] error:', err.message);
    return res.status(err.statusCode || 500).json({ error: err.message || 'Internal error' });
  }
});

router.get('/health', (req, res) => {
  res.json({
    feature: 'gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi',
    endpoint: '/api/gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi',
    openrouter_configured: !!OPENROUTER_API_KEY,
    feature_key_configured: !!FEATURE_KEY,
  });
});

module.exports = router;
