'use strict';
const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db');
const auth = require('../middleware/auth');
const { assertTransition, calculateForecast } = require('../domain/projectControlPolicy');

async function member(client, organizationId, userId) {
  const result = await client.query('SELECT role FROM cm_memberships WHERE organization_id=$1 AND user_id=$2', [organizationId, userId]);
  if (!result.rows.length) throw Object.assign(new Error('Organization membership is required'), { statusCode: 403 });
  return result.rows[0];
}
function fail(res, error) { res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Project-control workflow failed' }); }

router.post('/organizations/:organizationId/projects/:projectId/items', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const organizationId = Number(req.params.organizationId); await member(client, organizationId, req.user.id);
    const { kind, number, title, payload = {}, dueAt } = req.body;
    if (!['rfi','submittal','change','daily_log','inspection','closeout'].includes(kind) || !number || !title) return res.status(400).json({ error: 'Valid kind, number and title are required' });
    await client.query('BEGIN');
    const item = await client.query('INSERT INTO cm_control_items(organization_id,project_id,kind,number,title,due_at,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [organizationId, req.params.projectId, kind, number, title, dueAt || null, req.user.id]);
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    await client.query('INSERT INTO cm_control_revisions(control_item_id,revision,payload,content_hash,created_by) VALUES($1,1,$2,$3,$4)', [item.rows[0].id, payload, hash, req.user.id]);
    await client.query("INSERT INTO cm_audit_events(organization_id,project_id,actor_id,action,entity_type,entity_id,after_state,request_id) VALUES($1,$2,$3,'control.created','control_item',$4,$5,$6)", [organizationId, req.params.projectId, req.user.id, item.rows[0].id, item.rows[0], req.get('x-request-id') || null]);
    await client.query('COMMIT'); res.status(201).json(item.rows[0]);
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); fail(res, error); } finally { client.release(); }
});

router.post('/items/:id/transition', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT * FROM cm_control_items WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!found.rows.length) throw Object.assign(new Error('Control item not found'), { statusCode: 404 });
    const item = found.rows[0]; const membership = await member(client, item.organization_id, req.user.id);
    assertTransition(item.status, req.body.toStatus, membership.role);
    const result = await client.query('UPDATE cm_control_items SET status=$1,current_revision=current_revision+1 WHERE id=$2 AND current_revision=$3 RETURNING *', [req.body.toStatus, item.id, req.body.version]);
    if (!result.rows.length) throw Object.assign(new Error('Control item version conflict'), { statusCode: 409 });
    const signature = ['approved','verified'].includes(req.body.toStatus) ? crypto.createHash('sha256').update(`${item.id}|${req.body.toStatus}|${req.user.id}|${result.rows[0].current_revision}`).digest('hex') : null;
    await client.query('INSERT INTO cm_approvals(control_item_id,from_status,to_status,actor_id,actor_role,signature_digest,rationale) VALUES($1,$2,$3,$4,$5,$6,$7)', [item.id, item.status, req.body.toStatus, req.user.id, membership.role, signature, req.body.rationale || null]);
    await client.query("INSERT INTO cm_audit_events(organization_id,project_id,actor_id,action,entity_type,entity_id,before_state,after_state) VALUES($1,$2,$3,'control.transitioned','control_item',$4,$5,$6)", [item.organization_id, item.project_id, req.user.id, item.id, item, result.rows[0]]);
    await client.query('COMMIT'); res.json(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); fail(res, error); } finally { client.release(); }
});

router.post('/organizations/:organizationId/projects/:projectId/cost-snapshots', auth, async (req, res) => {
  try {
    const organizationId = Number(req.params.organizationId); const membership = await member(pool, organizationId, req.user.id);
    if (!['manager','admin'].includes(membership.role)) return res.status(403).json({ error: 'Manager role is required' });
    const forecast = calculateForecast(req.body);
    const result = await pool.query(`INSERT INTO cm_cost_snapshots(organization_id,project_id,as_of,budget,committed,actual,pending_changes,remaining_estimate,source_refs,created_by)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [organizationId, req.params.projectId, req.body.asOf, req.body.budget, req.body.committed, req.body.actual, req.body.pendingChanges, req.body.remainingEstimate, req.body.sourceRefs || [], req.user.id]);
    res.status(201).json({ ...result.rows[0], forecast });
  } catch (error) { fail(res, error); }
});

module.exports = router;
