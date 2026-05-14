import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Projects from './pages/Projects';
import ChangeOrders from './pages/ChangeOrders';
import DailyReports from './pages/DailyReports';
import AICenter from './pages/AICenter';
import Navbar from './components/Navbar';

// // === Batch 02 Gaps & Frontend Mounts ===
import CfMultiModalProgressTracking from './pages/CfMultiModalProgressTracking';
import CfPredictiveProjectCompletion from './pages/CfPredictiveProjectCompletion';
import CfAutonomousSiteMonitoring from './pages/CfAutonomousSiteMonitoring';
import CfSupplyChainOptimization from './pages/CfSupplyChainOptimization';
import CfWorkerWellnessFatigueMonitoring from './pages/CfWorkerWellnessFatigueMonitoring';
import CfPermittingRegulatoryPrediction from './pages/CfPermittingRegulatoryPrediction';
import GapEquipmentPermitsSubmittalsWarrantiesLackPairedAiEndpo from './pages/GapEquipmentPermitsSubmittalsWarrantiesLackPairedAiEndpo';
import GapProgressphotosLacksVisionBasedPhotoAnalysisDelayQuali from './pages/GapProgressphotosLacksVisionBasedPhotoAnalysisDelayQuali';
import GapMeetingminutesLacksSummarizationOrActionItemExtraction from './pages/GapMeetingminutesLacksSummarizationOrActionItemExtraction';
import GapPunchlistLacksAiPrioritizationOrCloseoutTimelinePredi from './pages/GapPunchlistLacksAiPrioritizationOrCloseoutTimelinePredi';
import GapNoSupplierVendorSourcingWorkflow from './pages/GapNoSupplierVendorSourcingWorkflow';
import GapNoFieldWorkerMobileAppOrRealTimeGpsTracking from './pages/GapNoFieldWorkerMobileAppOrRealTimeGpsTracking';
import GapNoPaymentAccountingModule from './pages/GapNoPaymentAccountingModule';
import GapNoThirdPartyTrimbleProcoreRevitIntegrations from './pages/GapNoThirdPartyTrimbleProcoreRevitIntegrations';
import GapNoWebhooks from './pages/GapNoWebhooks';

const globalStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
  }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #1e293b; }
  ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #64748b; }
`;

const features = [
  { key: 'projects', label: 'Projects', icon: '🏗️', color: '#3b82f6', api: '/projects',
    columns: ['name','description','location','start_date','end_date','budget','status','client','manager'],
    tableColumns: ['name','location','budget','status','client'] },
  { key: 'cost-estimations', label: 'AI Cost Estimation', icon: '💰', color: '#10b981', api: '/cost-estimations',
    columns: ['project_name','description','category','estimated_cost','actual_cost','variance','status','estimator','notes'],
    tableColumns: ['project_name','category','estimated_cost','actual_cost','status'],
    ai: { endpoint: '/cost-estimations/ai-estimate', fields: ['project_name','description','category','square_footage','location'], title: 'AI Cost Estimate' } },
  { key: 'schedules', label: 'Schedule Optimization', icon: '📅', color: '#8b5cf6', api: '/schedules',
    columns: ['project_name','task_name','start_date','end_date','duration_days','dependencies','assigned_to','status','priority'],
    tableColumns: ['project_name','task_name','start_date','end_date','status','priority'],
    ai: { endpoint: '/schedules/ai-optimize', fields: ['project_name','tasks','deadline','constraints'], title: 'AI Schedule Optimizer' } },
  { key: 'safety', label: 'Safety Compliance', icon: '🛡️', color: '#ef4444', api: '/safety',
    columns: ['project_name','incident_type','description','severity','location','reported_by','date_reported','status','corrective_action'],
    tableColumns: ['project_name','incident_type','severity','date_reported','status'],
    ai: { endpoint: '/safety/ai-analyze', fields: ['project_name','incident_type','description','location'], title: 'AI Safety Analysis' } },
  { key: 'change-orders', label: 'Change Order Analysis', icon: '📝', color: '#f59e0b', api: '/change-orders',
    columns: ['project_name','title','description','requested_by','cost_impact','schedule_impact_days','priority','status','justification'],
    tableColumns: ['project_name','title','cost_impact','schedule_impact_days','status'],
    ai: { endpoint: '/change-orders/ai-analyze', fields: ['project_name','title','description','cost_impact','schedule_impact_days'], title: 'AI Change Order Analysis' } },
  { key: 'materials', label: 'Material Tracking', icon: '🧱', color: '#06b6d4', api: '/materials',
    columns: ['name','category','quantity','unit','unit_cost','total_cost','supplier','status','project_name'],
    tableColumns: ['name','category','quantity','unit_cost','total_cost','status'] },
  { key: 'labor', label: 'Labor Management', icon: '👷', color: '#ec4899', api: '/labor',
    columns: ['worker_name','role','project_name','hourly_rate','hours_worked','total_pay','start_date','status','skills'],
    tableColumns: ['worker_name','role','project_name','hourly_rate','hours_worked','status'] },
  { key: 'equipment', label: 'Equipment Tracking', icon: '🚜', color: '#f97316', api: '/equipment',
    columns: ['name','type','serial_number','project_name','daily_rate','status','operator','condition_rating','next_maintenance'],
    tableColumns: ['name','type','project_name','daily_rate','status','condition_rating'] },
  { key: 'subcontractors', label: 'Subcontractors', icon: '🤝', color: '#14b8a6', api: '/subcontractors',
    columns: ['company_name','contact_person','email','phone','specialty','project_name','contract_value','status','rating'],
    tableColumns: ['company_name','specialty','project_name','contract_value','status','rating'] },
  { key: 'documents', label: 'Documents', icon: '📄', color: '#6366f1', api: '/documents',
    columns: ['title','type','project_name','uploaded_by','description','version','status','file_path','tags'],
    tableColumns: ['title','type','project_name','version','status'] },
  { key: 'inspections', label: 'Inspections', icon: '🔍', color: '#a855f7', api: '/inspections',
    columns: ['project_name','inspector','type','date_scheduled','date_completed','result','notes','status','follow_up_required'],
    tableColumns: ['project_name','inspector','type','date_scheduled','result','status'] },
  { key: 'risk-assessments', label: 'AI Risk Assessment', icon: '⚠️', color: '#dc2626', api: '/risk-assessments',
    columns: ['project_name','risk_type','description','probability','impact','risk_score','mitigation','owner','status'],
    tableColumns: ['project_name','risk_type','probability','impact','risk_score','status'],
    ai: { endpoint: '/risk-assessments/ai-assess', fields: ['project_name','risk_type','description','project_details'], title: 'AI Risk Assessment' } },
  { key: 'budgets', label: 'Budget Tracking', icon: '💵', color: '#22c55e', api: '/budgets',
    columns: ['project_name','category','allocated_amount','spent_amount','remaining','period','status','approved_by','notes'],
    tableColumns: ['project_name','category','allocated_amount','spent_amount','remaining','status'] },
  { key: 'weather', label: 'AI Weather Impact', icon: '🌦️', color: '#0ea5e9', api: '/weather',
    columns: ['project_name','date','condition','temperature','wind_speed','precipitation','impact_level','work_status','notes'],
    tableColumns: ['project_name','date','condition','temperature','impact_level','work_status'],
    ai: { endpoint: '/weather/ai-analyze', fields: ['project_name','location','season','project_type'], title: 'AI Weather Impact Analysis' } },
  { key: 'daily-reports', label: 'Daily Reports', icon: '📋', color: '#64748b', api: '/daily-reports',
    columns: ['project_name','date','weather','crew_count','work_completed','issues','materials_used','visitor_log','submitted_by'],
    tableColumns: ['project_name','date','crew_count','work_completed','submitted_by'] },
  { key: 'permits', label: 'Permits', icon: '📜', color: '#d946ef', api: '/permits',
    columns: ['project_name','permit_type','issuing_authority','application_date','approval_date','expiry_date','status','cost','notes'],
    tableColumns: ['project_name','permit_type','issuing_authority','status','cost'] },
  { key: 'quality-control', label: 'Quality Control', icon: '✅', color: '#059669', api: '/quality-control',
    columns: ['project_name','inspection_area','inspector','date','standard','result','defects_found','corrective_action','status'],
    tableColumns: ['project_name','inspection_area','date','standard','result','status'] },
  { key: 'rfis', label: 'RFIs', icon: '❓', color: '#e11d48', api: '/rfis',
    columns: ['project_name','rfi_number','subject','question','submitted_by','assigned_to','date_submitted','date_due','date_responded','response','priority','status','cost_impact'],
    tableColumns: ['project_name','rfi_number','subject','assigned_to','priority','status'] },
  { key: 'punch-list', label: 'Punch List', icon: '📌', color: '#ca8a04', api: '/punch-list',
    columns: ['project_name','item_number','location','description','category','assigned_to','date_identified','date_due','date_completed','priority','status','notes'],
    tableColumns: ['project_name','item_number','location','category','priority','status'] },
  { key: 'submittals', label: 'Submittals', icon: '📨', color: '#0d9488', api: '/submittals',
    columns: ['project_name','submittal_number','title','spec_section','submitted_by','reviewer','date_submitted','date_required','date_returned','result','revision','status','notes'],
    tableColumns: ['project_name','submittal_number','title','spec_section','result','status'] },
  { key: 'contracts', label: 'Contracts', icon: '📑', color: '#7c3aed', api: '/contracts',
    columns: ['project_name','contract_number','title','contractor','contract_type','original_value','revised_value','start_date','end_date','retainage_pct','status','signed_date','notes'],
    tableColumns: ['project_name','contract_number','contractor','contract_type','original_value','status'] },
  { key: 'timesheets', label: 'Timesheets', icon: '⏱️', color: '#2563eb', api: '/timesheets',
    columns: ['project_name','worker_name','role','date','start_time','end_time','hours_regular','hours_overtime','break_hours','task_description','approved_by','status'],
    tableColumns: ['project_name','worker_name','role','date','hours_regular','hours_overtime','status'] },
  { key: 'meeting-minutes', label: 'Meeting Minutes', icon: '🗓️', color: '#9333ea', api: '/meeting-minutes',
    columns: ['project_name','meeting_type','date','location','attendees','agenda','discussion','action_items','decisions','next_meeting_date','recorded_by','status'],
    tableColumns: ['project_name','meeting_type','date','location','recorded_by','status'] },
  { key: 'progress-photos', label: 'Progress Photos', icon: '📸', color: '#c026d3', api: '/progress-photos',
    columns: ['project_name','date_taken','location','description','phase','taken_by','category','weather_conditions','tags','file_path','status','notes'],
    tableColumns: ['project_name','date_taken','location','phase','category','status'] },
  { key: 'warranties', label: 'Warranties', icon: '🛡️', color: '#0891b2', api: '/warranties',
    columns: ['project_name','item','manufacturer','warranty_type','start_date','end_date','duration_years','coverage','contact_info','claim_procedure','status','notes'],
    tableColumns: ['project_name','item','manufacturer','warranty_type','duration_years','status'] },
  { key: 'environmental', label: 'AI Environmental', icon: '🌿', color: '#16a34a', api: '/environmental',
    columns: ['project_name','compliance_type','regulation','description','monitoring_date','result','inspector','corrective_action','deadline','agency','status','notes'],
    tableColumns: ['project_name','compliance_type','regulation','result','agency','status'],
    ai: { endpoint: '/environmental/ai-analyze', fields: ['project_name','compliance_type','description','location','project_type'], title: 'AI Environmental Compliance Analysis' } },
  { key: 'bim', label: 'AI BIM Coordination', icon: '🏛️', color: '#4f46e5', api: '/bim',
    columns: ['project_name','model_name','discipline','version','clash_count','resolved_count','author','software','lod_level','file_size','last_updated','status','notes'],
    tableColumns: ['project_name','model_name','discipline','clash_count','resolved_count','status'],
    ai: { endpoint: '/bim/ai-analyze', fields: ['project_name','disciplines','clash_description','project_phase'], title: 'AI BIM Coordination Analysis' } },
];

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const check = () => setIsAuth(!!localStorage.getItem('token'));
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const handleLogin = () => setIsAuth(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuth(false);
  };

  return (
    <>
      <style>{globalStyles}</style>
      <Router>
        {isAuth && <Navbar onLogout={handleLogout} features={features} />}
        <Routes>
          <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/" element={isAuth ? <Dashboard features={features} /> : <Navigate to="/login" />} />
          {/* Dedicated full-featured pages */}
          <Route path="/projects-full" element={isAuth ? <Projects /> : <Navigate to="/login" />} />
          <Route path="/change-orders-full" element={isAuth ? <ChangeOrders /> : <Navigate to="/login" />} />
          <Route path="/daily-reports-full" element={isAuth ? <DailyReports /> : <Navigate to="/login" />} />
          <Route path="/ai-center" element={isAuth ? <AICenter /> : <Navigate to="/login" />} />
          {features.map((f) => (
            <Route
              key={f.key}
              path={`/${f.key}`}
              element={isAuth ? <FeaturePage feature={f} /> : <Navigate to="/login" />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        
        {/* // === Batch 02 Gaps & Frontend Mounts === */}
        <Route path="/cf/multi-modal-progress-tracking" element={<CfMultiModalProgressTracking />} />
        <Route path="/cf/predictive-project-completion" element={<CfPredictiveProjectCompletion />} />
        <Route path="/cf/autonomous-site-monitoring" element={<CfAutonomousSiteMonitoring />} />
        <Route path="/cf/supply-chain-optimization" element={<CfSupplyChainOptimization />} />
        <Route path="/cf/worker-wellness-fatigue-monitoring" element={<CfWorkerWellnessFatigueMonitoring />} />
        <Route path="/cf/permitting-regulatory-prediction" element={<CfPermittingRegulatoryPrediction />} />
        <Route path="/gap/equipment-permits-submittals-warranties-lack-paired-ai-endpo" element={<GapEquipmentPermitsSubmittalsWarrantiesLackPairedAiEndpo />} />
        <Route path="/gap/progressphotos-lacks-vision-based-photo-analysis-delay-quali" element={<GapProgressphotosLacksVisionBasedPhotoAnalysisDelayQuali />} />
        <Route path="/gap/meetingminutes-lacks-summarization-or-action-item-extraction" element={<GapMeetingminutesLacksSummarizationOrActionItemExtraction />} />
        <Route path="/gap/punchlist-lacks-ai-prioritization-or-closeout-timeline-predi" element={<GapPunchlistLacksAiPrioritizationOrCloseoutTimelinePredi />} />
        <Route path="/gap/no-supplier-vendor-sourcing-workflow" element={<GapNoSupplierVendorSourcingWorkflow />} />
        <Route path="/gap/no-field-worker-mobile-app-or-real-time-gps-tracking" element={<GapNoFieldWorkerMobileAppOrRealTimeGpsTracking />} />
        <Route path="/gap/no-payment-accounting-module" element={<GapNoPaymentAccountingModule />} />
        <Route path="/gap/no-third-party-trimble-procore-revit-integrations" element={<GapNoThirdPartyTrimbleProcoreRevitIntegrations />} />
        <Route path="/gap/no-webhooks" element={<GapNoWebhooks />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;
