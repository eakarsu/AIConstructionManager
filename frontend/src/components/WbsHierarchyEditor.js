import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUS = ['pending', 'in_progress', 'completed', 'on_hold'];

export default function WbsHierarchyEditor() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ parent_id: '', code: '', name: '', trade: 'General', duration_days: 1, status: 'pending', percent_complete: 0 });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const r = await api.get('/custom-views/wbs');
      setItems(r.data.items || []);
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setErr('');
    try {
      const body = { ...form, parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
        duration_days: parseInt(form.duration_days, 10) || 1, percent_complete: parseInt(form.percent_complete, 10) || 0 };
      if (editing) await api.put(`/custom-views/wbs/${editing}`, body);
      else await api.post('/custom-views/wbs', body);
      setForm({ parent_id: '', code: '', name: '', trade: 'General', duration_days: 1, status: 'pending', percent_complete: 0 });
      setEditing(null);
      await load();
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      parent_id: item.parent_id || '', code: item.code, name: item.name, trade: item.trade,
      duration_days: item.duration_days, status: item.status, percent_complete: item.percent_complete,
    });
  };

  const remove = async (id) => {
    try { await api.delete(`/custom-views/wbs/${id}`); await load(); }
    catch (e) { setErr(e.message); }
  };

  const tree = (parentId, depth = 0) => items.filter(i => i.parent_id === parentId).map(item => (
    <React.Fragment key={item.id}>
      <tr style={{ borderBottom: '1px solid #334155' }}>
        <td style={{ padding: 8, color: '#cbd5e1', paddingLeft: 8 + depth * 20 }}>
          <span style={{ color: '#64748b' }}>{'└ '.repeat(depth > 0 ? 1 : 0)}</span>{item.code}
        </td>
        <td style={{ padding: 8, color: '#e2e8f0' }}>{item.name}</td>
        <td style={{ padding: 8, color: '#94a3b8', fontSize: 12 }}>{item.trade}</td>
        <td style={{ padding: 8, color: '#94a3b8', fontSize: 12 }}>{item.duration_days}d</td>
        <td style={{ padding: 8 }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4,
            background: item.status === 'completed' ? '#10b98133' : item.status === 'in_progress' ? '#3b82f633' : '#64748b33',
            color: item.status === 'completed' ? '#10b981' : item.status === 'in_progress' ? '#3b82f6' : '#94a3b8' }}>
            {item.status}
          </span>
        </td>
        <td style={{ padding: 8, color: '#cbd5e1', fontSize: 12 }}>{item.percent_complete}%</td>
        <td style={{ padding: 8 }}>
          <button onClick={() => startEdit(item)} style={{ marginRight: 4, padding: '4px 10px', fontSize: 11, background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
          <button onClick={() => remove(item.id)} style={{ padding: '4px 10px', fontSize: 11, background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 4, cursor: 'pointer' }}>Del</button>
        </td>
      </tr>
      {tree(item.id, depth + 1)}
    </React.Fragment>
  ));

  const inp = { padding: 6, background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 12 };

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>WBS / Task Hierarchy Editor</h3>
      {err && <div style={{ color: '#ef4444', marginBottom: 8 }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        <input style={inp} placeholder="Parent ID (blank=root)" value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} />
        <input style={inp} placeholder="Code (e.g. 5.1)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
        <input style={inp} placeholder="Task name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input style={inp} placeholder="Trade" value={form.trade} onChange={e => setForm({...form, trade: e.target.value})} />
        <input style={inp} type="number" placeholder="Duration days" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} />
        <select style={inp} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input style={inp} type="number" placeholder="% complete" value={form.percent_complete} onChange={e => setForm({...form, percent_complete: e.target.value})} />
        <button onClick={submit} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {editing ? 'Update' : 'Add Task'}
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>Code</th>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>Name</th>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>Trade</th>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>Duration</th>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>%</th>
              <th style={{ padding: 8, textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>{tree(null)}</tbody>
        </table>
      </div>
    </div>
  );
}
