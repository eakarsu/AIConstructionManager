const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });
require('./config/runtime').validateRuntime();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/project-controls', require('./routes/controlledWorkflow'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/cost-estimations', require('./routes/costEstimation'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/safety', require('./routes/safety'));
app.use('/api/change-orders', require('./routes/changeOrders'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/labor', require('./routes/labor'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/subcontractors', require('./routes/subcontractors'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/risk-assessments', require('./routes/riskAssessment'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/daily-reports', require('./routes/dailyReports'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/quality-control', require('./routes/qualityControl'));
app.use('/api/rfis', require('./routes/rfis'));
app.use('/api/punch-list', require('./routes/punchList'));
app.use('/api/submittals', require('./routes/submittals'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/timesheets', require('./routes/timesheets'));
app.use('/api/meeting-minutes', require('./routes/meetingMinutes'));
app.use('/api/progress-photos', require('./routes/progressPhotos'));
app.use('/api/warranties', require('./routes/warranties'));
app.use('/api/environmental', require('./routes/environmental'));
app.use('/api/bim', require('./routes/bim'));
app.use('/api/crane-pick-plan-review', require('./routes/cranePickPlanReview'));

// AI endpoints
app.use('/api/ai', require('./routes/ai'));


app.use('/api/ai', require('./routes/multimodalProgress'));

app.use('/api/ai', require('./routes/projectCompletion'));

app.use('/api/ai', require('./routes/autonomousMonitor'));

app.use('/api/ai', require('./routes/supplyChainOpt'));

app.use('/api/ai', require('./routes/wearableFatigue'));

app.use('/api/ai', require('./routes/permitPrediction'));
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// === Custom Views (mounted BEFORE any 404 handler) ===
app.use('/api/custom-views', require('./routes/customViews'));

// Catch-all 404 for unknown /api routes
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
