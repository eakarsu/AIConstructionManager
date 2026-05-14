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

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-equipment-permits-submittals-warranties-lack-paired-ai-endpo', require('./routes/gap_equipment_permits_submittals_warranties_lack_paired_ai_endpo'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-progressphotos-lacks-vision-based-photo-analysis-delay-quali', require('./routes/gap_progressphotos_lacks_vision_based_photo_analysis_delay_quali'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-meetingminutes-lacks-summarization-or-action-item-extraction', require('./routes/gap_meetingminutes_lacks_summarization_or_action_item_extraction'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-punchlist-lacks-ai-prioritization-or-closeout-timeline-predi', require('./routes/gap_punchlist_lacks_ai_prioritization_or_closeout_timeline_predi'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-supplier-vendor-sourcing-workflow', require('./routes/gap_no_supplier_vendor_sourcing_workflow'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-field-worker-mobile-app-or-real-time-gps-tracking', require('./routes/gap_no_field_worker_mobile_app_or_real_time_gps_tracking'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-payment-accounting-module', require('./routes/gap_no_payment_accounting_module'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-third-party-trimble-procore-revit-integrations', require('./routes/gap_no_third_party_trimble_procore_revit_integrations'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-webhooks', require('./routes/gap_no_webhooks'));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
