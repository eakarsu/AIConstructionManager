import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ScheduleGanttChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/custom-views/schedule-gantt')
      .then(r => setData(r.data))
      .catch(e => setErr(e.message));
  }, []);
  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div style={{ color: '#94a3b8' }}>Loading Gantt...</div>;
  const dayPx = 8;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 4 }}>Project Schedule Gantt (Multi-Trade)</h3>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
        {data.project} - start {data.timeline_start} - {data.total_days} days
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {data.trades.map(t => (
          <span key={t} style={{ fontSize: 11, color: '#94a3b8', padding: '2px 8px', border: '1px solid #334155', borderRadius: 6 }}>{t}</span>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: data.total_days * dayPx + 240 }}>
          {data.tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 220, color: '#cbd5e1', fontSize: 13, paddingRight: 8 }}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t.trade} - {t.start_date} -> {t.end_date}</div>
              </div>
              <div style={{ position: 'relative', flex: 1, height: 24, background: '#0f172a', borderRadius: 4 }}>
                <div style={{
                  position: 'absolute',
                  left: t.offset_days * dayPx,
                  width: t.duration * dayPx,
                  height: 24,
                  background: t.color,
                  borderRadius: 4,
                  opacity: 0.85,
                }} />
                <div style={{
                  position: 'absolute',
                  left: t.offset_days * dayPx,
                  width: (t.duration * dayPx) * (t.progress / 100),
                  height: 24,
                  background: t.color,
                  borderRadius: 4,
                  boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.4)',
                }} />
                <span style={{ position: 'absolute', left: t.offset_days * dayPx + 6, top: 4, fontSize: 11, color: '#0f172a', fontWeight: 700 }}>
                  {t.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
