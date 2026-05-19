import React from 'react';
import ScheduleGanttChart from '../components/ScheduleGanttChart';
import BudgetBurndownChart from '../components/BudgetBurndownChart';
import PunchListPdfExport from '../components/PunchListPdfExport';
import WbsHierarchyEditor from '../components/WbsHierarchyEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, minHeight: 'calc(100vh - 64px)', background: '#0f172a' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#e2e8f0', fontSize: 28, marginBottom: 4 }}>Project Views</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Custom views for construction project management: schedule, budget, punch list, and WBS.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <ScheduleGanttChart />
        <BudgetBurndownChart />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <PunchListPdfExport />
          <WbsHierarchyEditor />
        </div>
      </div>
    </div>
  );
}
