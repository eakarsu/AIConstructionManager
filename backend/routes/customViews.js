// Custom Views routes for AI Construction Manager
// Provides: schedule Gantt, budget burndown, punch list PDF, WBS hierarchy CRUD
const express = require('express');
const router = express.Router();

// In-memory WBS store (seeded with sample task hierarchy)
let _wbsSeq = 100;
const wbs = [
  { id: 1, parent_id: null, code: '1', name: 'Foundation', trade: 'Civil', duration_days: 14, status: 'completed', percent_complete: 100 },
  { id: 2, parent_id: 1, code: '1.1', name: 'Site Excavation', trade: 'Civil', duration_days: 5, status: 'completed', percent_complete: 100 },
  { id: 3, parent_id: 1, code: '1.2', name: 'Concrete Pour', trade: 'Concrete', duration_days: 9, status: 'completed', percent_complete: 100 },
  { id: 4, parent_id: null, code: '2', name: 'Structural Steel', trade: 'Steel', duration_days: 21, status: 'in_progress', percent_complete: 60 },
  { id: 5, parent_id: 4, code: '2.1', name: 'Column Erection', trade: 'Steel', duration_days: 10, status: 'completed', percent_complete: 100 },
  { id: 6, parent_id: 4, code: '2.2', name: 'Beam Installation', trade: 'Steel', duration_days: 11, status: 'in_progress', percent_complete: 40 },
  { id: 7, parent_id: null, code: '3', name: 'MEP Rough-In', trade: 'MEP', duration_days: 30, status: 'pending', percent_complete: 0 },
  { id: 8, parent_id: 7, code: '3.1', name: 'Electrical Rough-In', trade: 'Electrical', duration_days: 12, status: 'pending', percent_complete: 0 },
  { id: 9, parent_id: 7, code: '3.2', name: 'Plumbing Rough-In', trade: 'Plumbing', duration_days: 10, status: 'pending', percent_complete: 0 },
  { id: 10, parent_id: 7, code: '3.3', name: 'HVAC Ductwork', trade: 'HVAC', duration_days: 14, status: 'pending', percent_complete: 0 },
  { id: 11, parent_id: null, code: '4', name: 'Interior Finishes', trade: 'Finishing', duration_days: 28, status: 'pending', percent_complete: 0 },
];

// 1) VIZ: Project schedule Gantt (multi-trade)
router.get('/schedule-gantt', (req, res) => {
  const start = new Date('2026-04-01');
  const trades = ['Civil', 'Concrete', 'Steel', 'Electrical', 'Plumbing', 'HVAC', 'Finishing'];
  const colors = {
    Civil: '#f59e0b', Concrete: '#64748b', Steel: '#3b82f6',
    Electrical: '#eab308', Plumbing: '#06b6d4', HVAC: '#10b981', Finishing: '#a855f7',
  };
  const tasks = [
    { id: 't1', name: 'Site Prep & Excavation', trade: 'Civil', offset_days: 0, duration: 7, progress: 100 },
    { id: 't2', name: 'Foundation Pour', trade: 'Concrete', offset_days: 7, duration: 10, progress: 100 },
    { id: 't3', name: 'Steel Frame Erection', trade: 'Steel', offset_days: 17, duration: 18, progress: 65 },
    { id: 't4', name: 'Electrical Rough-In', trade: 'Electrical', offset_days: 30, duration: 14, progress: 25 },
    { id: 't5', name: 'Plumbing Rough-In', trade: 'Plumbing', offset_days: 32, duration: 12, progress: 20 },
    { id: 't6', name: 'HVAC Ductwork', trade: 'HVAC', offset_days: 35, duration: 16, progress: 10 },
    { id: 't7', name: 'Drywall & Finishes', trade: 'Finishing', offset_days: 52, duration: 25, progress: 0 },
  ].map(t => {
    const s = new Date(start); s.setDate(s.getDate() + t.offset_days);
    const e = new Date(s); e.setDate(e.getDate() + t.duration);
    return { ...t, start_date: s.toISOString().slice(0,10), end_date: e.toISOString().slice(0,10), color: colors[t.trade] };
  });
  res.json({
    project: 'Riverside Tower Phase 2',
    timeline_start: start.toISOString().slice(0,10),
    total_days: 80,
    trades,
    tasks,
    generated_at: new Date().toISOString(),
  });
});

// 2) VIZ: Budget burndown chart
router.get('/budget-burndown', (req, res) => {
  const total_budget = 4500000;
  const weeks = 16;
  const planned_per_week = total_budget / weeks;
  const series = [];
  let actual_spent = 0;
  for (let w = 0; w <= weeks; w++) {
    const planned_remaining = total_budget - (planned_per_week * w);
    // Actual: slight overrun curve
    const burnRate = w < 6 ? 0.85 : (w < 12 ? 1.12 : 1.05);
    actual_spent += w === 0 ? 0 : planned_per_week * burnRate;
    const actual_remaining = Math.max(0, total_budget - actual_spent);
    series.push({
      week: w,
      label: `Week ${w}`,
      planned_remaining: Math.round(planned_remaining),
      actual_remaining: Math.round(actual_remaining),
      variance: Math.round(actual_remaining - planned_remaining),
    });
  }
  res.json({
    project: 'Riverside Tower Phase 2',
    total_budget,
    currency: 'USD',
    weeks,
    current_week: 9,
    series,
    summary: {
      planned_at_now: series[9].planned_remaining,
      actual_at_now: series[9].actual_remaining,
      variance: series[9].variance,
      status: series[9].variance < 0 ? 'over_budget' : 'on_track',
    },
  });
});

// 3) NON-VIZ: Punch list PDF (text/plain "PDF-like" report; no extra deps)
router.get('/punchlist-pdf', (req, res) => {
  const items = [
    { num: 'PL-001', loc: 'Level 3 - Suite 302', desc: 'Touch-up paint near elevator door frame', trade: 'Painting', priority: 'low', status: 'open', due: '2026-05-25' },
    { num: 'PL-002', loc: 'Level 2 - Corridor B', desc: 'Replace damaged ceiling tile (water stain)', trade: 'Drywall', priority: 'medium', status: 'open', due: '2026-05-22' },
    { num: 'PL-003', loc: 'Lobby', desc: 'Adjust automatic door closer tension', trade: 'Hardware', priority: 'high', status: 'in_progress', due: '2026-05-20' },
    { num: 'PL-004', loc: 'Roof - HVAC Pad', desc: 'Reseal flashing around RTU-3', trade: 'Roofing', priority: 'high', status: 'open', due: '2026-05-21' },
    { num: 'PL-005', loc: 'Mechanical Room', desc: 'Label all conduit per spec section 26 05 53', trade: 'Electrical', priority: 'medium', status: 'open', due: '2026-05-28' },
  ];
  const lines = [];
  lines.push('================================================================');
  lines.push('  AI CONSTRUCTION MANAGER - PUNCH LIST REPORT');
  lines.push('  Project: Riverside Tower Phase 2');
  lines.push(`  Generated: ${new Date().toISOString()}`);
  lines.push(`  Total Items: ${items.length}`);
  lines.push('================================================================');
  lines.push('');
  items.forEach(it => {
    lines.push(`[${it.num}]  Priority: ${it.priority.toUpperCase()}   Status: ${it.status}`);
    lines.push(`  Location : ${it.loc}`);
    lines.push(`  Trade    : ${it.trade}`);
    lines.push(`  Due Date : ${it.due}`);
    lines.push(`  Issue    : ${it.desc}`);
    lines.push('  Sign-off : _____________________   Date: __________');
    lines.push('----------------------------------------------------------------');
  });
  lines.push('');
  lines.push('END OF REPORT');
  const body = lines.join('\n');
  res.json({
    filename: `punchlist_${Date.now()}.pdf.txt`,
    mime: 'application/pdf-text',
    item_count: items.length,
    bytes: body.length,
    content: body,
    download_ready: true,
  });
});

// 4) NON-VIZ: WBS / Task hierarchy CRUD
router.get('/wbs', (req, res) => {
  res.json({ count: wbs.length, items: wbs });
});

router.post('/wbs', (req, res) => {
  const { parent_id = null, code, name, trade = 'General', duration_days = 1, status = 'pending', percent_complete = 0 } = req.body || {};
  if (!name || !code) return res.status(400).json({ error: 'name and code are required' });
  const item = { id: ++_wbsSeq, parent_id, code, name, trade, duration_days, status, percent_complete };
  wbs.push(item);
  res.status(201).json(item);
});

router.put('/wbs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = wbs.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'wbs item not found' });
  wbs[idx] = { ...wbs[idx], ...req.body, id };
  res.json(wbs[idx]);
});

router.delete('/wbs/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = wbs.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'wbs item not found' });
  const removed = wbs.splice(idx, 1)[0];
  res.json({ deleted: true, item: removed });
});

module.exports = router;
