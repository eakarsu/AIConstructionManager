import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const STATUS_COLORS = {
  submitted: '#3b82f6',
  under_review: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

const styles = {
  page: { padding: '32px 40px', maxWidth: 1400, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 28, fontWeight: 800, color: '#f59e0b' },
  btn: (bg) => ({ padding: '10px 20px', borderRadius: 10, border: 'none', background: bg, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }),
  badge: (color) => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: color + '22', color, border: `1px solid ${color}44`,
  }),
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '20px 24px', marginBottom: 12, cursor: 'pointer' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, width: '100%', marginBottom: 12 },
  select: { padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, marginBottom: 12 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' },
  label: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  pag: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  pagBtn: (active) => ({ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#f59e0b' : '#334155', color: '#fff', fontSize: 13 }),
  aiBox: { background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16, marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 13, color: '#94a3b8', maxHeight: 400, overflowY: 'auto' },
};

const EMPTY = { project_name: '', title: '', description: '', requested_by: '', cost_impact: '', schedule_impact_days: '', priority: 'medium', status: 'submitted', justification: '' };

export default function ChangeOrders() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.project_name = search;
      const res = await api.get('/change-orders', { params });
      const d = res.data;
      if (d.data) {
        setItems(d.data);
        setPagination(d.pagination || { page: 1, totalPages: 1, total: d.data.length });
      } else {
        setItems(d);
        setPagination({ page: 1, totalPages: 1, total: d.length });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load change orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/change-orders', form);
      setShowCreate(false);
      setForm(EMPTY);
      fetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create change order');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/change-orders/${id}/status`, { status: newStatus });
      fetch();
      if (showDetail) setShowDetail(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed');
    }
  };

  const handleAiAnalyze = async (item) => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await api.post('/change-orders/ai-analyze', {
        project_name: item.project_name,
        title: item.title,
        description: item.description,
        cost_impact: item.cost_impact,
        schedule_impact_days: item.schedule_impact_days,
      });
      setAiResult(res.data.result || res.data.message || JSON.stringify(res.data));
    } catch (err) {
      setAiResult('AI analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this change order?')) return;
    try {
      await api.delete(`/change-orders/${id}`);
      setShowDetail(null);
      fetch();
    } catch { alert('Delete failed'); }
  };

  const STATUS_TRANSITIONS = {
    submitted: ['under_review'],
    under_review: ['approved', 'rejected'],
    approved: [],
    rejected: ['submitted'],
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Change Orders</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>{pagination.total} total</div>
        </div>
        <button style={styles.btn('#f59e0b')} onClick={() => { setShowCreate(true); setForm(EMPTY); setFormError(''); }}>
          + New Change Order
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search by project..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...styles.input, maxWidth: 260, marginBottom: 0 }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...styles.select, marginBottom: 0 }}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No change orders found.</div>
      ) : (
        items.map(item => (
          <div key={item.id} style={styles.card} onClick={() => { setShowDetail(item); setAiResult(''); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.project_name}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={styles.badge(PRIORITY_COLORS[item.priority] || '#64748b')}>{item.priority}</span>
                <span style={styles.badge(STATUS_COLORS[item.status] || '#64748b')}>{item.status?.replace('_', ' ')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
              {item.cost_impact && <div style={{ fontSize: 13 }}><span style={{ color: '#94a3b8' }}>Cost Impact: </span><span style={{ color: '#ef4444' }}>${Number(item.cost_impact).toLocaleString()}</span></div>}
              {item.schedule_impact_days && <div style={{ fontSize: 13 }}><span style={{ color: '#94a3b8' }}>Schedule: </span>{item.schedule_impact_days} days</div>}
              {item.requested_by && <div style={{ fontSize: 13 }}><span style={{ color: '#94a3b8' }}>Requested by: </span>{item.requested_by}</div>}
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{showDetail.title}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{showDetail.project_name}</div>
              </div>
              <span style={styles.badge(STATUS_COLORS[showDetail.status] || '#64748b')}>{showDetail.status?.replace('_', ' ')}</span>
            </div>

            {showDetail.description && <p style={{ color: '#94a3b8', marginBottom: 12 }}>{showDetail.description}</p>}
            {showDetail.justification && <p style={{ color: '#94a3b8', marginBottom: 12 }}><strong>Justification: </strong>{showDetail.justification}</p>}

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              {showDetail.cost_impact && <div><div style={styles.label}>Cost Impact</div><div style={{ color: '#ef4444' }}>${Number(showDetail.cost_impact).toLocaleString()}</div></div>}
              {showDetail.schedule_impact_days && <div><div style={styles.label}>Schedule Days</div><div>{showDetail.schedule_impact_days}</div></div>}
              <div><div style={styles.label}>Priority</div><span style={styles.badge(PRIORITY_COLORS[showDetail.priority] || '#64748b')}>{showDetail.priority}</span></div>
            </div>

            {/* Status transitions */}
            {(STATUS_TRANSITIONS[showDetail.status] || []).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={styles.label}>Move to:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {(STATUS_TRANSITIONS[showDetail.status] || []).map(s => (
                    <button key={s} style={styles.btn(STATUS_COLORS[s] || '#475569')}
                      onClick={() => handleStatusChange(showDetail.id, s)}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button style={styles.btn('#8b5cf6')} onClick={() => handleAiAnalyze(showDetail)} disabled={aiLoading}>
                {aiLoading ? 'Analyzing...' : 'AI Analyze'}
              </button>
              <button style={styles.btn('#ef4444')} onClick={() => handleDelete(showDetail.id)}>Delete</button>
              <button style={styles.btn('#475569')} onClick={() => setShowDetail(null)}>Close</button>
            </div>

            {aiResult && <div style={styles.aiBox}>{aiResult}</div>}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Change Order</div>
            {formError && <div style={styles.error}>{formError}</div>}
            <form onSubmit={handleCreate}>
              {[['project_name', 'Project Name *'], ['title', 'Title *'], ['requested_by', 'Requested By']].map(([k, label]) => (
                <div key={k}>
                  <div style={styles.label}>{label}</div>
                  <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={styles.input} required={label.includes('*')} />
                </div>
              ))}
              <div style={styles.label}>Description</div>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...styles.input, resize: 'vertical' }} />
              <div style={styles.label}>Justification</div>
              <textarea value={form.justification} onChange={e => setForm(f => ({ ...f, justification: e.target.value }))} rows={2} style={{ ...styles.input, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div style={styles.label}>Cost Impact ($)</div>
                  <input type="number" value={form.cost_impact} onChange={e => setForm(f => ({ ...f, cost_impact: e.target.value }))} style={styles.input} />
                </div>
                <div>
                  <div style={styles.label}>Schedule Impact (days)</div>
                  <input type="number" value={form.schedule_impact_days} onChange={e => setForm(f => ({ ...f, schedule_impact_days: e.target.value }))} style={styles.input} />
                </div>
                <div>
                  <div style={styles.label}>Priority</div>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ ...styles.select, width: '100%' }}>
                    {Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" style={styles.btn('#f59e0b')} disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
                <button type="button" style={styles.btn('#475569')} onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
