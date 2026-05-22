import React, { useState } from 'react';
import api from '../api';

export default function PunchListPdfExport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const generate = async () => {
    setLoading(true); setErr('');
    try {
      const r = await api.get('/custom-views/punchlist-pdf');
      setData(r.data);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const download = () => {
    if (!data) return;
    const blob = new Blob([data.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = data.filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 8 }}>Punch List PDF Export</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        Generate a closeout-ready punch list report for the project.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={generate} disabled={loading}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff',
            fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating...' : 'Generate PDF'}
        </button>
        {data && (
          <button onClick={download}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #10b981',
              background: 'transparent', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
            Download {data.filename}
          </button>
        )}
      </div>
      {err && <div style={{ color: '#ef4444' }}>Error: {err}</div>}
      {data && (
        <div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
            {data.item_count} items - {data.bytes} bytes - mime: {data.mime}
          </div>
          <pre style={{ background: '#0f172a', color: '#cbd5e1', padding: 12, borderRadius: 8, fontSize: 11, maxHeight: 280, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {data.content}
          </pre>
        </div>
      )}
    </div>
  );
}
