-- ============================================================
-- AIConstructionManager Full Schema
-- Run: psql -U postgres -d ai_construction_manager -f schema.sql
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'planning',
  client VARCHAR(255),
  manager VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cost Estimations
CREATE TABLE IF NOT EXISTS cost_estimations (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  variance DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'draft',
  estimator VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  task_name VARCHAR(255),
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  dependencies TEXT,
  assigned_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Safety Incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  incident_type VARCHAR(100),
  description TEXT,
  severity VARCHAR(50),
  location VARCHAR(255),
  reported_by VARCHAR(255),
  date_reported DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'open',
  corrective_action TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Safety Observations
CREATE TABLE IF NOT EXISTS safety_observations (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  observer VARCHAR(255),
  observation_type VARCHAR(100),
  description TEXT,
  location VARCHAR(255),
  severity VARCHAR(50) DEFAULT 'low',
  date_observed DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'open',
  corrective_action TEXT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Toolbox Talks
CREATE TABLE IF NOT EXISTS toolbox_talks (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  topic VARCHAR(255) NOT NULL,
  presenter VARCHAR(255),
  date_conducted DATE DEFAULT CURRENT_DATE,
  attendee_count INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Change Orders
CREATE TABLE IF NOT EXISTS change_orders (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requested_by VARCHAR(255),
  cost_impact DECIMAL(12,2) DEFAULT 0,
  schedule_impact_days INTEGER DEFAULT 0,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'submitted',
  justification TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  supplier VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ordered',
  project_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Labor
CREATE TABLE IF NOT EXISTS labor (
  id SERIAL PRIMARY KEY,
  worker_name VARCHAR(255),
  role VARCHAR(100),
  project_name VARCHAR(255),
  hourly_rate DECIMAL(8,2),
  hours_worked DECIMAL(8,2),
  total_pay DECIMAL(12,2),
  start_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  skills TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  serial_number VARCHAR(100),
  project_name VARCHAR(255),
  daily_rate DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'available',
  operator VARCHAR(255),
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
  next_maintenance DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subcontractors
CREATE TABLE IF NOT EXISTS subcontractors (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  specialty VARCHAR(255),
  project_name VARCHAR(255),
  contract_value DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'active',
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  type VARCHAR(100),
  project_name VARCHAR(255),
  uploaded_by VARCHAR(255),
  description TEXT,
  version VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  file_path VARCHAR(500),
  tags TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  inspector VARCHAR(255),
  type VARCHAR(100),
  date_scheduled DATE,
  date_completed DATE,
  result VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  risk_type VARCHAR(100),
  description TEXT,
  probability VARCHAR(50),
  impact VARCHAR(50),
  risk_score DECIMAL(5,2),
  mitigation TEXT,
  owner VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  allocated_amount DECIMAL(15,2),
  spent_amount DECIMAL(15,2) DEFAULT 0,
  remaining DECIMAL(15,2),
  period VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  approved_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Weather
CREATE TABLE IF NOT EXISTS weather (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  date DATE NOT NULL,
  condition VARCHAR(100),
  temperature DECIMAL(5,2),
  wind_speed DECIMAL(6,2),
  precipitation DECIMAL(6,2),
  impact_level VARCHAR(50),
  work_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily Reports
CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  date DATE DEFAULT CURRENT_DATE,
  weather VARCHAR(100),
  crew_count INTEGER,
  work_completed TEXT,
  issues TEXT,
  materials_used TEXT,
  visitor_log TEXT,
  submitted_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permits
CREATE TABLE IF NOT EXISTS permits (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  permit_type VARCHAR(100),
  issuing_authority VARCHAR(255),
  application_date DATE,
  approval_date DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quality Control
CREATE TABLE IF NOT EXISTS quality_control (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  inspection_area VARCHAR(255),
  inspector VARCHAR(255),
  date DATE DEFAULT CURRENT_DATE,
  standard VARCHAR(255),
  result VARCHAR(50),
  defects_found TEXT,
  corrective_action TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RFIs (Requests for Information)
CREATE TABLE IF NOT EXISTS rfis (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  rfi_number VARCHAR(50),
  subject VARCHAR(255),
  question TEXT,
  submitted_by VARCHAR(255),
  assigned_to VARCHAR(255),
  date_submitted DATE DEFAULT CURRENT_DATE,
  date_due DATE,
  date_responded DATE,
  response TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  cost_impact DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Punch List
CREATE TABLE IF NOT EXISTS punch_list (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  item_number VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  assigned_to VARCHAR(255),
  date_identified DATE DEFAULT CURRENT_DATE,
  date_due DATE,
  date_completed DATE,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Submittals
CREATE TABLE IF NOT EXISTS submittals (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  submittal_number VARCHAR(50),
  title VARCHAR(255),
  spec_section VARCHAR(100),
  submitted_by VARCHAR(255),
  reviewer VARCHAR(255),
  date_submitted DATE DEFAULT CURRENT_DATE,
  date_required DATE,
  date_returned DATE,
  result VARCHAR(50),
  revision INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  contract_number VARCHAR(50),
  title VARCHAR(255),
  contractor VARCHAR(255),
  contract_type VARCHAR(100),
  original_value DECIMAL(15,2),
  revised_value DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  retainage_pct DECIMAL(5,2) DEFAULT 10,
  status VARCHAR(50) DEFAULT 'draft',
  signed_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  worker_name VARCHAR(255),
  role VARCHAR(100),
  date DATE DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  hours_regular DECIMAL(6,2),
  hours_overtime DECIMAL(6,2) DEFAULT 0,
  break_hours DECIMAL(4,2) DEFAULT 0,
  task_description TEXT,
  approved_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meeting Minutes
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  meeting_type VARCHAR(100),
  date DATE DEFAULT CURRENT_DATE,
  location VARCHAR(255),
  attendees TEXT,
  agenda TEXT,
  discussion TEXT,
  action_items TEXT,
  decisions TEXT,
  next_meeting_date DATE,
  recorded_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  date_taken DATE DEFAULT CURRENT_DATE,
  location VARCHAR(255),
  description TEXT,
  phase VARCHAR(100),
  taken_by VARCHAR(255),
  category VARCHAR(100),
  weather_conditions VARCHAR(100),
  tags TEXT,
  file_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Warranties
CREATE TABLE IF NOT EXISTS warranties (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  item VARCHAR(255),
  manufacturer VARCHAR(255),
  warranty_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  duration_years INTEGER,
  coverage TEXT,
  contact_info VARCHAR(255),
  claim_procedure TEXT,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Environmental
CREATE TABLE IF NOT EXISTS environmental (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  compliance_type VARCHAR(100),
  regulation VARCHAR(255),
  description TEXT,
  monitoring_date DATE,
  result VARCHAR(100),
  inspector VARCHAR(255),
  corrective_action TEXT,
  deadline DATE,
  agency VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- BIM (Building Information Modeling)
CREATE TABLE IF NOT EXISTS bim (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  model_name VARCHAR(255),
  discipline VARCHAR(100),
  version VARCHAR(50),
  clash_count INTEGER DEFAULT 0,
  resolved_count INTEGER DEFAULT 0,
  author VARCHAR(255),
  software VARCHAR(100),
  lod_level VARCHAR(50),
  file_size VARCHAR(50),
  last_updated DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_name);
CREATE INDEX IF NOT EXISTS idx_schedules_project ON schedules(project_name);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_project ON safety_incidents(project_name);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_status ON safety_incidents(status);
CREATE INDEX IF NOT EXISTS idx_rfis_status ON rfis(status);
CREATE INDEX IF NOT EXISTS idx_rfis_project ON rfis(project_name);
CREATE INDEX IF NOT EXISTS idx_daily_reports_project ON daily_reports(project_name);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_project ON budgets(project_name);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
