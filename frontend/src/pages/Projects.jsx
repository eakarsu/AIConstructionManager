import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const STATUS_COLORS = {
  planning: '#3b82f6',
  active: '#10b981',
  completed: '#6366f1',
  cancelled: '#ef4444',
  'on-hold': '#f59e0b',
};

const styles = {
  page: { padding: '32px 40px', maxWidth: 1400, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 28, fontWeight: 800, color: '#3b82f6' },
  btn: (bg) => ({ padding: '10px 20px', borderRadius: 10, border: 'none', background: bg, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }),
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '20px 24px', marginBottom: 12 },
  badge: (status) => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: (STATUS_COLORS[status] || '#64748b') + '22',
    color: STATUS_COLORS[status] || '#64748b',
    border: `1px solid ${(STATUS_COLORS[status] || '#64748b')}44`,
  }),
  input: { padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, width: '100%', marginBottom: 12 },
  select: { padding: '10px 14px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, marginBottom: 12 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 },
  label: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  kv: { display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 },
  kvItem: { flex: '1 1 120px' },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  pag: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  pagBtn: (active) => ({ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#3b82f6' : '#334155', color: '#fff', fontSize: 13 }),
};

const EMPTY = { name: '', description: '', location: '', budget: '', status: 'planning', client: '', manager: '', start_date: '', end_date: '' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
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

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      const data = res.data;
      if (data.data) {
        setProjects(data.data);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: data.data.length });
      } else {
        // Legacy non-paginated response
        setProjects(data);
        setPagination({ page: 1, totalPages: 1, total: data.length });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/projects', form);
      setShowCreate(false);
      setForm(EMPTY);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setShowDetail(null);
      fetchProjects();
    } catch {
      alert('Failed to delete project');
    }
  };

  const filtered = projects.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Projects</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>{pagination.total} total projects</div>
        </div>
        <button style={styles.btn('#3b82f6')} onClick={() => { setShowCreate(true); setForm(EMPTY); setFormError(''); }}>
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...styles.input, maxWidth: 280, marginBottom: 0 }}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...styles.select, marginBottom: 0 }}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No projects found.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(project => (
            <div
              key={project.id}
              style={{ ...styles.card, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => setShowDetail(project)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{project.name}</div>
                <span style={styles.badge(project.status)}>{project.status}</span>
              </div>
              {project.description && <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>{project.description}</div>}
              <div style={styles.kv}>
                {project.location && <div style={styles.kvItem}><div style={styles.label}>Location</div><div style={{ fontSize: 13 }}>{project.location}</div></div>}
                {project.budget && <div style={styles.kvItem}><div style={styles.label}>Budget</div><div style={{ fontSize: 13, color: '#10b981' }}>${Number(project.budget).toLocaleString()}</div></div>}
                {project.client && <div style={styles.kvItem}><div style={styles.label}>Client</div><div style={{ fontSize: 13 }}>{project.client}</div></div>}
                {project.manager && <div style={styles.kvItem}><div style={styles.label}>Manager</div><div style={{ fontSize: 13 }}>{project.manager}</div></div>}
                {project.start_date && <div style={styles.kvItem}><div style={styles.label}>Start</div><div style={{ fontSize: 13 }}>{project.start_date?.split('T')[0]}</div></div>}
                {project.end_date && <div style={styles.kvItem}><div style={styles.label}>End</div><div style={{ fontSize: 13 }}>{project.end_date?.split('T')[0]}</div></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.pag}>
          <button style={styles.pagBtn(false)} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} style={styles.pagBtn(p === page)} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button style={styles.pagBtn(false)} disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div style={styles.modal} onClick={() => setShowDetail(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{showDetail.name}</div>
              <span style={styles.badge(showDetail.status)}>{showDetail.status}</span>
            </div>
            {showDetail.description && <p style={{ color: '#94a3b8', marginBottom: 16 }}>{showDetail.description}</p>}
            <div style={styles.kv}>
              {['location', 'client', 'manager', 'start_date', 'end_date'].map(k => showDetail[k] && (
                <div key={k} style={styles.kvItem}>
                  <div style={styles.label}>{k.replace('_', ' ')}</div>
                  <div style={{ fontSize: 14 }}>{String(showDetail[k]).split('T')[0]}</div>
                </div>
              ))}
              {showDetail.budget && (
                <div style={styles.kvItem}>
                  <div style={styles.label}>Budget</div>
                  <div style={{ fontSize: 14, color: '#10b981' }}>${Number(showDetail.budget).toLocaleString()}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button style={styles.btn('#ef4444')} onClick={() => handleDelete(showDetail.id)}>Delete</button>
              <button style={styles.btn('#475569')} onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Project</div>
            {formError && <div style={styles.error}>{formError}</div>}
            <form onSubmit={handleCreate}>
              {[['name', 'Project Name *'], ['description', 'Description'], ['location', 'Location'], ['client', 'Client'], ['manager', 'Project Manager']].map(([k, label]) => (
                <div key={k}>
                  <div style={styles.label}>{label}</div>
                  {k === 'description' ? (
                    <textarea
                      value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      rows={3} style={{ ...styles.input, resize: 'vertical' }} />
                  ) : (
                    <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={styles.input} required={k === 'name'} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={styles.label}>Budget ($)</div>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} style={styles.input} />
                </div>
                <div>
                  <div style={styles.label}>Status</div>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...styles.select, width: '100%' }}>
                    {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={styles.label}>Start Date</div>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={styles.input} />
                </div>
                <div>
                  <div style={styles.label}>End Date</div>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={styles.input} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" style={styles.btn('#3b82f6')} disabled={saving}>{saving ? 'Saving...' : 'Create Project'}</button>
                <button type="button" style={styles.btn('#475569')} onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
