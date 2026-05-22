import React, { useEffect, useState } from 'react';
import api from '../api';

export default function BudgetBurndownChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/custom-views/budget-burndown')
      .then(r => setData(r.data))
      .catch(e => setErr(e.message));
  }, []);
  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div style={{ color: '#94a3b8' }}>Loading burndown...</div>;
  const W = 720, H = 260, P = 40;
  const max = data.total_budget;
  const xs = (i) => P + (i / data.weeks) * (W - P * 2);
  const ys = (v) => H - P - (v / max) * (H - P * 2);
  const plannedPath = data.series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(p.planned_remaining)}`).join(' ');
  const actualPath = data.series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(p.actual_remaining)}`).join(' ');
  const fmt = (n) => '$' + (n / 1000).toFixed(0) + 'k';
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 4 }}>Budget Burndown</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
        {data.project} - Total: ${data.total_budget.toLocaleString()} - Status:&nbsp;
        <strong style={{ color: data.summary.status === 'on_track' ? '#10b981' : '#ef4444' }}>
          {data.summary.status.replace('_', ' ').toUpperCase()}
        </strong>
      </div>
      <svg width={W} height={H} style={{ background: '#0f172a', borderRadius: 8, maxWidth: '100%' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <g key={i}>
            <line x1={P} y1={ys(max * p)} x2={W - P} y2={ys(max * p)} stroke="#334155" strokeDasharray="3,3" />
            <text x={4} y={ys(max * p) + 4} fontSize={10} fill="#64748b">{fmt(max * p)}</text>
          </g>
        ))}
        <path d={plannedPath} stroke="#3b82f6" strokeWidth={2} fill="none" />
        <path d={actualPath} stroke="#ef4444" strokeWidth={2} fill="none" />
        {data.series.map((p, i) => (
          <g key={i}>
            <circle cx={xs(i)} cy={ys(p.planned_remaining)} r={2.5} fill="#3b82f6" />
            <circle cx={xs(i)} cy={ys(p.actual_remaining)} r={2.5} fill="#ef4444" />
          </g>
        ))}
        <text x={P} y={H - 8} fontSize={10} fill="#64748b">W0</text>
        <text x={W - P - 14} y={H - 8} fontSize={10} fill="#64748b">W{data.weeks}</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13 }}>
        <span style={{ color: '#3b82f6' }}>— Planned remaining</span>
        <span style={{ color: '#ef4444' }}>— Actual remaining</span>
        <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>
          Variance now: <strong style={{ color: data.summary.variance < 0 ? '#ef4444' : '#10b981' }}>
            {data.summary.variance < 0 ? '-' : '+'}${Math.abs(data.summary.variance).toLocaleString()}
          </strong>
        </span>
      </div>
    </div>
  );
}
