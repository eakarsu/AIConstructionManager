import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const STATIC_LINKS = [
  { to: '/insights/timeline', label: 'Timeline', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/projects-full', label: 'Projects Full', group: 'Workspace' },
  { to: '/change-orders-full', label: 'Change Orders Full', group: 'Workspace' },
  { to: '/daily-reports-full', label: 'Daily Reports Full', group: 'Workspace' },
  { to: '/ai-center', label: 'Ai Center', group: 'AI tools' },
  { to: '/cf/multi-modal-progress-tracking', label: 'Multi Modal Progress Tracking', group: 'Workspace' },
  { to: '/cf/predictive-project-completion', label: 'Predictive Project Completion', group: 'Workspace' },
  { to: '/cf/autonomous-site-monitoring', label: 'Autonomous Site Monitoring', group: 'Workspace' },
  { to: '/cf/supply-chain-optimization', label: 'Supply Chain Optimization', group: 'Workspace' },
  { to: '/cf/worker-wellness-fatigue-monitoring', label: 'Worker Wellness Fatigue Monitoring', group: 'Workspace' },
  { to: '/cf/permitting-regulatory-prediction', label: 'Permitting Regulatory Prediction', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
];

export default function AppSidebar({ features = [] }) {
  const LINKS = [...STATIC_LINKS, ...features.map(feature => ({ to: `/feature/${feature.key}`, label: feature.label, group: 'Workspace' }))];
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIConstruction Manager</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
