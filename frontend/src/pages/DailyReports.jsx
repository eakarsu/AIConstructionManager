import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const styles = {
  page: { padding: '32px 40px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 28, fontWeight: 800, color: '#64748b' },
  btn: (bg) => ({ padding: '10px 20px', borderRadius: 10, border: 'none', background: bg, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }),
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '20px 24px', marginBottom: 12, cursor: 'pointer' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, width: '100%', marginBottom: 12 },
  textarea: { padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, width: '100%', marginBottom: 12, resize: 'vertical' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' },
  label: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  pag: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  pagBtn: (active) => ({ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#64748b' : '#334155', color: '#fff', fontSize: 13 }),
  aiBox: { background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16, marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 13, color: '#94a3b8', maxHeight: 500, overflowY: 'auto' },
  section: { marginBottom: 16 },
};

const EMPTY = { project_name: '', date: new Date().toISOString().split('T')[0], weather: '', crew_count: '', work_completed: '', issues: '', materials_used: '', visitor_log: '', submitted_by: '' };

export default function DailyReports() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [aiGenerated, setAiGenerated] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [projectHistory, setProjectHistory] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.project_name = search;
      const res = await api.get('/daily-reports', { params });
      const d = res.data;
      if (d.data) {
        setItems(d.data);
        setPagination(d.pagination || { page: 1, totalPages: 1, total: d.data.length });
      } else {
        setItems(d);
        setPagination({ page: 1, totalPages: 1, total: d.length });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load daily reports');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/daily-reports', { ...form, crew_count: form.crew_count ? parseInt(form.crew_count) : undefined });
      setShowCreate(false);
      setForm(EMPTY);
      setAiGenerated('');
      fetchReports();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create daily report');
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!form.work_completed) { alert('Please enter work completed first'); return; }
    setAiLoading(true);
    setAiGenerated('');
    try {
      const res = await api.post('/daily-reports/ai-generate', {
        project_name: form.project_name,
        date: form.date,
        weather: form.weather,
        crew_count: form.crew_count,
        work_completed: form.work_completed,
        issues: form.issues,
        materials_used: form.materials_used,
        visitor_log: form.visitor_log,
      });
      setAiGenerated(res.data.result || res.data.message || JSON.stringify(res.data));
    } catch (err) {
      setAiGenerated('AI generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleViewHistory = async (projectName) => {
    try {
      const res = await api.get(`/daily-reports/project/${encodeURIComponent(projectName)}`);
      setProjectHistory({ name: projectName, data: res.data.data || res.data, pagination: res.data.pagination });
    } catch {
      alert('Failed to load project history');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await api.delete(`/daily-reports/${id}`);
      setShowDetail(null);
      fetchReports();
    } catch { alert('Delete failed'); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Daily Reports</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>{pagination.total} total reports</div>
        </div>
        <button style={styles.btn('#475569')} onClick={() => { setShowCreate(true); setForm(EMPTY); setAiGenerated(''); setFormError(''); }}>
          + New Daily Report
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Filter by project name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...styles.input, maxWidth: 320, marginBottom: 0 }} />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No daily reports found.</div>
      ) : (
        items.map(item => (
          <div key={item.id} style={styles.card} onClick={() => setShowDetail(item)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{item.project_name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{item.date?.split('T')[0]} — submitted by {item.submitted_by || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                {item.crew_count && <span style={{ color: '#94a3b8' }}>Crew: {item.crew_count}</span>}
                {item.weather && <span style={{ color: '#94a3b8' }}>Weather: {item.weather}</span>}
              </div>
            </div>
            {item.work_completed && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
                {item.work_completed.substring(0, 160)}{item.work_completed.length > 160 ? '...' : ''}
              </div>
            )}
            {item.issues && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#f59e0b' }}>Issues: {item.issues.substring(0, 100)}</div>
            )}
          </div>
        ))
      )}

      {pagination.totalPages > 1 && (
        <div style={styles.pag}>
          <button style={styles.pagBtn(false)} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} style={styles.pagBtn(p === page)} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button style={styles.pagBtn(false)} disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div style={styles.modal} onClick={() => setShowDetail(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{showDetail.project_name}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{showDetail.date?.split('T')[0]} — {showDetail.submitted_by}</div>

            {[
              ['Weather', showDetail.weather],
              ['Crew Count', showDetail.crew_count],
              ['Work Completed', showDetail.work_completed],
              ['Issues / Delays', showDetail.issues],
              ['Materials Used', showDetail.materials_used],
              ['Visitor Log', showDetail.visitor_log],
            ].map(([label, value]) => value && (
              <div key={label} style={styles.section}>
                <div style={styles.label}>{label}</div>
                <div style={{ fontSize: 14, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{value}</div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button style={styles.btn('#3b82f6')} onClick={() => handleViewHistory(showDetail.project_name)}>View Project History</button>
              <button style={styles.btn('#ef4444')} onClick={() => handleDelete(showDetail.id)}>Delete</button>
              <button style={styles.btn('#475569')} onClick={() => setShowDetail(null)}>Close</button>
            </div>

            {projectHistory && projectHistory.name === showDetail.project_name && (
              <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Project History: {projectHistory.name}</div>
                {projectHistory.data?.map(r => (
                  <div key={r.id} style={{ borderBottom: '1px solid #1e293b', paddingBottom: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.date?.split('T')[0]}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.work_completed?.substring(0, 100)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Form Modal */}
      {showCreate && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Daily Report</div>
            {formError && <div style={styles.error}>{formError}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <div style={styles.label}>Project Name *</div>
                  <input value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} style={styles.input} required />
                </div>
                <div>
                  <div style={styles.label}>Date</div>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={styles.input} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div style={styles.label}>Weather</div>
                  <input value={form.weather} onChange={e => setForm(f => ({ ...f, weather: e.target.value }))} style={styles.input} placeholder="Sunny, 72F" />
                </div>
                <div>
                  <div style={styles.label}>Crew Count</div>
                  <input type="number" value={form.crew_count} onChange={e => setForm(f => ({ ...f, crew_count: e.target.value }))} style={styles.input} />
                </div>
                <div>
                  <div style={styles.label}>Submitted By</div>
                  <input value={form.submitted_by} onChange={e => setForm(f => ({ ...f, submitted_by: e.target.value }))} style={styles.input} />
                </div>
              </div>

              <div style={styles.label}>Work Completed *</div>
              <textarea value={form.work_completed} onChange={e => setForm(f => ({ ...f, work_completed: e.target.value }))} rows={4} style={styles.textarea} required placeholder="Describe all work completed today..." />

              <div style={styles.label}>Issues / Delays</div>
              <textarea value={form.issues} onChange={e => setForm(f => ({ ...f, issues: e.target.value }))} rows={2} style={styles.textarea} placeholder="Any delays, problems, or RFIs..." />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={styles.label}>Materials Used</div>
                  <textarea value={form.materials_used} onChange={e => setForm(f => ({ ...f, materials_used: e.target.value }))} rows={2} style={styles.textarea} />
                </div>
                <div>
                  <div style={styles.label}>Visitor Log</div>
                  <textarea value={form.visitor_log} onChange={e => setForm(f => ({ ...f, visitor_log: e.target.value }))} rows={2} style={styles.textarea} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" style={styles.btn('#475569')} disabled={saving}>{saving ? 'Saving...' : 'Save Report'}</button>
                <button type="button" style={styles.btn('#8b5cf6')} onClick={handleAiGenerate} disabled={aiLoading}>{aiLoading ? 'Generating...' : 'AI Format Report'}</button>
                <button type="button" style={styles.btn('#334155')} onClick={() => { setShowCreate(false); setAiGenerated(''); }}>Cancel</button>
              </div>
            </form>

            {aiGenerated && (
              <div>
                <div style={{ fontWeight: 700, marginTop: 20, marginBottom: 8, color: '#8b5cf6' }}>AI-Formatted Report</div>
                <div style={styles.aiBox}>{aiGenerated}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
