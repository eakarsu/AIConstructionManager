const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
