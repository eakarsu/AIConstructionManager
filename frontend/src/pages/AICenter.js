import React, { useState } from 'react';
import api from '../api';
import AIResponseDisplay from '../components/AIResponseDisplay';

// Apply pass 4 backlog endpoints:
//   POST /api/ai/summarize-meeting
//   POST /api/ai/prioritize-punchlist
//   POST /api/ai/analyze-progress-photo
//
// Centralised "AI Center" so users can hit the cross-cutting AI helpers without
// drilling into a specific resource record. JWT bearer is added automatically by
// `frontend/src/api.js`. 503 from BE → user-facing "API key not configured" notice.

const styles = {
  page: {
    padding: '32px 40px',
    maxWidth: 1400,
    margin: '0 auto',
  },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#a78bfa',
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
    borderBottom: '1px solid #334155',
    paddingBottom: 12,
  },
  tab: (active, color) => ({
    padding: '10px 18px',
    borderRadius: 10,
    border: active ? `1px solid ${color}66` : '1px solid #334155',
    background: active ? `${color}22` : 'transparent',
    color: active ? color : '#94a3b8',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    minHeight: 140,
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submit: (color) => ({
    padding: '12px 28px',
    borderRadius: 10,
    border: 'none',
    background: color,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  notice: {
    background: '#7c2d12',
    border: '1px solid #ea580c',
    color: '#fed7aa',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 13,
    marginTop: 16,
  },
};

const TABS = [
  {
    key: 'summarize-meeting',
    label: 'Summarize Meeting',
    icon: '🗓️',
    color: '#9333ea',
    endpoint: '/ai/summarize-meeting',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'meeting_type', label: 'Meeting type', placeholder: 'Owner / Architect / Contractor' },
      { name: 'meeting_date', label: 'Meeting date', placeholder: '2026-05-08', type: 'date' },
      { name: 'attendees', label: 'Attendees (comma-separated)', placeholder: 'PM, Owner, Architect' },
      {
        name: 'minutes_text',
        label: 'Meeting minutes (raw text)',
        textarea: true,
        required: true,
        placeholder: 'Paste raw notes here…',
      },
    ],
  },
  {
    key: 'prioritize-punchlist',
    label: 'Prioritize Punch List',
    icon: '📌',
    color: '#ca8a04',
    endpoint: '/ai/prioritize-punchlist',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'project_phase', label: 'Project phase', placeholder: 'Pre-substantial completion' },
      { name: 'target_closeout_date', label: 'Target closeout date', placeholder: '2026-06-15', type: 'date' },
      {
        name: 'items',
        label: 'Punch list items (one per line)',
        textarea: true,
        required: true,
        placeholder: 'Door 12 hardware misaligned\nLobby paint touch-ups\nHVAC balancing report missing\n…',
        transform: 'lines',
      },
    ],
  },
  {
    key: 'analyze-progress-photo',
    label: 'Analyze Progress Photo',
    icon: '📸',
    color: '#c026d3',
    endpoint: '/ai/analyze-progress-photo',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'project_phase', label: 'Project phase', placeholder: 'MEP rough-in' },
      { name: 'date_taken', label: 'Date taken', placeholder: '2026-05-08', type: 'date' },
      { name: 'location', label: 'Location on site', placeholder: 'Level 3, NE corner' },
      { name: 'weather', label: 'Weather', placeholder: 'Sunny 68F' },
      { name: 'expected_state', label: 'Expected state at this date', placeholder: 'Drywall hung, HVAC trunks visible' },
      {
        name: 'photo_description',
        label: 'Describe the photo (natural language)',
        textarea: true,
        required: true,
        placeholder: 'View shows electrical rough-in along north wall…',
      },
    ],
  },
  {
    key: 'equipment-utilization',
    label: 'Equipment Utilization',
    icon: '🚜',
    color: '#f97316',
    endpoint: '/ai/equipment-utilization',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'project_phase', label: 'Project phase', placeholder: 'Site work' },
      { name: 'recent_idle_days', label: 'Recent idle days (last 30)', placeholder: '4' },
      {
        name: 'fleet',
        label: 'Fleet (one asset per line, e.g. "CAT 320 — excavator — 22h/wk")',
        textarea: true,
        required: true,
        placeholder: 'CAT 320 — excavator — 22h/wk\nJLG 600S — boom lift — 8h/wk\nGenie GTH-636 — telehandler — 35h/wk',
        transform: 'lines',
      },
    ],
  },
  {
    key: 'permits-risk',
    label: 'Permits Risk',
    icon: '📜',
    color: '#d946ef',
    endpoint: '/ai/permits-risk',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'project_type', label: 'Project type', placeholder: 'Commercial 4-story office' },
      { name: 'jurisdiction', label: 'Jurisdiction', placeholder: 'City of Austin, TX' },
      { name: 'target_start_date', label: 'Target construction start', placeholder: '2026-08-01', type: 'date' },
      {
        name: 'permit_list',
        label: 'Permits (one per line)',
        textarea: true,
        required: true,
        placeholder: 'Building\nDemolition\nMEP\nROW / Driveway\nFire Alarm\n…',
        transform: 'lines',
      },
    ],
  },
  {
    key: 'submittals-review',
    label: 'Submittals Review',
    icon: '📨',
    color: '#0d9488',
    endpoint: '/ai/submittals-review',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'submittal_number', label: 'Submittal number', placeholder: '03-30-00.001' },
      { name: 'spec_section', label: 'Spec section', placeholder: '03 30 00 — Cast-in-Place Concrete' },
      { name: 'manufacturer', label: 'Manufacturer', placeholder: 'BASF / Sika / etc.' },
      {
        name: 'submittal_text',
        label: 'Submittal content (paste data sheet text / cover letter)',
        textarea: true,
        required: true,
        placeholder: 'Paste submittal cover letter and key data sheet text…',
      },
    ],
  },
  {
    key: 'warranty-claim',
    label: 'Warranty Claim',
    icon: '🛡️',
    color: '#0891b2',
    endpoint: '/ai/warranty-claim',
    fields: [
      { name: 'project_name', label: 'Project name', placeholder: 'Acme HQ' },
      { name: 'item', label: 'Item under warranty', placeholder: 'TPO roofing membrane', required: true },
      { name: 'manufacturer', label: 'Manufacturer', placeholder: 'Carlisle SynTec' },
      { name: 'warranty_type', label: 'Warranty type', placeholder: '20-yr NDL' },
      { name: 'install_date', label: 'Install date', placeholder: '2024-09-15', type: 'date' },
      {
        name: 'issue_description',
        label: 'Describe the failure / issue',
        textarea: true,
        required: true,
        placeholder: 'Membrane seams separating along north parapet, ponding water observed…',
      },
    ],
  },
];

export default function AICenter() {
  const [activeKey, setActiveKey] = useState(TABS[0].key);
  const tab = TABS.find((t) => t.key === activeKey);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>🤖 AI Center</div>
        <div style={styles.subtitle}>
          Cross-cutting construction AI helpers — meeting summaries, punch-list prioritisation, and progress-photo analysis.
        </div>
      </div>

      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            style={styles.tab(t.key === activeKey, t.color)}
            onClick={() => setActiveKey(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AIToolForm key={activeKey} tab={tab} />
    </div>
  );
}

function AIToolForm({ tab }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    const missing = tab.fields.filter((f) => f.required && !form[f.name]);
    if (missing.length) {
      setError(`Missing required: ${missing.map((m) => m.label).join(', ')}`);
      return;
    }

    const payload = { ...form };
    tab.fields.forEach((f) => {
      if (f.transform === 'lines' && typeof payload[f.name] === 'string') {
        payload[f.name] = payload[f.name]
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    });

    setLoading(true);
    try {
      const res = await api.post(tab.endpoint, payload);
      setResponse(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 503) {
        setError(
          err.response?.data?.error ||
            'AI service unavailable: OpenRouter API key not configured on the backend (.env).'
        );
      } else if (status === 422) {
        setError(err.response?.data?.error || 'Missing required fields.');
      } else if (status === 429) {
        setError(err.response?.data?.error || 'AI rate limit exceeded. Please retry later.');
      } else {
        setError(err.response?.data?.error || err.message || 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form style={styles.card} onSubmit={submit}>
      {tab.fields.map((f) => (
        <div key={f.name} style={styles.field}>
          <label style={styles.label}>
            {f.label}
            {f.required ? ' *' : ''}
          </label>
          {f.textarea ? (
            <textarea
              style={styles.textarea}
              value={form[f.name] || ''}
              onChange={(e) => setField(f.name, e.target.value)}
              placeholder={f.placeholder || ''}
            />
          ) : (
            <input
              style={styles.input}
              type={f.type || 'text'}
              value={form[f.name] || ''}
              onChange={(e) => setField(f.name, e.target.value)}
              placeholder={f.placeholder || ''}
            />
          )}
        </div>
      ))}

      <button type="submit" style={styles.submit(tab.color)} disabled={loading}>
        {loading ? 'Running…' : `Run ${tab.label}`}
      </button>

      {error && <div style={styles.notice}>{error}</div>}
      {response && (
        <div style={{ marginTop: 20 }}>
          <AIResponseDisplay response={response} title={tab.label} />
        </div>
      )}
    </form>
  );
}
