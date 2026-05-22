const router = require('express').Router();
const auth = require('../middleware/auth');

let rows = [
  { id: 1, project_name: 'Tower B', lift_id: 'LIFT-221', crane: 'Liebherr 550 EC-H', load_weight: 18400, radius_ft: 92, wind_limit_mph: 18, readiness: 84, status: 'engineer_review', mitigation: 'Confirm mat bearing pressure and tag-line crew.' },
  { id: 2, project_name: 'Central Hospital', lift_id: 'LIFT-305', crane: 'Grove GMK5250XL', load_weight: 9600, radius_ft: 64, wind_limit_mph: 22, readiness: 96, status: 'ready', mitigation: 'Proceed with morning pick window.' },
];
const nextId = () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

router.use(auth);
router.get('/', (req, res) => res.json(rows));
router.post('/', (req, res) => {
  const row = { id: nextId(), ...req.body };
  rows.unshift(row);
  res.status(201).json(row);
});
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  rows[idx] = { ...rows[idx], ...req.body, id };
  res.json(rows[idx]);
});
router.delete('/:id', (req, res) => {
  rows = rows.filter((row) => row.id !== Number(req.params.id));
  res.json({ message: 'deleted' });
});

module.exports = router;
