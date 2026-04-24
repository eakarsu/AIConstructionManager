const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Creating tables...');

  await pool.query(`
    DROP TABLE IF EXISTS bim_models CASCADE;
    DROP TABLE IF EXISTS environmental_compliance CASCADE;
    DROP TABLE IF EXISTS warranties CASCADE;
    DROP TABLE IF EXISTS progress_photos CASCADE;
    DROP TABLE IF EXISTS meeting_minutes CASCADE;
    DROP TABLE IF EXISTS timesheets CASCADE;
    DROP TABLE IF EXISTS contracts CASCADE;
    DROP TABLE IF EXISTS submittals CASCADE;
    DROP TABLE IF EXISTS punch_list CASCADE;
    DROP TABLE IF EXISTS rfis CASCADE;
    DROP TABLE IF EXISTS quality_control CASCADE;
    DROP TABLE IF EXISTS permits CASCADE;
    DROP TABLE IF EXISTS daily_reports CASCADE;
    DROP TABLE IF EXISTS weather_impacts CASCADE;
    DROP TABLE IF EXISTS budgets CASCADE;
    DROP TABLE IF EXISTS risk_assessments CASCADE;
    DROP TABLE IF EXISTS inspections CASCADE;
    DROP TABLE IF EXISTS documents CASCADE;
    DROP TABLE IF EXISTS subcontractors CASCADE;
    DROP TABLE IF EXISTS equipment CASCADE;
    DROP TABLE IF EXISTS labor CASCADE;
    DROP TABLE IF EXISTS materials CASCADE;
    DROP TABLE IF EXISTS change_orders CASCADE;
    DROP TABLE IF EXISTS safety_incidents CASCADE;
    DROP TABLE IF EXISTS schedules CASCADE;
    DROP TABLE IF EXISTS cost_estimations CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'manager',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      start_date DATE,
      end_date DATE,
      budget DECIMAL(15,2),
      status VARCHAR(50) DEFAULT 'Active',
      client VARCHAR(255),
      manager VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE cost_estimations (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      description TEXT,
      category VARCHAR(100),
      estimated_cost DECIMAL(15,2),
      actual_cost DECIMAL(15,2),
      variance DECIMAL(15,2),
      status VARCHAR(50) DEFAULT 'Draft',
      estimator VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE schedules (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      task_name VARCHAR(255),
      start_date DATE,
      end_date DATE,
      duration_days INTEGER,
      dependencies VARCHAR(255),
      assigned_to VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Pending',
      priority VARCHAR(50) DEFAULT 'Medium',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE safety_incidents (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      incident_type VARCHAR(100),
      description TEXT,
      severity VARCHAR(50),
      location VARCHAR(255),
      reported_by VARCHAR(255),
      date_reported DATE,
      status VARCHAR(50) DEFAULT 'Open',
      corrective_action TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE change_orders (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      title VARCHAR(255),
      description TEXT,
      requested_by VARCHAR(255),
      cost_impact DECIMAL(15,2),
      schedule_impact_days INTEGER,
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Pending',
      justification TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE materials (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      category VARCHAR(100),
      quantity DECIMAL(10,2),
      unit VARCHAR(50),
      unit_cost DECIMAL(10,2),
      total_cost DECIMAL(15,2),
      supplier VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Ordered',
      project_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE labor (
      id SERIAL PRIMARY KEY,
      worker_name VARCHAR(255),
      role VARCHAR(100),
      project_name VARCHAR(255),
      hourly_rate DECIMAL(10,2),
      hours_worked DECIMAL(10,2),
      total_pay DECIMAL(15,2),
      start_date DATE,
      status VARCHAR(50) DEFAULT 'Active',
      skills TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE equipment (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      type VARCHAR(100),
      serial_number VARCHAR(100),
      project_name VARCHAR(255),
      daily_rate DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'Available',
      operator VARCHAR(255),
      condition_rating VARCHAR(50),
      next_maintenance DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE subcontractors (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255),
      contact_person VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      specialty VARCHAR(100),
      project_name VARCHAR(255),
      contract_value DECIMAL(15,2),
      status VARCHAR(50) DEFAULT 'Active',
      rating VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      type VARCHAR(100),
      project_name VARCHAR(255),
      uploaded_by VARCHAR(255),
      description TEXT,
      version VARCHAR(20),
      status VARCHAR(50) DEFAULT 'Current',
      file_path VARCHAR(500),
      tags VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE inspections (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      inspector VARCHAR(255),
      type VARCHAR(100),
      date_scheduled DATE,
      date_completed DATE,
      result VARCHAR(50),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'Scheduled',
      follow_up_required VARCHAR(10) DEFAULT 'No',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE risk_assessments (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      risk_type VARCHAR(100),
      description TEXT,
      probability VARCHAR(50),
      impact VARCHAR(50),
      risk_score VARCHAR(50),
      mitigation TEXT,
      owner VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE budgets (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      category VARCHAR(100),
      allocated_amount DECIMAL(15,2),
      spent_amount DECIMAL(15,2),
      remaining DECIMAL(15,2),
      period VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Active',
      approved_by VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE weather_impacts (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      date DATE,
      condition VARCHAR(100),
      temperature VARCHAR(50),
      wind_speed VARCHAR(50),
      precipitation VARCHAR(50),
      impact_level VARCHAR(50),
      work_status VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE daily_reports (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      date DATE,
      weather VARCHAR(100),
      crew_count INTEGER,
      work_completed TEXT,
      issues TEXT,
      materials_used TEXT,
      visitor_log TEXT,
      submitted_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE permits (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      permit_type VARCHAR(100),
      issuing_authority VARCHAR(255),
      application_date DATE,
      approval_date DATE,
      expiry_date DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      cost DECIMAL(10,2),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE quality_control (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      inspection_area VARCHAR(255),
      inspector VARCHAR(255),
      date DATE,
      standard VARCHAR(100),
      result VARCHAR(50),
      defects_found TEXT,
      corrective_action TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE rfis (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      rfi_number VARCHAR(50),
      subject VARCHAR(255),
      question TEXT,
      submitted_by VARCHAR(255),
      assigned_to VARCHAR(255),
      date_submitted DATE,
      date_due DATE,
      date_responded DATE,
      response TEXT,
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      cost_impact DECIMAL(15,2),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE punch_list (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      item_number VARCHAR(50),
      location VARCHAR(255),
      description TEXT,
      category VARCHAR(100),
      assigned_to VARCHAR(255),
      date_identified DATE,
      date_due DATE,
      date_completed DATE,
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE submittals (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      submittal_number VARCHAR(50),
      title VARCHAR(255),
      spec_section VARCHAR(100),
      submitted_by VARCHAR(255),
      reviewer VARCHAR(255),
      date_submitted DATE,
      date_required DATE,
      date_returned DATE,
      result VARCHAR(50),
      revision VARCHAR(20),
      status VARCHAR(50) DEFAULT 'Pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE contracts (
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
      retainage_pct DECIMAL(5,2),
      status VARCHAR(50) DEFAULT 'Active',
      signed_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE timesheets (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      worker_name VARCHAR(255),
      role VARCHAR(100),
      date DATE,
      start_time VARCHAR(20),
      end_time VARCHAR(20),
      hours_regular DECIMAL(5,2),
      hours_overtime DECIMAL(5,2),
      break_hours DECIMAL(5,2),
      task_description TEXT,
      approved_by VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE meeting_minutes (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      meeting_type VARCHAR(100),
      date DATE,
      location VARCHAR(255),
      attendees TEXT,
      agenda TEXT,
      discussion TEXT,
      action_items TEXT,
      decisions TEXT,
      next_meeting_date DATE,
      recorded_by VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Draft',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE progress_photos (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      date_taken DATE,
      location VARCHAR(255),
      description TEXT,
      phase VARCHAR(100),
      taken_by VARCHAR(255),
      category VARCHAR(100),
      weather_conditions VARCHAR(100),
      tags VARCHAR(255),
      file_path VARCHAR(500),
      status VARCHAR(50) DEFAULT 'Current',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE warranties (
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
      status VARCHAR(50) DEFAULT 'Active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE environmental_compliance (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      compliance_type VARCHAR(100),
      regulation VARCHAR(255),
      description TEXT,
      monitoring_date DATE,
      result VARCHAR(50),
      inspector VARCHAR(255),
      corrective_action TEXT,
      deadline DATE,
      agency VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE bim_models (
      id SERIAL PRIMARY KEY,
      project_name VARCHAR(255),
      model_name VARCHAR(255),
      discipline VARCHAR(100),
      version VARCHAR(20),
      clash_count INTEGER,
      resolved_count INTEGER,
      author VARCHAR(255),
      software VARCHAR(100),
      lod_level VARCHAR(50),
      file_size VARCHAR(50),
      last_updated DATE,
      status VARCHAR(50) DEFAULT 'In Progress',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('Tables created. Seeding data...');

  // Seed user
  const hash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    ['Admin User', 'admin@construction.com', hash, 'admin']
  );

  // Seed projects (15)
  const projects = [
    ['Skyline Tower', 'A 45-story mixed-use skyscraper in downtown', 'New York, NY', '2024-01-15', '2026-06-30', 285000000, 'Active', 'Metro Corp', 'John Smith'],
    ['Harbor Bridge Expansion', 'Expanding the existing harbor bridge to 6 lanes', 'San Francisco, CA', '2024-03-01', '2025-12-31', 120000000, 'Active', 'City of SF', 'Sarah Johnson'],
    ['Green Valley Mall', 'Eco-friendly shopping center with solar panels', 'Austin, TX', '2024-02-01', '2025-08-15', 95000000, 'Active', 'Valley Retail LLC', 'Mike Chen'],
    ['Riverside Hospital Wing', 'New emergency wing and ICU expansion', 'Chicago, IL', '2024-04-10', '2025-11-30', 175000000, 'In Progress', 'Riverside Health', 'Lisa Park'],
    ['Mountain View Condos', 'Luxury 200-unit condominium complex', 'Denver, CO', '2024-01-20', '2025-09-30', 65000000, 'Active', 'Peak Living Inc', 'Tom Davis'],
    ['Tech Campus Phase 2', 'Corporate campus expansion with 3 buildings', 'Seattle, WA', '2024-05-01', '2026-03-15', 220000000, 'Planning', 'TechGiant Corp', 'Amy Wilson'],
    ['Highway 101 Overpass', 'New overpass and interchange construction', 'Los Angeles, CA', '2024-06-15', '2025-12-01', 88000000, 'Active', 'CalTrans', 'Robert Lee'],
    ['Sunset Elementary School', 'New K-6 school construction', 'Phoenix, AZ', '2024-03-20', '2025-06-30', 42000000, 'In Progress', 'Phoenix USD', 'Karen White'],
    ['Marina Bay Resort', 'Beachfront resort with 300 rooms', 'Miami, FL', '2024-07-01', '2026-01-15', 310000000, 'Planning', 'Coastal Resorts', 'David Brown'],
    ['Central Park Renovation', 'Historic park renovation and modernization', 'Portland, OR', '2024-02-15', '2025-04-30', 28000000, 'Active', 'City of Portland', 'Jennifer Taylor'],
    ['Solar Farm Installation', 'Large-scale 500MW solar farm', 'Nevada', '2024-08-01', '2025-10-31', 450000000, 'Planning', 'SunPower Inc', 'Chris Martin'],
    ['Metro Line Extension', 'Underground metro line 5-mile extension', 'Boston, MA', '2024-01-10', '2027-06-30', 890000000, 'Active', 'MBTA', 'Patricia Garcia'],
    ['Water Treatment Plant', 'New municipal water treatment facility', 'Houston, TX', '2024-04-01', '2025-12-15', 155000000, 'In Progress', 'City of Houston', 'James Wilson'],
    ['Airport Terminal B', 'New international terminal construction', 'Atlanta, GA', '2024-09-01', '2027-03-31', 1200000000, 'Planning', 'Hartsfield-Jackson', 'Michelle Adams'],
    ['Industrial Park Complex', 'Multi-building industrial and warehouse complex', 'Dallas, TX', '2024-05-15', '2025-11-30', 78000000, 'Active', 'DFW Industrial', 'Steven Clark'],
  ];
  for (const p of projects) {
    await pool.query(
      `INSERT INTO projects (name,description,location,start_date,end_date,budget,status,client,manager) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      p
    );
  }

  // Seed cost_estimations (15)
  const costs = [
    ['Skyline Tower', 'Foundation and structural steel', 'Structural', 45000000, 47200000, 2200000, 'Approved', 'Mark Stevens', 'Includes deep foundation piles'],
    ['Skyline Tower', 'MEP systems installation', 'Mechanical', 32000000, null, null, 'Draft', 'Sarah Kim', 'HVAC, electrical, plumbing'],
    ['Harbor Bridge Expansion', 'Bridge deck replacement', 'Infrastructure', 28000000, 26500000, -1500000, 'Approved', 'Tom Lee', 'Under budget due to material savings'],
    ['Green Valley Mall', 'Solar panel installation', 'Renewable Energy', 8500000, null, null, 'Pending', 'Chris Park', '2000 panel array'],
    ['Riverside Hospital Wing', 'Medical equipment procurement', 'Equipment', 22000000, 23100000, 1100000, 'Approved', 'Dr. Adams', 'ICU and ER equipment'],
    ['Mountain View Condos', 'Interior finishes all units', 'Finishing', 12000000, null, null, 'Draft', 'Lisa Chen', 'Premium finishes specified'],
    ['Tech Campus Phase 2', 'Data center infrastructure', 'Technology', 45000000, null, null, 'Pending', 'Jason Wu', 'Tier 4 data center'],
    ['Highway 101 Overpass', 'Earthwork and grading', 'Site Work', 5600000, 5800000, 200000, 'Approved', 'Mike Johnson', 'Rock removal needed'],
    ['Sunset Elementary School', 'Classroom construction 24 rooms', 'Building', 18000000, 17500000, -500000, 'Approved', 'Karen Davis', 'Modular construction approach'],
    ['Marina Bay Resort', 'Pool and spa complex', 'Amenities', 15000000, null, null, 'Draft', 'David Martinez', 'Olympic-size pool included'],
    ['Central Park Renovation', 'Landscaping and irrigation', 'Landscaping', 8000000, 8200000, 200000, 'Approved', 'Emily Green', 'Native plant species'],
    ['Solar Farm Installation', 'Photovoltaic modules', 'Equipment', 180000000, null, null, 'Pending', 'Alex Sun', 'Tier 1 modules'],
    ['Metro Line Extension', 'Tunnel boring machine operation', 'Infrastructure', 120000000, 125000000, 5000000, 'Approved', 'Pat Garcia', 'Unexpected rock formations'],
    ['Water Treatment Plant', 'Filtration system', 'Equipment', 35000000, null, null, 'Draft', 'Rachel Wong', 'Reverse osmosis system'],
    ['Airport Terminal B', 'Steel structure and facade', 'Structural', 280000000, null, null, 'Pending', 'Sam Taylor', 'Curved glass facade design'],
  ];
  for (const c of costs) {
    await pool.query(
      `INSERT INTO cost_estimations (project_name,description,category,estimated_cost,actual_cost,variance,status,estimator,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      c
    );
  }

  // Seed schedules (15)
  const schedules = [
    ['Skyline Tower', 'Foundation Work', '2024-01-15', '2024-06-30', 167, 'None', 'Foundation Team', 'Completed', 'High'],
    ['Skyline Tower', 'Steel Erection', '2024-07-01', '2025-03-31', 274, 'Foundation Work', 'Steel Team', 'In Progress', 'Critical'],
    ['Harbor Bridge Expansion', 'Traffic Rerouting', '2024-03-01', '2024-03-15', 14, 'None', 'Traffic Dept', 'Completed', 'High'],
    ['Harbor Bridge Expansion', 'Demolition Phase', '2024-03-16', '2024-05-31', 76, 'Traffic Rerouting', 'Demo Crew', 'Completed', 'High'],
    ['Green Valley Mall', 'Site Preparation', '2024-02-01', '2024-04-15', 74, 'None', 'Site Crew', 'Completed', 'Medium'],
    ['Green Valley Mall', 'Foundation Pour', '2024-04-16', '2024-07-31', 106, 'Site Preparation', 'Concrete Team', 'In Progress', 'High'],
    ['Riverside Hospital Wing', 'Excavation', '2024-04-10', '2024-05-20', 40, 'None', 'Excavation Team', 'Completed', 'High'],
    ['Riverside Hospital Wing', 'Concrete Structure', '2024-05-21', '2024-10-15', 147, 'Excavation', 'Structure Team', 'In Progress', 'Critical'],
    ['Mountain View Condos', 'Framing - Building A', '2024-05-01', '2024-08-30', 122, 'Foundation', 'Framing Crew', 'In Progress', 'High'],
    ['Tech Campus Phase 2', 'Design Finalization', '2024-05-01', '2024-08-01', 92, 'None', 'Design Team', 'In Progress', 'High'],
    ['Highway 101 Overpass', 'Pile Driving', '2024-06-15', '2024-09-15', 92, 'None', 'Pile Crew', 'In Progress', 'Critical'],
    ['Sunset Elementary School', 'Roofing', '2024-09-01', '2024-11-30', 91, 'Framing', 'Roofing Team', 'Pending', 'Medium'],
    ['Marina Bay Resort', 'Permitting Phase', '2024-07-01', '2024-10-01', 92, 'None', 'Legal Team', 'In Progress', 'High'],
    ['Metro Line Extension', 'Tunnel Boring Segment 1', '2024-03-01', '2025-01-31', 337, 'None', 'TBM Team', 'In Progress', 'Critical'],
    ['Airport Terminal B', 'Environmental Review', '2024-09-01', '2025-03-01', 182, 'None', 'Environmental Team', 'In Progress', 'High'],
  ];
  for (const s of schedules) {
    await pool.query(
      `INSERT INTO schedules (project_name,task_name,start_date,end_date,duration_days,dependencies,assigned_to,status,priority) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      s
    );
  }

  // Seed safety_incidents (15)
  const safety = [
    ['Skyline Tower', 'Fall Hazard', 'Worker found without harness on 12th floor', 'High', 'Floor 12', 'Jim Peters', '2024-06-15', 'Resolved', 'Safety briefing conducted, harness policy reinforced'],
    ['Skyline Tower', 'Equipment Malfunction', 'Tower crane hydraulic leak detected', 'Critical', 'Main crane', 'Bob Williams', '2024-07-20', 'Resolved', 'Crane serviced and certified'],
    ['Harbor Bridge Expansion', 'Near Miss', 'Steel beam swung near worker during lift', 'High', 'Section B', 'Carlos Rodriguez', '2024-05-10', 'Resolved', 'Rigging procedures updated'],
    ['Harbor Bridge Expansion', 'Chemical Exposure', 'Paint fumes exceeded safe levels', 'Medium', 'Painting station', 'Maria Santos', '2024-08-05', 'Open', 'Better ventilation being installed'],
    ['Green Valley Mall', 'Electrical Hazard', 'Exposed wiring in temporary panel', 'High', 'Electrical room', 'Dave Thomas', '2024-06-22', 'Resolved', 'Panel replaced and inspected'],
    ['Riverside Hospital Wing', 'Slip/Trip', 'Worker slipped on wet concrete', 'Low', 'Ground floor', 'Nancy Drew', '2024-07-18', 'Resolved', 'Non-slip mats placed'],
    ['Mountain View Condos', 'Excavation Cave-in', 'Minor trench wall collapse', 'Critical', 'Building C excavation', 'Pete Johnson', '2024-06-30', 'Resolved', 'Trench boxes installed'],
    ['Tech Campus Phase 2', 'Heat Stress', '2 workers showing heat exhaustion signs', 'Medium', 'Outdoor area', 'Lisa Wang', '2024-08-10', 'Open', 'Hydration stations added'],
    ['Highway 101 Overpass', 'Traffic Incident', 'Vehicle entered work zone', 'High', 'Westbound lane', 'Officer Brown', '2024-07-25', 'Resolved', 'Barriers reinforced'],
    ['Sunset Elementary School', 'Noise Violation', 'Equipment exceeded noise limits near school', 'Low', 'North boundary', 'Principal Jones', '2024-08-01', 'Open', 'Work hours adjusted'],
    ['Marina Bay Resort', 'Marine Hazard', 'Worker almost fell into water during pier work', 'High', 'Pier area', 'Jake Fisher', '2024-09-05', 'Open', 'Life vests mandatory'],
    ['Central Park Renovation', 'Tree Fall', 'Dead tree branch fell near workers', 'Medium', 'Section 3', 'Park Ranger Hill', '2024-05-20', 'Resolved', 'Tree survey completed'],
    ['Solar Farm Installation', 'Electrical Shock', 'Minor shock during panel connection', 'High', 'Array B', 'Tech Mike', '2024-09-15', 'Open', 'Lockout/tagout review'],
    ['Metro Line Extension', 'Confined Space', 'Air quality alarm in tunnel', 'Critical', 'Tunnel Section 2', 'Safety Officer Kim', '2024-08-22', 'Resolved', 'Ventilation upgraded'],
    ['Water Treatment Plant', 'Chemical Spill', 'Minor chlorine solution spill', 'Medium', 'Chemical storage', 'Chem Tech Rob', '2024-09-01', 'Open', 'Containment barriers installed'],
  ];
  for (const s of safety) {
    await pool.query(
      `INSERT INTO safety_incidents (project_name,incident_type,description,severity,location,reported_by,date_reported,status,corrective_action) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      s
    );
  }

  // Seed change_orders (15)
  const changeOrders = [
    ['Skyline Tower', 'Add Helipad to Roof', 'Client requests helipad addition on building roof', 'Metro Corp', 4500000, 45, 'High', 'Approved', 'Client requirement for executive transport'],
    ['Skyline Tower', 'Upgrade Elevator System', 'Change from standard to high-speed elevators', 'Architect', 2800000, 30, 'Medium', 'Pending', 'Building height requires faster elevators'],
    ['Harbor Bridge Expansion', 'Widen Pedestrian Path', 'Increase pedestrian walkway from 8ft to 12ft', 'City Council', 1200000, 20, 'Medium', 'Approved', 'Community feedback'],
    ['Green Valley Mall', 'Add EV Charging Stations', 'Install 50 EV charging stations in parking', 'Valley Retail LLC', 750000, 15, 'Low', 'Approved', 'Green initiative'],
    ['Riverside Hospital Wing', 'Expand ICU by 10 Beds', 'Increase ICU capacity from 20 to 30 beds', 'Hospital Board', 8500000, 60, 'Critical', 'Pending', 'COVID preparedness'],
    ['Mountain View Condos', 'Upgrade to Smart Home', 'Add smart home technology to all units', 'Peak Living Inc', 3200000, 25, 'Medium', 'Approved', 'Market demand'],
    ['Tech Campus Phase 2', 'Add Underground Parking', 'Additional 500-space underground parking', 'TechGiant Corp', 15000000, 90, 'High', 'Pending', 'Employee capacity increase'],
    ['Highway 101 Overpass', 'Sound Barrier Addition', 'Add sound barriers for residential area', 'Residents Assoc', 2100000, 30, 'Medium', 'Approved', 'Noise complaint resolution'],
    ['Sunset Elementary School', 'Add Solar Canopy', 'Solar panel canopy over playground', 'Phoenix USD', 1800000, 20, 'Low', 'Pending', 'Energy savings initiative'],
    ['Marina Bay Resort', 'Upgrade Pool to Infinity', 'Change standard pool to infinity edge design', 'Coastal Resorts', 3500000, 35, 'Medium', 'Approved', 'Premium guest experience'],
    ['Central Park Renovation', 'Add Amphitheater', 'Small outdoor amphitheater for events', 'City of Portland', 2200000, 40, 'Medium', 'Pending', 'Community events space'],
    ['Solar Farm Installation', 'Add Battery Storage', 'Include 100MWh battery storage system', 'SunPower Inc', 45000000, 60, 'High', 'Pending', 'Grid stability requirement'],
    ['Metro Line Extension', 'Add Emergency Exit', 'Additional emergency exit at mile marker 3', 'Safety Board', 6000000, 45, 'Critical', 'Approved', 'Safety code compliance'],
    ['Water Treatment Plant', 'Upgrade Filtration', 'Add advanced UV filtration system', 'EPA', 4200000, 30, 'High', 'Approved', 'New EPA regulation'],
    ['Airport Terminal B', 'Add Automated Baggage', 'Automated baggage handling system upgrade', 'Airport Authority', 25000000, 75, 'High', 'Pending', 'Capacity improvement'],
  ];
  for (const c of changeOrders) {
    await pool.query(
      `INSERT INTO change_orders (project_name,title,description,requested_by,cost_impact,schedule_impact_days,priority,status,justification) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      c
    );
  }

  // Seed materials (15)
  const materials = [
    ['Structural Steel I-Beams', 'Steel', 500, 'tons', 1200, 600000, 'US Steel Corp', 'Delivered', 'Skyline Tower'],
    ['Ready-Mix Concrete C40', 'Concrete', 2000, 'cubic yards', 150, 300000, 'ConcreteMix Inc', 'Delivered', 'Skyline Tower'],
    ['Rebar Grade 60', 'Steel', 200, 'tons', 800, 160000, 'RebarPro', 'In Transit', 'Harbor Bridge Expansion'],
    ['Solar Panels 400W', 'Electrical', 2000, 'units', 280, 560000, 'SolarTech', 'Ordered', 'Green Valley Mall'],
    ['Medical Grade Flooring', 'Finishing', 50000, 'sq ft', 8.5, 425000, 'MedFloor Inc', 'Delivered', 'Riverside Hospital Wing'],
    ['Copper Wiring 12 AWG', 'Electrical', 100000, 'feet', 0.45, 45000, 'WireCo', 'Delivered', 'Mountain View Condos'],
    ['Fire-Rated Drywall', 'Building', 30000, 'sheets', 18, 540000, 'DrywallPro', 'In Transit', 'Tech Campus Phase 2'],
    ['Asphalt Hot Mix', 'Paving', 5000, 'tons', 95, 475000, 'PavePro Inc', 'Delivered', 'Highway 101 Overpass'],
    ['Classroom Furniture Sets', 'Furnishing', 24, 'sets', 3500, 84000, 'EduFurnish', 'Ordered', 'Sunset Elementary School'],
    ['Marble Tile 24x24', 'Finishing', 20000, 'sq ft', 12, 240000, 'MarbleLux', 'Ordered', 'Marina Bay Resort'],
    ['PVC Pipe 6 inch', 'Plumbing', 10000, 'feet', 4.5, 45000, 'PipeCo', 'Delivered', 'Central Park Renovation'],
    ['Photovoltaic Modules', 'Electrical', 50000, 'units', 200, 10000000, 'SunModule Corp', 'Ordered', 'Solar Farm Installation'],
    ['Tunnel Lining Segments', 'Infrastructure', 5000, 'units', 500, 2500000, 'TunnelTech', 'In Transit', 'Metro Line Extension'],
    ['Water Treatment Membranes', 'Equipment', 500, 'units', 2500, 1250000, 'AquaPure', 'Ordered', 'Water Treatment Plant'],
    ['Aluminum Curtain Wall', 'Facade', 80000, 'sq ft', 45, 3600000, 'FacadeGlobal', 'Ordered', 'Airport Terminal B'],
  ];
  for (const m of materials) {
    await pool.query(
      `INSERT INTO materials (name,category,quantity,unit,unit_cost,total_cost,supplier,status,project_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      m
    );
  }

  // Seed labor (15)
  const labor = [
    ['John Martinez', 'Ironworker', 'Skyline Tower', 65, 480, 31200, '2024-01-15', 'Active', 'Structural steel, welding, rigging'],
    ['Mike O\'Brien', 'Crane Operator', 'Skyline Tower', 75, 420, 31500, '2024-02-01', 'Active', 'Tower crane certified, 20yr exp'],
    ['Sarah Chen', 'Electrician', 'Harbor Bridge Expansion', 58, 360, 20880, '2024-03-01', 'Active', 'High voltage, bridge systems'],
    ['Carlos Ruiz', 'Concrete Finisher', 'Green Valley Mall', 52, 400, 20800, '2024-02-15', 'Active', 'Decorative concrete, stamping'],
    ['David Kim', 'Plumber', 'Riverside Hospital Wing', 55, 350, 19250, '2024-04-10', 'Active', 'Medical gas systems, backflow'],
    ['James Wilson', 'Carpenter', 'Mountain View Condos', 48, 440, 21120, '2024-03-01', 'Active', 'Finish carpentry, cabinets'],
    ['Robert Taylor', 'HVAC Technician', 'Tech Campus Phase 2', 62, 380, 23560, '2024-05-01', 'Active', 'Commercial HVAC, controls'],
    ['Lisa Anderson', 'Safety Officer', 'Highway 101 Overpass', 70, 400, 28000, '2024-06-15', 'Active', 'OSHA 500, first aid, hazmat'],
    ['Tom Harris', 'Heavy Equipment Op', 'Sunset Elementary School', 58, 420, 24360, '2024-03-20', 'Active', 'Excavator, dozer, grader'],
    ['Maria Gonzalez', 'Painter', 'Marina Bay Resort', 42, 300, 12600, '2024-08-01', 'Active', 'Commercial painting, waterproof'],
    ['Chris Brown', 'Landscaper', 'Central Park Renovation', 38, 350, 13300, '2024-02-15', 'Active', 'Irrigation, native plants'],
    ['Paul White', 'Solar Installer', 'Solar Farm Installation', 52, 400, 20800, '2024-08-01', 'Active', 'PV installation, inverters'],
    ['Kevin Lee', 'Tunnel Worker', 'Metro Line Extension', 72, 460, 33120, '2024-01-10', 'Active', 'TBM operation, shotcrete'],
    ['Amy Zhang', 'Chemical Engineer', 'Water Treatment Plant', 85, 380, 32300, '2024-04-01', 'Active', 'Water treatment, lab analysis'],
    ['Steve Clark', 'Steel Fabricator', 'Airport Terminal B', 60, 400, 24000, '2024-09-01', 'Active', 'Structural fabrication, welding'],
  ];
  for (const l of labor) {
    await pool.query(
      `INSERT INTO labor (worker_name,role,project_name,hourly_rate,hours_worked,total_pay,start_date,status,skills) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      l
    );
  }

  // Seed equipment (15)
  const equipment = [
    ['Tower Crane TC-500', 'Crane', 'TC-500-2021', 'Skyline Tower', 2500, 'In Use', 'Mike O\'Brien', 'Excellent', '2024-12-15'],
    ['Excavator CAT 320', 'Excavator', 'CAT-320-1845', 'Harbor Bridge Expansion', 1200, 'In Use', 'Tom Harris', 'Good', '2024-11-01'],
    ['Concrete Pump Truck', 'Pump', 'CP-2022-445', 'Green Valley Mall', 1800, 'In Use', 'Carlos Ruiz', 'Good', '2024-10-30'],
    ['Bulldozer D8T', 'Dozer', 'D8T-2020-882', 'Riverside Hospital Wing', 1500, 'Available', 'None', 'Excellent', '2024-09-15'],
    ['Boom Lift JLG 600S', 'Lift', 'JLG-600-3321', 'Mountain View Condos', 800, 'In Use', 'James Wilson', 'Good', '2024-11-20'],
    ['Forklift Toyota 8FD', 'Forklift', 'TY-8FD-9912', 'Tech Campus Phase 2', 350, 'Available', 'None', 'Fair', '2024-10-01'],
    ['Asphalt Paver AP-1000', 'Paver', 'AP-1000-556', 'Highway 101 Overpass', 2200, 'In Use', 'Road Crew', 'Good', '2024-12-01'],
    ['Backhoe Loader 3CX', 'Backhoe', 'JCB-3CX-7788', 'Sunset Elementary School', 650, 'In Use', 'Site Crew', 'Good', '2024-11-15'],
    ['Pile Driver Hammer', 'Pile Driver', 'PD-2019-334', 'Marina Bay Resort', 3000, 'Available', 'None', 'Good', '2024-10-20'],
    ['Dump Truck Volvo A40', 'Truck', 'VA40-2021-992', 'Central Park Renovation', 900, 'In Use', 'Driver Team', 'Excellent', '2024-09-30'],
    ['Solar Panel Lift', 'Specialized', 'SPL-2023-112', 'Solar Farm Installation', 600, 'In Use', 'Install Team', 'Excellent', '2025-01-15'],
    ['Tunnel Boring Machine', 'TBM', 'TBM-2022-001', 'Metro Line Extension', 15000, 'In Use', 'TBM Team', 'Good', '2025-02-01'],
    ['Water Pump Station', 'Pump', 'WPS-2023-445', 'Water Treatment Plant', 450, 'In Use', 'Pump Crew', 'Excellent', '2024-12-20'],
    ['Mobile Crane LTM 1300', 'Crane', 'LTM-1300-223', 'Airport Terminal B', 4500, 'Available', 'None', 'Good', '2024-11-10'],
    ['Compactor Roller', 'Compactor', 'CR-2021-778', 'Industrial Park Complex', 550, 'In Use', 'Road Crew', 'Fair', '2024-10-15'],
  ];
  for (const e of equipment) {
    await pool.query(
      `INSERT INTO equipment (name,type,serial_number,project_name,daily_rate,status,operator,condition_rating,next_maintenance) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      e
    );
  }

  // Seed subcontractors (15)
  const subs = [
    ['Elite Steel Works', 'John Phillips', 'john@elitesteel.com', '555-0101', 'Structural Steel', 'Skyline Tower', 12000000, 'Active', '5/5'],
    ['Pacific Electrical', 'Nancy Huang', 'nancy@pacificelec.com', '555-0102', 'Electrical', 'Harbor Bridge Expansion', 8500000, 'Active', '4/5'],
    ['GreenBuild Solar', 'Alex Green', 'alex@greenbuildsolar.com', '555-0103', 'Solar Installation', 'Green Valley Mall', 6200000, 'Active', '5/5'],
    ['MedConstruct Inc', 'Dr. Sara Patel', 'sara@medconstruct.com', '555-0104', 'Healthcare Facility', 'Riverside Hospital Wing', 18000000, 'Active', '4/5'],
    ['Luxury Interiors Co', 'Maria Lopez', 'maria@luxinteriors.com', '555-0105', 'Interior Design', 'Mountain View Condos', 4500000, 'Active', '4/5'],
    ['DataCenter Builders', 'Tom Nguyen', 'tom@dcbuilders.com', '555-0106', 'Data Center', 'Tech Campus Phase 2', 22000000, 'Pending', '5/5'],
    ['Highway Masters', 'Bill Stone', 'bill@hwmasters.com', '555-0107', 'Road Construction', 'Highway 101 Overpass', 15000000, 'Active', '3/5'],
    ['EduBuild Corp', 'Karen Meadows', 'karen@edubuild.com', '555-0108', 'Educational Facility', 'Sunset Elementary School', 9000000, 'Active', '4/5'],
    ['AquaScape Design', 'Jake Fisher', 'jake@aquascape.com', '555-0109', 'Pool & Water Features', 'Marina Bay Resort', 7500000, 'Active', '5/5'],
    ['Nature Works LLC', 'Emily Fields', 'emily@natureworks.com', '555-0110', 'Landscaping', 'Central Park Renovation', 3200000, 'Active', '4/5'],
    ['SunPower Installers', 'Ray Bright', 'ray@suninstall.com', '555-0111', 'Solar Installation', 'Solar Farm Installation', 85000000, 'Active', '5/5'],
    ['Deep Tunneling Corp', 'Frank Underground', 'frank@deeptunnel.com', '555-0112', 'Tunneling', 'Metro Line Extension', 120000000, 'Active', '4/5'],
    ['AquaPure Systems', 'Rachel Waters', 'rachel@aquapure.com', '555-0113', 'Water Treatment', 'Water Treatment Plant', 25000000, 'Active', '5/5'],
    ['AeroConstruct', 'Capt. Mike Sky', 'mike@aeroconstruct.com', '555-0114', 'Airport Construction', 'Airport Terminal B', 180000000, 'Pending', '4/5'],
    ['Industrial Builders', 'Steve Factory', 'steve@indbuilders.com', '555-0115', 'Industrial', 'Industrial Park Complex', 12000000, 'Active', '3/5'],
  ];
  for (const s of subs) {
    await pool.query(
      `INSERT INTO subcontractors (company_name,contact_person,email,phone,specialty,project_name,contract_value,status,rating) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      s
    );
  }

  // Seed documents (15)
  const docs = [
    ['Skyline Tower Blueprint v3', 'Blueprint', 'Skyline Tower', 'Architect Team', 'Final architectural blueprint set', '3.0', 'Current', '/docs/skyline/blueprint-v3.pdf', 'blueprint,architecture'],
    ['Bridge Structural Analysis', 'Engineering', 'Harbor Bridge Expansion', 'Structural Eng', 'Load bearing analysis report', '2.1', 'Current', '/docs/bridge/structural.pdf', 'structural,analysis'],
    ['Mall Environmental Impact', 'Report', 'Green Valley Mall', 'EnvConsult LLC', 'Environmental impact assessment', '1.0', 'Approved', '/docs/mall/env-impact.pdf', 'environmental,impact'],
    ['Hospital Safety Plan', 'Safety', 'Riverside Hospital Wing', 'Safety Officer', 'Construction safety management plan', '4.0', 'Current', '/docs/hospital/safety.pdf', 'safety,plan'],
    ['Condo Sales Brochure', 'Marketing', 'Mountain View Condos', 'Marketing Team', 'Sales and marketing materials', '2.0', 'Current', '/docs/condo/brochure.pdf', 'marketing,sales'],
    ['Campus Master Plan', 'Planning', 'Tech Campus Phase 2', 'Urban Planners', 'Campus expansion master plan', '1.5', 'Under Review', '/docs/campus/masterplan.pdf', 'master,planning'],
    ['Highway Traffic Study', 'Study', 'Highway 101 Overpass', 'Traffic Eng', 'Traffic flow and impact study', '1.0', 'Approved', '/docs/highway/traffic.pdf', 'traffic,study'],
    ['School Building Code Compliance', 'Compliance', 'Sunset Elementary School', 'Code Inspector', 'Building code compliance report', '1.0', 'Approved', '/docs/school/compliance.pdf', 'code,compliance'],
    ['Resort Design Rendering', 'Design', 'Marina Bay Resort', 'Design Studio', '3D rendering of resort design', '5.0', 'Current', '/docs/resort/rendering.pdf', 'design,rendering'],
    ['Park Restoration Plan', 'Planning', 'Central Park Renovation', 'City Planning', 'Historic restoration guidelines', '2.0', 'Approved', '/docs/park/restoration.pdf', 'restoration,historic'],
    ['Solar Grid Connection Plan', 'Engineering', 'Solar Farm Installation', 'Grid Eng', 'Grid interconnection plan', '1.0', 'Under Review', '/docs/solar/grid.pdf', 'grid,solar'],
    ['Metro Geological Survey', 'Survey', 'Metro Line Extension', 'GeoSurvey Inc', 'Underground geological survey', '3.0', 'Current', '/docs/metro/geology.pdf', 'geological,survey'],
    ['Water Quality Standards', 'Regulatory', 'Water Treatment Plant', 'EPA', 'Water quality compliance docs', '1.0', 'Approved', '/docs/water/quality.pdf', 'quality,regulatory'],
    ['Terminal Architectural Plans', 'Blueprint', 'Airport Terminal B', 'AeroArch', 'Terminal architectural design', '2.0', 'Under Review', '/docs/airport/plans.pdf', 'architecture,terminal'],
    ['Industrial Zoning Permit', 'Permit', 'Industrial Park Complex', 'City Zoning', 'Zoning and land use permits', '1.0', 'Approved', '/docs/industrial/zoning.pdf', 'zoning,permit'],
  ];
  for (const d of docs) {
    await pool.query(
      `INSERT INTO documents (title,type,project_name,uploaded_by,description,version,status,file_path,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      d
    );
  }

  // Seed inspections (15)
  const inspections = [
    ['Skyline Tower', 'City Inspector Ray', 'Structural', '2024-07-15', '2024-07-15', 'Passed', 'Steel connections meet code', 'Completed', 'No'],
    ['Skyline Tower', 'Fire Marshal Davis', 'Fire Safety', '2024-08-20', '2024-08-20', 'Conditional', 'Minor fire door issues', 'Completed', 'Yes'],
    ['Harbor Bridge Expansion', 'DOT Inspector Kim', 'Structural', '2024-06-10', '2024-06-10', 'Passed', 'Bridge piers meet specifications', 'Completed', 'No'],
    ['Green Valley Mall', 'Electrical Inspector Lee', 'Electrical', '2024-07-25', null, null, null, 'Scheduled', 'No'],
    ['Riverside Hospital Wing', 'Health Inspector Patel', 'Health Code', '2024-08-15', '2024-08-15', 'Passed', 'Clean room standards met', 'Completed', 'No'],
    ['Mountain View Condos', 'Building Inspector Jones', 'Foundation', '2024-05-30', '2024-05-30', 'Passed', 'Foundation depth and reinforcement OK', 'Completed', 'No'],
    ['Tech Campus Phase 2', 'Energy Auditor Chen', 'Energy', '2024-09-10', null, null, null, 'Scheduled', 'No'],
    ['Highway 101 Overpass', 'CalTrans Inspector', 'Roadway', '2024-08-05', '2024-08-05', 'Failed', 'Asphalt density below spec', 'Re-inspection Required', 'Yes'],
    ['Sunset Elementary School', 'ADA Inspector Brown', 'Accessibility', '2024-09-01', '2024-09-01', 'Passed', 'ADA requirements met', 'Completed', 'No'],
    ['Marina Bay Resort', 'Coastal Inspector', 'Environmental', '2024-10-01', null, null, null, 'Scheduled', 'No'],
    ['Central Park Renovation', 'Parks Inspector', 'Landscaping', '2024-06-15', '2024-06-15', 'Passed', 'Planting meets specifications', 'Completed', 'No'],
    ['Solar Farm Installation', 'Electrical Inspector', 'Electrical', '2024-10-15', null, null, null, 'Scheduled', 'No'],
    ['Metro Line Extension', 'Safety Inspector Garcia', 'Tunnel Safety', '2024-07-20', '2024-07-20', 'Conditional', 'Ventilation needs improvement', 'Completed', 'Yes'],
    ['Water Treatment Plant', 'EPA Inspector', 'Environmental', '2024-09-20', '2024-09-20', 'Passed', 'All systems meet EPA standards', 'Completed', 'No'],
    ['Airport Terminal B', 'FAA Inspector', 'Aviation Safety', '2024-11-01', null, null, null, 'Scheduled', 'No'],
  ];
  for (const i of inspections) {
    await pool.query(
      `INSERT INTO inspections (project_name,inspector,type,date_scheduled,date_completed,result,notes,status,follow_up_required) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      i
    );
  }

  // Seed risk_assessments (15)
  const risks = [
    ['Skyline Tower', 'Structural', 'High wind loads during steel erection above floor 30', 'High', 'Critical', '20', 'Install wind monitoring, halt work above 40mph', 'John Smith', 'Active'],
    ['Skyline Tower', 'Financial', 'Steel price volatility may exceed budget', 'Medium', 'High', '15', 'Lock in prices with long-term contracts', 'CFO Office', 'Monitoring'],
    ['Harbor Bridge Expansion', 'Environmental', 'Marine life disruption during pile driving', 'High', 'Medium', '12', 'Use bubble curtains, seasonal restrictions', 'Env Team', 'Active'],
    ['Green Valley Mall', 'Schedule', 'Solar panel supply chain delays', 'Medium', 'Medium', '9', 'Identify alternate suppliers, buffer stock', 'Procurement', 'Monitoring'],
    ['Riverside Hospital Wing', 'Safety', 'Working adjacent to active hospital', 'High', 'Critical', '20', 'Dust barriers, noise limits, infection control', 'Safety Team', 'Active'],
    ['Mountain View Condos', 'Market', 'Housing market downturn affecting sales', 'Medium', 'High', '15', 'Pre-sales program, flexible pricing', 'Sales Team', 'Monitoring'],
    ['Tech Campus Phase 2', 'Technical', 'Data center cooling system complexity', 'Medium', 'High', '15', 'Engage specialist consultants early', 'Tech Team', 'Active'],
    ['Highway 101 Overpass', 'Public Safety', 'Work zone traffic accidents', 'High', 'Critical', '20', 'Enhanced barriers, speed reduction, flaggers', 'Safety Team', 'Active'],
    ['Sunset Elementary School', 'Community', 'Construction noise affecting nearby residents', 'High', 'Low', '8', 'Limit hours, noise barriers, community updates', 'PR Team', 'Monitoring'],
    ['Marina Bay Resort', 'Natural Disaster', 'Hurricane season during construction', 'High', 'Critical', '20', 'Hurricane plan, material protection, insurance', 'Risk Manager', 'Active'],
    ['Solar Farm Installation', 'Technical', 'Grid interconnection approval delays', 'Medium', 'High', '15', 'Early utility engagement, backup plans', 'Engineering', 'Active'],
    ['Metro Line Extension', 'Geological', 'Unexpected underground conditions', 'High', 'High', '16', 'Additional boring tests, contingency budget', 'Geo Team', 'Active'],
    ['Water Treatment Plant', 'Regulatory', 'Changing EPA regulations mid-project', 'Low', 'High', '10', 'Monitor regulations, design flexibility', 'Compliance', 'Monitoring'],
    ['Airport Terminal B', 'Operational', 'Airport operations disruption', 'High', 'Critical', '20', 'Night work, phased construction, coordination', 'Operations', 'Active'],
    ['Industrial Park Complex', 'Environmental', 'Soil contamination discovery', 'Medium', 'High', '15', 'Phase II environmental assessment', 'Env Team', 'Active'],
  ];
  for (const r of risks) {
    await pool.query(
      `INSERT INTO risk_assessments (project_name,risk_type,description,probability,impact,risk_score,mitigation,owner,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      r
    );
  }

  // Seed budgets (15)
  const budgets = [
    ['Skyline Tower', 'Labor', 85000000, 42000000, 43000000, 'Q1-Q4 2024', 'Active', 'CFO Johnson', 'On track'],
    ['Skyline Tower', 'Materials', 120000000, 68000000, 52000000, 'Q1-Q4 2024', 'Active', 'CFO Johnson', 'Slightly over on steel'],
    ['Harbor Bridge Expansion', 'Construction', 80000000, 35000000, 45000000, '2024', 'Active', 'City Finance', 'Under budget'],
    ['Green Valley Mall', 'General', 95000000, 28000000, 67000000, '2024', 'Active', 'VP Finance', 'Early stages'],
    ['Riverside Hospital Wing', 'Medical Equipment', 22000000, 23100000, -1100000, '2024', 'Over Budget', 'Hospital CFO', 'Equipment cost increase'],
    ['Mountain View Condos', 'Construction', 45000000, 22000000, 23000000, '2024', 'Active', 'Project Finance', 'On schedule'],
    ['Tech Campus Phase 2', 'Technology', 45000000, 5000000, 40000000, '2024-2025', 'Active', 'CTO Office', 'Design phase spending'],
    ['Highway 101 Overpass', 'Infrastructure', 60000000, 30000000, 30000000, '2024', 'Active', 'CalTrans Finance', 'Midpoint spending'],
    ['Sunset Elementary School', 'Building', 42000000, 18000000, 24000000, '2024', 'Active', 'School District', 'On track'],
    ['Marina Bay Resort', 'Development', 310000000, 15000000, 295000000, '2024-2026', 'Active', 'Resort Finance', 'Early planning costs'],
    ['Central Park Renovation', 'Renovation', 28000000, 12000000, 16000000, '2024', 'Active', 'Parks Dept', 'On budget'],
    ['Solar Farm Installation', 'Equipment', 300000000, 25000000, 275000000, '2024-2025', 'Active', 'Project Finance', 'Module procurement starting'],
    ['Metro Line Extension', 'Tunneling', 500000000, 180000000, 320000000, '2024-2027', 'Active', 'MBTA Finance', 'TBM operations on budget'],
    ['Water Treatment Plant', 'Systems', 100000000, 45000000, 55000000, '2024-2025', 'Active', 'City Treasurer', 'Filtration system procurement'],
    ['Airport Terminal B', 'Terminal', 800000000, 50000000, 750000000, '2024-2027', 'Active', 'Airport Finance', 'Design and permit phase'],
  ];
  for (const b of budgets) {
    await pool.query(
      `INSERT INTO budgets (project_name,category,allocated_amount,spent_amount,remaining,period,status,approved_by,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      b
    );
  }

  // Seed weather_impacts (15)
  const weather = [
    ['Skyline Tower', '2024-07-15', 'Thunderstorm', '88°F', '25 mph', '1.5 inches', 'High', 'Suspended', 'Crane operations halted'],
    ['Skyline Tower', '2024-08-10', 'Heat Wave', '105°F', '5 mph', 'None', 'Medium', 'Modified', 'Early start/early finish schedule'],
    ['Harbor Bridge Expansion', '2024-06-20', 'Fog', '62°F', '10 mph', 'None', 'Low', 'Normal', 'Limited visibility morning only'],
    ['Harbor Bridge Expansion', '2024-09-15', 'High Winds', '70°F', '45 mph', 'None', 'High', 'Suspended', 'All elevated work stopped'],
    ['Green Valley Mall', '2024-07-22', 'Clear', '98°F', '8 mph', 'None', 'Low', 'Normal', 'Heat protocols active'],
    ['Riverside Hospital Wing', '2024-08-05', 'Rain', '75°F', '15 mph', '0.8 inches', 'Medium', 'Modified', 'Exterior work delayed'],
    ['Mountain View Condos', '2024-06-10', 'Hail', '55°F', '30 mph', '0.5 inches', 'High', 'Suspended', 'Material protection activated'],
    ['Highway 101 Overpass', '2024-07-30', 'Extreme Heat', '112°F', '3 mph', 'None', 'High', 'Suspended', 'Asphalt too hot for application'],
    ['Sunset Elementary School', '2024-09-18', 'Dust Storm', '95°F', '40 mph', 'None', 'Medium', 'Suspended', 'Visibility zero'],
    ['Marina Bay Resort', '2024-10-05', 'Tropical Storm', '80°F', '55 mph', '3 inches', 'Critical', 'Suspended', 'Storm preparation mode'],
    ['Central Park Renovation', '2024-05-25', 'Spring Rain', '65°F', '12 mph', '1.2 inches', 'Medium', 'Modified', 'Landscaping delayed'],
    ['Solar Farm Installation', '2024-08-20', 'Clear', '100°F', '5 mph', 'None', 'Low', 'Normal', 'Ideal solar conditions'],
    ['Metro Line Extension', '2024-07-10', 'Heavy Rain', '72°F', '20 mph', '2.5 inches', 'Medium', 'Modified', 'Surface work delayed, tunnel OK'],
    ['Water Treatment Plant', '2024-09-25', 'Freezing Rain', '30°F', '15 mph', '0.3 inches', 'High', 'Suspended', 'Ice on equipment'],
    ['Airport Terminal B', '2024-10-12', 'Clear', '75°F', '8 mph', 'None', 'Low', 'Normal', 'Perfect construction weather'],
  ];
  for (const w of weather) {
    await pool.query(
      `INSERT INTO weather_impacts (project_name,date,condition,temperature,wind_speed,precipitation,impact_level,work_status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      w
    );
  }

  // Seed daily_reports (15)
  const reports = [
    ['Skyline Tower', '2024-08-01', 'Clear 85F', 45, 'Completed floor 15 steel erection, started floor 16 columns', 'Minor delay waiting for steel delivery', '50 tons structural steel', 'Client visit - Metro Corp VP', 'John Smith'],
    ['Skyline Tower', '2024-08-02', 'Partly Cloudy 82F', 48, 'Floor 16 columns completed, started beams', 'None', '35 tons structural steel, 200 bolts', 'None', 'John Smith'],
    ['Harbor Bridge Expansion', '2024-08-01', 'Fog clearing by 10am', 32, 'Installed 8 deck panels section C', 'Fog delayed morning start', 'Steel deck panels, welding rods', 'DOT inspection team', 'Sarah Johnson'],
    ['Green Valley Mall', '2024-08-01', 'Hot and sunny 98F', 28, 'Foundation pour building B completed', 'Heat required extra water trucks', '120 cubic yards concrete', 'Architect walk-through', 'Mike Chen'],
    ['Riverside Hospital Wing', '2024-08-01', 'Rain showers 75F', 35, 'Interior framing 3rd floor, MEP rough-in 2nd floor', 'Rain delayed exterior work 2 hours', 'Steel studs, copper pipe, electrical wire', 'Hospital admin meeting', 'Lisa Park'],
    ['Mountain View Condos', '2024-08-01', 'Clear 88F', 22, 'Framing Building A units 301-310', 'Lumber delivery delayed by 1 day', 'Lumber, nails, hardware', 'HOA board visit', 'Tom Davis'],
    ['Tech Campus Phase 2', '2024-08-01', 'Overcast 72F', 15, 'Design review meeting, soil testing complete', 'Waiting for permit approval', 'None - planning phase', 'TechGiant CEO visit', 'Amy Wilson'],
    ['Highway 101 Overpass', '2024-08-01', 'Clear 95F', 40, 'Poured 6 bridge pier caps', 'None', '200 cubic yards concrete, rebar', 'CalTrans oversight team', 'Robert Lee'],
    ['Sunset Elementary School', '2024-08-01', 'Clear 102F', 25, 'Roof truss installation classrooms 1-12', 'Heat break 12-2pm', 'Wood trusses, roofing hardware', 'Principal observation', 'Karen White'],
    ['Marina Bay Resort', '2024-08-01', 'Sunny 87F', 18, 'Pile driving for main building foundation', 'Marine life observation required stops', 'Steel H-piles', 'Environmental monitor present', 'David Brown'],
    ['Central Park Renovation', '2024-08-01', 'Clear 78F', 20, 'Irrigation system installation zone 3', 'Found unexpected underground pipe', 'PVC pipe, sprinkler heads, valves', 'City council member visit', 'Jennifer Taylor'],
    ['Solar Farm Installation', '2024-08-01', 'Sunny 95F', 60, 'Installed 500 solar panels array section D', 'None - great progress', 'Solar panels, mounting hardware, wiring', 'Grid company representative', 'Chris Martin'],
    ['Metro Line Extension', '2024-08-01', 'N/A Underground', 85, 'TBM advanced 15 meters, installed 10 ring segments', 'Minor water seepage section 14', 'Tunnel lining segments, grout', 'Transit authority inspection', 'Patricia Garcia'],
    ['Water Treatment Plant', '2024-08-01', 'Clear 90F', 30, 'Installed primary settling tanks 3 and 4', 'Concrete curing time extended due to heat', 'Concrete, steel tanks, PVC piping', 'EPA compliance officer', 'James Wilson'],
    ['Airport Terminal B', '2024-08-01', 'Clear 82F', 12, 'Survey and staking for foundation layout', 'Coordination with active runway operations', 'Survey stakes, marking paint', 'FAA representative, airline reps', 'Michelle Adams'],
  ];
  for (const r of reports) {
    await pool.query(
      `INSERT INTO daily_reports (project_name,date,weather,crew_count,work_completed,issues,materials_used,visitor_log,submitted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      r
    );
  }

  // Seed permits (15)
  const permits = [
    ['Skyline Tower', 'Building Permit', 'NYC Dept of Buildings', '2023-08-01', '2023-12-15', '2026-12-15', 'Approved', 125000, 'Full construction permit'],
    ['Skyline Tower', 'Crane Permit', 'NYC Dept of Buildings', '2024-01-10', '2024-02-01', '2025-02-01', 'Approved', 15000, 'Tower crane operation'],
    ['Harbor Bridge Expansion', 'Bridge Construction', 'CA Dept of Transportation', '2023-10-01', '2024-02-15', '2026-02-15', 'Approved', 85000, 'Major bridge modification'],
    ['Green Valley Mall', 'Commercial Building', 'City of Austin', '2023-09-15', '2023-12-20', '2025-12-20', 'Approved', 45000, 'Commercial construction'],
    ['Riverside Hospital Wing', 'Healthcare Facility', 'IL Dept of Health', '2023-11-01', '2024-03-01', '2026-03-01', 'Approved', 95000, 'Healthcare construction special permit'],
    ['Mountain View Condos', 'Residential', 'City of Denver', '2023-08-20', '2023-11-15', '2025-11-15', 'Approved', 35000, 'Multi-family residential'],
    ['Tech Campus Phase 2', 'Commercial', 'City of Seattle', '2024-02-01', null, null, 'Under Review', 55000, 'Awaiting environmental clearance'],
    ['Highway 101 Overpass', 'Highway Construction', 'CalTrans', '2023-12-01', '2024-05-15', '2026-05-15', 'Approved', 0, 'State project - no fee'],
    ['Sunset Elementary School', 'Educational Facility', 'City of Phoenix', '2023-10-15', '2024-01-20', '2025-12-31', 'Approved', 25000, 'Public school construction'],
    ['Marina Bay Resort', 'Coastal Development', 'FL DEP', '2024-03-01', null, null, 'Under Review', 150000, 'Coastal zone development'],
    ['Central Park Renovation', 'Park Renovation', 'City of Portland', '2023-11-15', '2024-01-10', '2025-06-30', 'Approved', 12000, 'Public park renovation'],
    ['Solar Farm Installation', 'Energy Generation', 'NV Public Utilities', '2024-04-01', null, null, 'Pending', 200000, 'Large-scale solar facility'],
    ['Metro Line Extension', 'Transit Construction', 'MA DOT', '2023-06-01', '2023-12-01', '2027-12-01', 'Approved', 350000, 'Major transit infrastructure'],
    ['Water Treatment Plant', 'Municipal Utility', 'TX Commission on Env Quality', '2023-09-01', '2024-02-01', '2026-02-01', 'Approved', 75000, 'Water treatment facility'],
    ['Airport Terminal B', 'Airport Construction', 'FAA', '2024-05-01', null, null, 'Under Review', 500000, 'Major airport expansion'],
  ];
  for (const p of permits) {
    await pool.query(
      `INSERT INTO permits (project_name,permit_type,issuing_authority,application_date,approval_date,expiry_date,status,cost,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      p
    );
  }

  // Seed quality_control (15)
  const qc = [
    ['Skyline Tower', 'Floor 12 Welding', 'QC Inspector Adams', '2024-07-10', 'AWS D1.1', 'Pass', 'None', 'N/A', 'Completed'],
    ['Skyline Tower', 'Concrete Core Test', 'Lab Tech Kim', '2024-07-15', 'ACI 318', 'Pass', 'None', 'N/A', 'Completed'],
    ['Harbor Bridge Expansion', 'Deck Panel Welds', 'QC Inspector Lee', '2024-06-25', 'AWS D1.5', 'Fail', '3 incomplete penetration welds', 'Re-weld and re-inspect', 'Re-inspection Required'],
    ['Green Valley Mall', 'Foundation Rebar', 'QC Inspector Patel', '2024-05-20', 'ACI 318', 'Pass', 'None', 'N/A', 'Completed'],
    ['Riverside Hospital Wing', 'Clean Room HEPA', 'HVAC Inspector Chen', '2024-08-10', 'ISO 14644', 'Conditional', 'Minor seal issue on unit 3', 'Replace gasket', 'In Progress'],
    ['Mountain View Condos', 'Window Installation', 'QC Inspector Brown', '2024-07-30', 'ASTM E2112', 'Pass', 'None', 'N/A', 'Completed'],
    ['Tech Campus Phase 2', 'Soil Compaction', 'Geo Tech Wilson', '2024-06-15', 'ASTM D1557', 'Pass', 'None', 'N/A', 'Completed'],
    ['Highway 101 Overpass', 'Asphalt Density', 'DOT Inspector Kim', '2024-08-05', 'AASHTO T166', 'Fail', 'Density 91% (min 93%)', 'Remove and replace', 'Re-inspection Required'],
    ['Sunset Elementary School', 'Fire Door Rating', 'Fire Inspector Davis', '2024-08-20', 'NFPA 80', 'Pass', 'None', 'N/A', 'Completed'],
    ['Marina Bay Resort', 'Pile Load Test', 'Structural Eng', '2024-09-10', 'ASTM D1143', 'Pass', 'None', 'N/A', 'Completed'],
    ['Central Park Renovation', 'Irrigation Pressure', 'Landscape Inspector', '2024-06-20', 'ASABE S376', 'Pass', 'None', 'N/A', 'Completed'],
    ['Solar Farm Installation', 'Panel Output Test', 'Electrical Eng', '2024-09-20', 'IEC 61215', 'Pass', 'None', 'N/A', 'Completed'],
    ['Metro Line Extension', 'Tunnel Alignment', 'Survey Team', '2024-07-25', 'Project Spec', 'Pass', 'None', 'N/A', 'Completed'],
    ['Water Treatment Plant', 'Pipe Pressure Test', 'QC Inspector', '2024-09-15', 'AWWA C600', 'Conditional', 'Minor leak at joint 47', 'Re-seal and re-test', 'In Progress'],
    ['Airport Terminal B', 'Soil Bearing', 'Geo Tech', '2024-10-05', 'ASTM D1194', 'Pass', 'None', 'N/A', 'Completed'],
  ];
  for (const q of qc) {
    await pool.query(
      `INSERT INTO quality_control (project_name,inspection_area,inspector,date,standard,result,defects_found,corrective_action,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      q
    );
  }

  // Seed RFIs (15)
  const rfis = [
    ['Skyline Tower', 'RFI-001', 'Foundation Depth Clarification', 'Geotechnical report shows varying soil conditions at grid lines A3-A7. Should we increase pile depth from 60ft to 75ft?', 'Foundation Contractor', 'Structural Engineer', '2024-03-15', '2024-03-22', '2024-03-20', 'Yes, increase pile depth to 75ft at grid lines A3-A7 per revised geotech report.', 'High', 'Closed', 250000],
    ['Skyline Tower', 'RFI-002', 'Curtain Wall Detail at Corner', 'Architectural drawings show conflicting details at building corners for curtain wall system. Which detail governs?', 'Facade Contractor', 'Architect', '2024-04-10', '2024-04-17', '2024-04-15', 'Use Detail A-405 for all corner conditions. Detail A-402 is superseded.', 'Medium', 'Closed', 0],
    ['Skyline Tower', 'RFI-003', 'Elevator Shaft Fire Rating', 'Code requires 2-hr fire rating for elevator shafts. Drawings show 1-hr. Please confirm required rating.', 'GC', 'Code Consultant', '2024-05-20', '2024-05-27', null, null, 'Critical', 'Open', 85000],
    ['Harbor Bridge Expansion', 'RFI-001', 'Bearing Pad Specification', 'Specified bearing pads (Spec 14.5) are discontinued by manufacturer. Can we substitute with equivalent?', 'Steel Subcontractor', 'Bridge Engineer', '2024-04-05', '2024-04-12', '2024-04-11', 'Approved substitution with BearingTech Model BT-500 series.', 'High', 'Closed', 0],
    ['Harbor Bridge Expansion', 'RFI-002', 'Deck Drainage Conflict', 'Storm drain locations conflict with post-tension cable paths at deck section 3. How to resolve?', 'GC', 'Civil Engineer', '2024-06-18', '2024-06-25', null, null, 'High', 'Open', 120000],
    ['Green Valley Mall', 'RFI-001', 'Solar Panel Mounting System', 'Roof structure may need reinforcement for proposed solar panel layout. Structural review needed.', 'Solar Contractor', 'Structural Engineer', '2024-05-12', '2024-05-19', '2024-05-18', 'Add W12x26 supplemental framing at solar array locations per SK-101.', 'Medium', 'Closed', 45000],
    ['Green Valley Mall', 'RFI-002', 'Parking Lot EV Conduit Routing', 'Proposed EV charging conduit path conflicts with underground utilities. Alternative routing needed.', 'Electrical Sub', 'Civil Engineer', '2024-06-20', '2024-06-27', '2024-06-25', 'Route conduit along alternate path shown on RFI response sketch RS-002.', 'Low', 'Closed', 8000],
    ['Riverside Hospital Wing', 'RFI-001', 'Operating Room HVAC Requirements', 'ASHRAE 170 requires specific air change rates for OR suites. Current design shows 15 ACH, code requires 20 ACH.', 'Mechanical Sub', 'MEP Engineer', '2024-05-08', '2024-05-15', '2024-05-14', 'Increase AHU capacity to provide 20 ACH minimum for all OR suites.', 'Critical', 'Closed', 180000],
    ['Riverside Hospital Wing', 'RFI-002', 'Lead-Lined Wall Specification', 'Radiology rooms require lead-lined walls. Drawings do not specify lead thickness. Please clarify.', 'Drywall Sub', 'Architect', '2024-06-12', '2024-06-19', null, null, 'High', 'Open', 35000],
    ['Mountain View Condos', 'RFI-001', 'Balcony Railing Height', 'Local code requires 42" railings above 30" drop. Plans show 36" railings on all balconies.', 'Railing Sub', 'Architect', '2024-04-22', '2024-04-29', '2024-04-28', 'Revise all balcony railings to 42" height. Updated details to follow.', 'High', 'Closed', 22000],
    ['Tech Campus Phase 2', 'RFI-001', 'Server Room Floor Loading', 'Specified raised floor system rated for 1500 lbs/sf. Server rack layout requires 2000 lbs/sf. Please advise.', 'IT Contractor', 'Structural Engineer', '2024-07-05', '2024-07-12', null, null, 'Critical', 'Open', 300000],
    ['Highway 101 Overpass', 'RFI-001', 'Retaining Wall Drainage', 'Geotechnical report recommends additional drainage behind retaining walls not shown on civil plans.', 'Earth Sub', 'Civil Engineer', '2024-07-15', '2024-07-22', '2024-07-20', 'Add perforated drain pipe and gravel backfill per detail RW-D1.', 'Medium', 'Closed', 55000],
    ['Sunset Elementary School', 'RFI-001', 'Playground Surface Material', 'Specified rubber surface material not ADA compliant per updated standards. Alternative needed.', 'Site Contractor', 'Landscape Architect', '2024-06-28', '2024-07-05', '2024-07-03', 'Use PermaSafe Pro surface system which meets updated ADA requirements.', 'Medium', 'Closed', 15000],
    ['Marina Bay Resort', 'RFI-001', 'Seawall Foundation Detail', 'Existing seawall conditions differ from survey. Foundation depth needs revision.', 'Marine Sub', 'Coastal Engineer', '2024-08-10', '2024-08-17', null, null, 'Critical', 'Open', 450000],
    ['Metro Line Extension', 'RFI-001', 'Emergency Ventilation Shaft Size', 'Fire code requires larger ventilation shafts than shown. 8ft diameter needed vs 6ft shown.', 'Tunnel Sub', 'Fire Protection Eng', '2024-04-30', '2024-05-07', '2024-05-06', 'Increase all emergency vent shafts to 8ft diameter. Revised structural calcs provided.', 'Critical', 'Closed', 890000],
  ];
  for (const r of rfis) {
    await pool.query(
      `INSERT INTO rfis (project_name,rfi_number,subject,question,submitted_by,assigned_to,date_submitted,date_due,date_responded,response,priority,status,cost_impact) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, r
    );
  }

  // Seed punch_list (15)
  const punchList = [
    ['Skyline Tower', 'PL-001', 'Lobby - North Wall', 'Paint touch-up needed on north wall behind reception desk, visible scuff marks', 'Finishing', 'Paint Crew', '2024-08-01', '2024-08-10', null, 'High', 'Open', 'Visible to guests upon entry'],
    ['Skyline Tower', 'PL-002', 'Floor 10 - Unit 1005', 'Kitchen cabinet door misaligned, soft-close mechanism not working', 'Carpentry', 'Cabinet Sub', '2024-08-02', '2024-08-12', '2024-08-10', 'Medium', 'Completed', 'Hinge adjusted and replaced'],
    ['Skyline Tower', 'PL-003', 'Parking Level B2', 'Epoxy floor coating peeling at column P-12, approx 4 sq ft area', 'Flooring', 'Flooring Sub', '2024-08-03', '2024-08-15', null, 'Low', 'Open', 'Moisture issue suspected'],
    ['Harbor Bridge Expansion', 'PL-001', 'Section A - Guardrail', 'Guardrail bolt missing at station 12+50, safety concern', 'Safety', 'Steel Crew', '2024-08-05', '2024-08-06', '2024-08-06', 'Critical', 'Completed', 'Bolt installed immediately'],
    ['Harbor Bridge Expansion', 'PL-002', 'Pedestrian Walkway', 'Uneven concrete joint at expansion joint #3, trip hazard', 'Concrete', 'Concrete Sub', '2024-08-08', '2024-08-18', null, 'High', 'In Progress', 'Grinding scheduled for this week'],
    ['Green Valley Mall', 'PL-001', 'Food Court - Ceiling', 'Ceiling tile stained from HVAC condensation above tile grid C-14', 'HVAC', 'HVAC Sub', '2024-07-20', '2024-07-30', '2024-07-28', 'Medium', 'Completed', 'Insulation added to ductwork, tile replaced'],
    ['Green Valley Mall', 'PL-002', 'Store #105 - Entrance', 'Automatic door sensor intermittent, door closes too fast', 'Doors/Hardware', 'Door Sub', '2024-07-22', '2024-08-01', null, 'High', 'Open', 'Safety concern for customers'],
    ['Riverside Hospital Wing', 'PL-001', 'ICU Room 204', 'Medical gas outlet cover plate scratched, needs replacement', 'Medical Gas', 'Med Gas Sub', '2024-08-10', '2024-08-15', '2024-08-14', 'Low', 'Completed', 'Cover plate replaced'],
    ['Riverside Hospital Wing', 'PL-002', 'Corridor 2nd Floor', 'Handrail bracket loose at wall anchor #7, wobbles when pressure applied', 'Metals', 'Metal Sub', '2024-08-12', '2024-08-16', null, 'High', 'Open', 'Patient safety concern'],
    ['Mountain View Condos', 'PL-001', 'Unit 205 - Bathroom', 'Tile grout crack along tub surround, potential water infiltration', 'Tile', 'Tile Sub', '2024-08-15', '2024-08-25', null, 'High', 'In Progress', 'Regrout scheduled'],
    ['Mountain View Condos', 'PL-002', 'Building A - Exterior', 'Caulking gap at window frame unit 312, daylight visible', 'Waterproofing', 'Caulking Sub', '2024-08-16', '2024-08-22', null, 'Critical', 'Open', 'Water intrusion risk'],
    ['Sunset Elementary School', 'PL-001', 'Classroom 101', 'Smart board mounting bracket not level, 1/4" off', 'AV/Technology', 'AV Sub', '2024-08-18', '2024-08-25', '2024-08-23', 'Low', 'Completed', 'Remounted and leveled'],
    ['Sunset Elementary School', 'PL-002', 'Main Hallway', 'Floor transition strip loose between tile and carpet', 'Flooring', 'Flooring Sub', '2024-08-19', '2024-08-28', null, 'Medium', 'Open', 'Trip hazard for children'],
    ['Marina Bay Resort', 'PL-001', 'Pool Deck', 'Pool coping stone chipped at northeast corner, sharp edge', 'Masonry', 'Masonry Sub', '2024-09-01', '2024-09-08', null, 'High', 'Open', 'Guest safety concern'],
    ['Airport Terminal B', 'PL-001', 'Gate B-12 Area', 'Terrazzo floor crack at column grid B12-C, 18 inches long', 'Flooring', 'Terrazzo Sub', '2024-09-05', '2024-09-15', null, 'Medium', 'Open', 'Structural movement joint needed'],
  ];
  for (const p of punchList) {
    await pool.query(
      `INSERT INTO punch_list (project_name,item_number,location,description,category,assigned_to,date_identified,date_due,date_completed,priority,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, p
    );
  }

  // Seed submittals (15)
  const submittals = [
    ['Skyline Tower', 'SUB-001', 'Structural Steel Shop Drawings', '05 12 00', 'Elite Steel Works', 'Structural Eng', '2024-02-15', '2024-03-01', '2024-02-28', 'Approved', 'Rev 0', 'Approved', 'No exceptions'],
    ['Skyline Tower', 'SUB-002', 'Curtain Wall System', '08 44 00', 'FacadeGlobal', 'Architect', '2024-03-20', '2024-04-03', '2024-04-10', 'Revise & Resubmit', 'Rev 1', 'Resubmitted', 'Color samples need revision'],
    ['Skyline Tower', 'SUB-003', 'Elevator Equipment', '14 20 00', 'OtisElev', 'MEP Eng', '2024-04-05', '2024-04-19', '2024-04-18', 'Approved as Noted', 'Rev 0', 'Approved', 'Minor cab finish change noted'],
    ['Harbor Bridge Expansion', 'SUB-001', 'Bridge Bearing Pads', '14 00 00', 'BearingTech', 'Bridge Engineer', '2024-03-10', '2024-03-24', '2024-03-22', 'Approved', 'Rev 0', 'Approved', 'Per RFI-001 substitution'],
    ['Harbor Bridge Expansion', 'SUB-002', 'Deck Waterproofing Membrane', '07 10 00', 'WaterStop Inc', 'Civil Engineer', '2024-05-15', '2024-05-29', null, null, 'Rev 0', 'Pending', 'Under review'],
    ['Green Valley Mall', 'SUB-001', 'Rooftop Solar Panels', '48 14 00', 'SolarTech', 'MEP Eng', '2024-04-01', '2024-04-15', '2024-04-12', 'Approved', 'Rev 0', 'Approved', 'Efficiency meets spec'],
    ['Green Valley Mall', 'SUB-002', 'Storefront Glazing System', '08 41 00', 'GlassPro', 'Architect', '2024-04-20', '2024-05-04', '2024-05-10', 'Revise & Resubmit', 'Rev 2', 'Resubmitted', 'Thermal performance below spec'],
    ['Riverside Hospital Wing', 'SUB-001', 'Medical Gas Piping', '22 63 00', 'MedGas Corp', 'MEP Eng', '2024-05-01', '2024-05-15', '2024-05-14', 'Approved', 'Rev 0', 'Approved', 'Meets NFPA 99'],
    ['Riverside Hospital Wing', 'SUB-002', 'Operating Room Lights', '26 52 00', 'SurgLight Inc', 'Architect', '2024-05-20', '2024-06-03', null, null, 'Rev 0', 'Pending', 'Awaiting infection control review'],
    ['Mountain View Condos', 'SUB-001', 'Kitchen Appliance Package', '11 31 00', 'AppliancePro', 'Architect', '2024-04-15', '2024-04-29', '2024-04-27', 'Approved as Noted', 'Rev 0', 'Approved', 'Dishwasher model substituted'],
    ['Tech Campus Phase 2', 'SUB-001', 'Raised Access Floor System', '09 69 00', 'FloorTech', 'Structural Eng', '2024-06-01', '2024-06-15', null, null, 'Rev 0', 'Pending', 'Load capacity review needed'],
    ['Highway 101 Overpass', 'SUB-001', 'Sound Barrier Panels', '32 71 00', 'NoiseControl', 'Civil Engineer', '2024-07-01', '2024-07-15', '2024-07-12', 'Approved', 'Rev 0', 'Approved', 'STC rating meets requirement'],
    ['Metro Line Extension', 'SUB-001', 'Tunnel Lining Segments', '03 40 00', 'TunnelTech', 'Tunnel Eng', '2024-02-01', '2024-02-15', '2024-02-14', 'Approved', 'Rev 0', 'Approved', 'Mix design verified'],
    ['Water Treatment Plant', 'SUB-001', 'RO Membrane System', '43 21 00', 'AquaPure', 'Process Eng', '2024-06-15', '2024-06-29', '2024-06-28', 'Approved as Noted', 'Rev 0', 'Approved', 'Capacity verified'],
    ['Airport Terminal B', 'SUB-001', 'Baggage Conveyor System', '14 24 00', 'BagTech', 'MEP Eng', '2024-09-01', '2024-09-15', null, null, 'Rev 0', 'Pending', 'Complex system review'],
  ];
  for (const s of submittals) {
    await pool.query(
      `INSERT INTO submittals (project_name,submittal_number,title,spec_section,submitted_by,reviewer,date_submitted,date_required,date_returned,result,revision,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, s
    );
  }

  // Seed contracts (15)
  const contracts = [
    ['Skyline Tower', 'CT-2024-001', 'General Construction', 'BuildRight Corp', 'GMP', 185000000, 189500000, '2024-01-15', '2026-06-30', 10, 'Active', '2024-01-10', 'Guaranteed Maximum Price with shared savings'],
    ['Skyline Tower', 'CT-2024-002', 'Structural Steel Package', 'Elite Steel Works', 'Lump Sum', 12000000, 12000000, '2024-02-01', '2025-06-30', 5, 'Active', '2024-01-25', 'Fixed price steel erection'],
    ['Harbor Bridge Expansion', 'CT-2024-003', 'Bridge Construction', 'BridgePro LLC', 'Cost Plus', 88000000, 92000000, '2024-03-01', '2025-12-31', 10, 'Active', '2024-02-20', 'Cost plus with GMP cap'],
    ['Green Valley Mall', 'CT-2024-004', 'General Construction', 'MallBuild Inc', 'GMP', 72000000, 72000000, '2024-02-01', '2025-08-15', 10, 'Active', '2024-01-20', 'Green building incentives included'],
    ['Riverside Hospital Wing', 'CT-2024-005', 'Healthcare Construction', 'MedConstruct Inc', 'Lump Sum', 140000000, 148500000, '2024-04-10', '2025-11-30', 10, 'Active', '2024-04-01', 'Includes change order for ICU expansion'],
    ['Mountain View Condos', 'CT-2024-006', 'Residential Construction', 'HomeBuild LLC', 'Lump Sum', 48000000, 51200000, '2024-01-20', '2025-09-30', 5, 'Active', '2024-01-15', 'Smart home upgrade added'],
    ['Tech Campus Phase 2', 'CT-2024-007', 'Campus Construction', 'TechBuild Corp', 'CM at Risk', 180000000, 180000000, '2024-05-01', '2026-03-15', 10, 'Pending', '2024-04-25', 'Pre-construction phase active'],
    ['Highway 101 Overpass', 'CT-2024-008', 'Highway Construction', 'Highway Masters', 'Unit Price', 65000000, 67100000, '2024-06-15', '2025-12-01', 5, 'Active', '2024-06-01', 'State DOT contract'],
    ['Sunset Elementary School', 'CT-2024-009', 'School Construction', 'EduBuild Corp', 'Lump Sum', 38000000, 39800000, '2024-03-20', '2025-06-30', 10, 'Active', '2024-03-10', 'Solar canopy change order added'],
    ['Marina Bay Resort', 'CT-2024-010', 'Resort Construction', 'CoastalBuild LLC', 'GMP', 250000000, 253500000, '2024-07-01', '2026-01-15', 10, 'Active', '2024-06-20', 'Infinity pool upgrade included'],
    ['Central Park Renovation', 'CT-2024-011', 'Park Renovation', 'GreenSpace Builders', 'Lump Sum', 22000000, 22000000, '2024-02-15', '2025-04-30', 5, 'Active', '2024-02-10', 'Historic preservation requirements'],
    ['Solar Farm Installation', 'CT-2024-012', 'Solar Farm EPC', 'SunPower Installers', 'EPC Turnkey', 380000000, 425000000, '2024-08-01', '2025-10-31', 10, 'Active', '2024-07-25', 'Battery storage change order added'],
    ['Metro Line Extension', 'CT-2024-013', 'Tunnel Construction', 'Deep Tunneling Corp', 'Design-Build', 650000000, 656000000, '2024-01-10', '2027-06-30', 10, 'Active', '2024-01-05', 'Emergency exit change order added'],
    ['Water Treatment Plant', 'CT-2024-014', 'Water Treatment Facility', 'AquaBuild Inc', 'CM at Risk', 120000000, 124200000, '2024-04-01', '2025-12-15', 10, 'Active', '2024-03-25', 'UV filtration upgrade added'],
    ['Airport Terminal B', 'CT-2024-015', 'Terminal Construction', 'AeroConstruct', 'GMP', 950000000, 975000000, '2024-09-01', '2027-03-31', 10, 'Pending', '2024-08-20', 'Automated baggage handling added'],
  ];
  for (const c of contracts) {
    await pool.query(
      `INSERT INTO contracts (project_name,contract_number,title,contractor,contract_type,original_value,revised_value,start_date,end_date,retainage_pct,status,signed_date,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, c
    );
  }

  // Seed timesheets (15)
  const timesheets = [
    ['Skyline Tower', 'John Martinez', 'Ironworker', '2024-08-01', '06:00', '14:30', 8, 0.5, 0.5, 'Erected steel columns floor 16, torqued bolts on floor 15 connections', 'Foreman Smith', 'Approved'],
    ['Skyline Tower', 'Mike O\'Brien', 'Crane Operator', '2024-08-01', '05:30', '14:00', 8, 0.5, 0.5, 'Tower crane operation - steel erection floor 16, material hoisting', 'Foreman Smith', 'Approved'],
    ['Skyline Tower', 'John Martinez', 'Ironworker', '2024-08-02', '06:00', '16:00', 8, 2, 0.5, 'Overtime for beam connections floor 16, safety harness inspection', 'Foreman Smith', 'Approved'],
    ['Harbor Bridge Expansion', 'Sarah Chen', 'Electrician', '2024-08-01', '07:00', '15:30', 8, 0.5, 0.5, 'Installed conduit runs on bridge deck section C, pulled wire bridge lights', 'Super Johnson', 'Approved'],
    ['Harbor Bridge Expansion', 'Sarah Chen', 'Electrician', '2024-08-02', '07:00', '15:30', 8, 0, 0.5, 'Continued wire pulling section C, terminated junction boxes', 'Super Johnson', 'Pending'],
    ['Green Valley Mall', 'Carlos Ruiz', 'Concrete Finisher', '2024-08-01', '05:00', '13:30', 8, 0.5, 0.5, 'Foundation pour building B, finished 120 cubic yards', 'Foreman Davis', 'Approved'],
    ['Riverside Hospital Wing', 'David Kim', 'Plumber', '2024-08-01', '06:30', '15:00', 8, 0, 0.5, 'Rough-in medical gas piping 3rd floor, pressure tested 2nd floor', 'Super Park', 'Approved'],
    ['Mountain View Condos', 'James Wilson', 'Carpenter', '2024-08-01', '06:00', '14:30', 8, 0, 0.5, 'Framing units 301-305 building A, hung interior doors unit 210', 'Foreman Lee', 'Approved'],
    ['Tech Campus Phase 2', 'Robert Taylor', 'HVAC Technician', '2024-08-01', '07:00', '15:30', 8, 0, 0.5, 'Design review meeting, submitted ductwork shop drawings', 'Super Wilson', 'Approved'],
    ['Highway 101 Overpass', 'Tom Harris', 'Heavy Equipment Op', '2024-08-01', '05:00', '15:30', 8, 2, 0.5, 'Excavation for pier caps, grading westbound approach', 'Foreman Brown', 'Approved'],
    ['Sunset Elementary School', 'Tom Harris', 'Heavy Equipment Op', '2024-08-02', '06:00', '14:30', 8, 0, 0.5, 'Final grading playground area, backfill at utility trench', 'Foreman White', 'Pending'],
    ['Marina Bay Resort', 'Maria Gonzalez', 'Painter', '2024-08-01', '07:00', '15:30', 8, 0, 0.5, 'Exterior primer coat east elevation, prep work south wall', 'Super Brown', 'Approved'],
    ['Central Park Renovation', 'Chris Brown', 'Landscaper', '2024-08-01', '06:00', '14:00', 8, 0, 0, 'Planted 50 native shrubs zone 3, installed drip irrigation', 'Foreman Taylor', 'Approved'],
    ['Solar Farm Installation', 'Paul White', 'Solar Installer', '2024-08-01', '05:30', '16:00', 8, 2, 0.5, 'Installed 120 panels array D, wired 3 string inverters', 'Super Martin', 'Approved'],
    ['Metro Line Extension', 'Kevin Lee', 'Tunnel Worker', '2024-08-01', '06:00', '14:30', 8, 0, 0.5, 'TBM advance 5 meters, installed 4 ring segments, grouted annulus', 'Shift Super Garcia', 'Approved'],
  ];
  for (const t of timesheets) {
    await pool.query(
      `INSERT INTO timesheets (project_name,worker_name,role,date,start_time,end_time,hours_regular,hours_overtime,break_hours,task_description,approved_by,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, t
    );
  }

  // Seed meeting_minutes (15)
  const meetings = [
    ['Skyline Tower', 'OAC Meeting', '2024-08-01', 'Project Trailer', 'John Smith, Sarah Kim, Mark Stevens, Metro Corp VP', 'Schedule review, budget update, safety report, change orders', 'Discussed 2-week delay on curtain wall delivery. Budget tracking on target. Safety record excellent.', 'Mark to expedite curtain wall order by Aug 5. Sarah to update schedule by Aug 3.', 'Approved helipad change order. Deferred elevator upgrade decision.', '2024-08-15', 'John Smith', 'Approved'],
    ['Skyline Tower', 'Safety Meeting', '2024-08-05', 'Site Office', 'Safety Team, All Foremen, Workers', 'Weekly safety toolbox talk - fall protection', 'Reviewed fall protection requirements for floors 15+. Demonstrated proper harness inspection.', 'All workers to re-certify harness training by Aug 12. Replace worn lanyards.', 'Mandatory 100% tie-off above floor 10.', '2024-08-12', 'Lisa Anderson', 'Approved'],
    ['Harbor Bridge Expansion', 'Progress Meeting', '2024-08-02', 'City Hall Conf Room', 'Sarah Johnson, City of SF Reps, DOT Inspector', 'Monthly progress review, traffic management, community concerns', 'Deck panel installation 65% complete. Traffic pattern working well. Noise complaint from Marina district.', 'Adjust night work schedule to end by 10pm. Install additional sound barriers by Aug 10.', 'Extended night work window by 1 hour to 9pm-10pm only.', '2024-09-02', 'Sarah Johnson', 'Approved'],
    ['Green Valley Mall', 'Design Meeting', '2024-07-28', 'Architect Office', 'Mike Chen, Architect, MEP Eng, Solar Consultant', 'Solar panel layout optimization, LEED certification progress', 'Solar layout revised for 15% more capacity. LEED Gold on track. EV charging layout approved.', 'Architect to issue revised roof plan by Aug 1. MEP to coordinate conduit routes.', 'Selected SolarTech 400W panels. Approved EV charging locations.', '2024-08-28', 'Mike Chen', 'Approved'],
    ['Riverside Hospital Wing', 'Coordination Meeting', '2024-08-08', 'Hospital Board Room', 'Lisa Park, Hospital Admin, Infection Control, All Subs', 'MEP coordination, infection control protocols, ICU expansion', 'BIM clash detection found 23 new clashes. Infection control barriers in place. ICU design 90% complete.', 'MEP subs to resolve clashes by Aug 15. Infection control audit scheduled Aug 20.', 'ICU expansion approved to proceed. Additional negative pressure rooms added.', '2024-08-22', 'Lisa Park', 'Approved'],
    ['Mountain View Condos', 'HOA Meeting', '2024-08-10', 'Sales Center', 'Tom Davis, HOA Board, Sales Team', 'Construction progress, smart home features demo, sales update', '70% of units framed. Smart home demo well received. 45% pre-sold.', 'Sales team to update marketing materials with smart home features.', 'Added premium smart home package as optional upgrade.', '2024-09-10', 'Tom Davis', 'Approved'],
    ['Tech Campus Phase 2', 'Kickoff Meeting', '2024-07-15', 'TechGiant HQ', 'Amy Wilson, TechGiant CTO, All Design Team', 'Project kickoff, design goals, sustainability targets', 'Project scope confirmed. LEED Platinum targeted. Data center Tier 4 requirement confirmed.', 'Design team to submit 30% drawings by Sep 1. Geotech report due Aug 15.', 'Underground parking approved. Green roof included in scope.', '2024-08-15', 'Amy Wilson', 'Draft'],
    ['Highway 101 Overpass', 'Public Meeting', '2024-07-20', 'Community Center', 'Robert Lee, CalTrans, Community Members', 'Construction impact, noise mitigation, schedule update', '50 residents attended. Main concerns: noise, dust, traffic delays. Sound barriers well received.', 'Install noise monitoring stations by Jul 25. Publish weekly traffic updates.', 'Added weekend work restriction near residential areas.', '2024-08-20', 'Robert Lee', 'Approved'],
    ['Sunset Elementary School', 'School Board Meeting', '2024-08-15', 'School District Office', 'Karen White, School Board, Principal, PTA President', 'Progress update, school year preparation, playground design', 'Building 80% complete. On track for January opening. Playground equipment selected.', 'Coordinate summer break intensive work schedule. Final color selections due Aug 20.', 'Approved solar canopy for playground. Selected PermaSafe playground surface.', '2024-09-15', 'Karen White', 'Approved'],
    ['Marina Bay Resort', 'Investor Meeting', '2024-09-01', 'Coastal Resorts HQ', 'David Brown, Investors, Architect, Marketing', 'Project status, design updates, ROI projections', 'Permitting progressing. Infinity pool design approved. Projected ROI 18% annually.', 'Marketing to prepare pre-launch campaign. Architect to finalize lobby design.', 'Approved VIP villa expansion. Selected Italian marble for lobby.', '2024-10-01', 'David Brown', 'Draft'],
    ['Central Park Renovation', 'Community Meeting', '2024-06-25', 'Park Pavilion', 'Jennifer Taylor, City Council, Community Groups', 'Renovation progress, community input, event space design', 'Irrigation 75% complete. Native planting started. Amphitheater foundations poured.', 'Schedule community planting day for Jul 15. Finalize amphitheater seating plan.', 'Selected native plant species list. Approved outdoor event calendar.', '2024-07-25', 'Jennifer Taylor', 'Approved'],
    ['Solar Farm Installation', 'Utility Meeting', '2024-08-20', 'NV Energy Office', 'Chris Martin, NV Energy, Grid Eng, Battery Vendor', 'Grid connection plan, battery storage integration, commissioning schedule', 'Grid study complete. Battery storage layout approved. Commissioning plan reviewed.', 'Submit interconnection application by Sep 1. Battery vendor to deliver by Oct 15.', 'Approved grid connection at 500MW. Battery storage at 100MWh confirmed.', '2024-09-20', 'Chris Martin', 'Approved'],
    ['Metro Line Extension', 'TBM Meeting', '2024-08-15', 'Tunnel Site Office', 'Patricia Garcia, TBM Team Lead, Geotech Consultant', 'TBM progress, geological conditions, alignment check', 'TBM advanced 450m total. Rock conditions harder than expected in section 3. Alignment on target.', 'Adjust TBM cutting parameters for harder rock. Order additional cutter heads.', 'Approved contingency budget for rock conditions. Added vibration monitoring.', '2024-08-29', 'Patricia Garcia', 'Approved'],
    ['Water Treatment Plant', 'Regulatory Meeting', '2024-09-10', 'City Water Dept', 'James Wilson, EPA Rep, City Water Director', 'Compliance review, testing protocols, commissioning plan', 'All systems meeting interim EPA standards. UV system installation on schedule.', 'Submit final compliance report by Oct 1. Schedule commissioning tests for Nov.', 'Approved phased commissioning approach. Water quality testing protocol finalized.', '2024-10-10', 'James Wilson', 'Approved'],
    ['Airport Terminal B', 'FAA Coordination', '2024-10-01', 'Airport Admin Building', 'Michelle Adams, FAA Rep, Airport Ops, Airlines', 'Airside construction coordination, safety protocols, phasing plan', 'Phase 1 design approved. Night construction schedule accepted. Airline gate reassignment planned.', 'Submit runway crossing plan by Oct 15. Coordinate crane heights with ATC.', 'Approved Phase 1 construction start date. Night-only airside work confirmed.', '2024-11-01', 'Michelle Adams', 'Draft'],
  ];
  for (const m of meetings) {
    await pool.query(
      `INSERT INTO meeting_minutes (project_name,meeting_type,date,location,attendees,agenda,discussion,action_items,decisions,next_meeting_date,recorded_by,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, m
    );
  }

  // Seed progress_photos (15)
  const photos = [
    ['Skyline Tower', '2024-08-01', 'Floor 16 - Steel Erection', 'Column erection in progress at grid A1-A5, crane lifting W14x500 column', 'Structural', 'John Smith', 'Construction Progress', 'Clear 85F', 'steel,columns,crane', '/photos/skyline/IMG_0801_001.jpg', 'Current', 'Shows column plumb alignment'],
    ['Skyline Tower', '2024-08-02', 'Lobby - Marble Installation', 'Italian marble floor tile installation 40% complete in main lobby', 'Interior Finish', 'Sarah Kim', 'Interior', 'N/A Indoor', 'marble,lobby,flooring', '/photos/skyline/IMG_0802_001.jpg', 'Current', 'Pattern alignment verified'],
    ['Harbor Bridge Expansion', '2024-08-01', 'Section C - Deck Panels', 'Deck panel installation showing 8 panels placed today', 'Deck Installation', 'Field Eng', 'Construction Progress', 'Fog clearing', 'bridge,deck,panels', '/photos/bridge/IMG_0801_001.jpg', 'Current', 'Panels aligned per survey'],
    ['Green Valley Mall', '2024-08-01', 'Building B - Foundation', 'Aerial view of foundation pour building B, 120 cubic yards placed', 'Foundation', 'Drone Pilot', 'Aerial', 'Hot sunny 98F', 'foundation,concrete,aerial', '/photos/mall/IMG_0801_001.jpg', 'Current', 'Drone photo - full foundation visible'],
    ['Riverside Hospital Wing', '2024-08-01', '3rd Floor - MEP Rough-in', 'Mechanical ductwork and electrical conduit rough-in above ceiling', 'MEP', 'MEP Coordinator', 'MEP Progress', 'N/A Indoor', 'ductwork,conduit,mep', '/photos/hospital/IMG_0801_001.jpg', 'Current', 'BIM coordination verified'],
    ['Mountain View Condos', '2024-08-01', 'Building A - Exterior', 'Framing progress building A showing units 301-310', 'Framing', 'Site Super', 'Construction Progress', 'Clear 88F', 'framing,wood,exterior', '/photos/condos/IMG_0801_001.jpg', 'Current', 'Window openings framed'],
    ['Highway 101 Overpass', '2024-08-01', 'Pier Caps - Section B', 'Concrete pour for 6 pier caps showing formwork and rebar', 'Concrete', 'Field Eng', 'Construction Progress', 'Clear 95F', 'concrete,pier,rebar', '/photos/highway/IMG_0801_001.jpg', 'Current', 'Rebar placement verified per spec'],
    ['Sunset Elementary School', '2024-08-01', 'Roof - Truss Installation', 'Roof truss installation classrooms 1-12 complete', 'Roofing', 'Site Super', 'Construction Progress', 'Clear 102F', 'roof,trusses,school', '/photos/school/IMG_0801_001.jpg', 'Current', 'Hurricane clips installed'],
    ['Marina Bay Resort', '2024-08-01', 'Pile Driving - Main Bldg', 'Steel H-pile driving for main building foundation', 'Foundation', 'Marine Eng', 'Construction Progress', 'Sunny 87F', 'piles,foundation,marine', '/photos/resort/IMG_0801_001.jpg', 'Current', 'Pile driving log matches spec'],
    ['Central Park Renovation', '2024-08-01', 'Zone 3 - Irrigation', 'Irrigation system installation showing mainline and laterals', 'Landscaping', 'Landscape Arch', 'Landscaping', 'Clear 78F', 'irrigation,landscape,pipes', '/photos/park/IMG_0801_001.jpg', 'Current', 'Pressure test passed'],
    ['Solar Farm Installation', '2024-08-01', 'Array D - Panel Install', 'Aerial view of 500 solar panels installed in array D', 'Installation', 'Drone Pilot', 'Aerial', 'Sunny 95F', 'solar,panels,aerial', '/photos/solar/IMG_0801_001.jpg', 'Current', 'Drone flight at 200ft'],
    ['Metro Line Extension', '2024-08-01', 'Tunnel Section 3 - TBM', 'TBM face showing cutting head and ring segment installation', 'Tunneling', 'Tunnel Eng', 'Underground', 'N/A Underground', 'tunnel,tbm,segments', '/photos/metro/IMG_0801_001.jpg', 'Current', 'TBM advancement on schedule'],
    ['Water Treatment Plant', '2024-08-01', 'Settling Tanks 3-4', 'Installation of primary settling tanks showing steel tank walls', 'Equipment', 'Process Eng', 'Equipment Install', 'Clear 90F', 'tanks,settling,water', '/photos/water/IMG_0801_001.jpg', 'Current', 'Tank alignment verified'],
    ['Airport Terminal B', '2024-08-01', 'Site Layout - Survey', 'Survey staking for terminal B foundation layout', 'Preconstruction', 'Survey Team', 'Survey', 'Clear 82F', 'survey,staking,layout', '/photos/airport/IMG_0801_001.jpg', 'Current', 'Control points established'],
    ['Industrial Park Complex', '2024-08-01', 'Building 1 - Steel Frame', 'Pre-engineered metal building steel frame erection', 'Structural', 'Site Super', 'Construction Progress', 'Hot 97F', 'steel,frame,industrial', '/photos/industrial/IMG_0801_001.jpg', 'Current', 'Frame 60% erected'],
  ];
  for (const p of photos) {
    await pool.query(
      `INSERT INTO progress_photos (project_name,date_taken,location,description,phase,taken_by,category,weather_conditions,tags,file_path,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, p
    );
  }

  // Seed warranties (15)
  const warranties = [
    ['Skyline Tower', 'Curtain Wall System', 'FacadeGlobal Inc', 'Product & Labor', '2026-06-30', '2036-06-30', 10, 'Covers glass breakage, seal failure, water infiltration, aluminum finish defects', 'warranty@facadeglobal.com 800-555-0201', 'Submit written claim within 30 days of defect discovery', 'Active', 'Includes annual inspection requirement'],
    ['Skyline Tower', 'Elevator System', 'Otis Elevator', 'Full Service', '2026-06-30', '2031-06-30', 5, 'Covers all mechanical components, electronics, cab finishes, and regular maintenance', 'service@otis.com 800-555-0202', 'Call service hotline, 4-hour response time', 'Active', 'Includes monthly maintenance visits'],
    ['Skyline Tower', 'Roof Membrane', 'Carlisle SynTec', 'Material & Labor', '2026-06-30', '2046-06-30', 20, 'Full waterproofing membrane system including flashings and penetrations', 'warranty@carlisle.com 800-555-0203', 'Contact regional rep for inspection within 48 hours', 'Active', 'NDL (No Dollar Limit) warranty'],
    ['Harbor Bridge Expansion', 'Bridge Bearings', 'BearingTech Corp', 'Product', '2025-12-31', '2050-12-31', 25, 'Structural bearing pads, covers material defects and premature wear', 'support@bearingtech.com 800-555-0204', 'Submit inspection report with photos', 'Active', 'Load testing required at year 10'],
    ['Harbor Bridge Expansion', 'Deck Coating', 'ProtectCoat Inc', 'Product & Application', '2025-12-31', '2035-12-31', 10, 'Bridge deck waterproofing and wear surface coating', 'claims@protectcoat.com 800-555-0205', 'Written notice within 15 days', 'Active', 'Annual inspection by manufacturer'],
    ['Green Valley Mall', 'Solar Panel System', 'SolarTech Industries', 'Performance', '2025-08-15', '2050-08-15', 25, 'Guarantees minimum 80% output at year 25, covers defects and degradation', 'warranty@solartech.com 800-555-0206', 'Submit performance data quarterly', 'Active', 'Performance monitoring required'],
    ['Green Valley Mall', 'HVAC System', 'Trane Technologies', 'Parts & Labor', '2025-08-15', '2030-08-15', 5, 'Covers compressors, coils, controls, and all mechanical components', 'service@trane.com 800-555-0207', 'Call service center, 24-hour response', 'Active', 'Requires annual maintenance per spec'],
    ['Riverside Hospital Wing', 'Medical Gas System', 'MedGas Corp', 'System', '2025-11-30', '2035-11-30', 10, 'Complete medical gas piping, outlets, alarms, and control panels', 'warranty@medgas.com 800-555-0208', 'Emergency 2-hour response for patient safety', 'Active', 'Semi-annual testing required'],
    ['Mountain View Condos', 'Windows & Doors', 'Andersen Corp', 'Product', '2025-09-30', '2045-09-30', 20, 'Glass, frames, hardware, seals, and finish on all windows and doors', 'homeowner@andersen.com 800-555-0209', 'Register online and submit claim', 'Active', 'Transferable to future owners'],
    ['Mountain View Condos', 'Kitchen Appliances', 'Bosch Home', 'Product', '2025-09-30', '2027-09-30', 2, 'All kitchen appliances including dishwasher, oven, cooktop, microwave', 'support@bosch.com 800-555-0210', 'Call support line with model and serial numbers', 'Active', 'Extended warranty available for purchase'],
    ['Sunset Elementary School', 'Playground Equipment', 'PlaySafe Inc', 'Product & Safety', '2025-06-30', '2035-06-30', 10, 'All playground structures, safety surfacing, and hardware', 'safety@playsafe.com 800-555-0211', 'Report safety issues immediately, 24-hour response', 'Active', 'Annual safety inspection required'],
    ['Metro Line Extension', 'Tunnel Waterproofing', 'TunnelSeal Corp', 'System', '2027-06-30', '2047-06-30', 20, 'Complete tunnel waterproofing membrane system', 'claims@tunnelseal.com 800-555-0212', 'Submit leak report with exact location', 'Pending', 'Monitoring period during construction'],
    ['Water Treatment Plant', 'RO Membrane System', 'AquaPure Systems', 'Performance', '2025-12-15', '2030-12-15', 5, 'Reverse osmosis membranes, output quality and flow rate guarantees', 'warranty@aquapure.com 800-555-0213', 'Submit water quality test results monthly', 'Pending', 'Performance bond required'],
    ['Airport Terminal B', 'Baggage Handling System', 'BagTech International', 'System', '2027-03-31', '2032-03-31', 5, 'Complete automated baggage handling including conveyors, sorters, and controls', 'support@bagtech.com 800-555-0214', 'Call 24/7 support center, 1-hour response', 'Pending', 'Includes spare parts inventory'],
    ['Industrial Park Complex', 'Metal Building System', 'Butler Manufacturing', 'Structural', '2025-11-30', '2050-11-30', 25, 'Pre-engineered metal building frames, panels, roof, and wall systems', 'warranty@butler.com 800-555-0215', 'Submit claim with structural assessment', 'Active', 'Transferable with building sale'],
  ];
  for (const w of warranties) {
    await pool.query(
      `INSERT INTO warranties (project_name,item,manufacturer,warranty_type,start_date,end_date,duration_years,coverage,contact_info,claim_procedure,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, w
    );
  }

  // Seed environmental_compliance (15)
  const envComp = [
    ['Skyline Tower', 'Stormwater', 'Clean Water Act - NPDES', 'SWPPP implementation and monitoring for 2-acre construction site', '2024-08-01', 'Compliant', 'EPA Inspector Ray', 'None required', '2024-11-01', 'EPA Region 2', 'Active', 'BMP inspections weekly'],
    ['Skyline Tower', 'Air Quality', 'Clean Air Act - Dust Control', 'Fugitive dust monitoring and suppression during demolition and excavation', '2024-07-15', 'Compliant', 'Air Quality Inspector', 'None required', '2024-10-15', 'NYC DEP', 'Active', 'Water trucks operating daily'],
    ['Harbor Bridge Expansion', 'Marine Protection', 'Marine Mammal Protection Act', 'Monitoring marine life during pile driving operations in harbor', '2024-06-20', 'Conditional', 'Marine Biologist', 'Added bubble curtains around pile zones', '2024-09-20', 'NOAA', 'Active', 'Marine mammal observer on site daily'],
    ['Harbor Bridge Expansion', 'Water Quality', 'Clean Water Act - Section 404', 'Wetland delineation and protection during bridge expansion', '2024-05-10', 'Compliant', 'Wetland Specialist', 'None required', '2024-11-10', 'Army Corps of Engineers', 'Active', 'Silt curtains installed'],
    ['Green Valley Mall', 'Erosion Control', 'State Stormwater Permit', 'Erosion and sediment control measures for 15-acre site', '2024-07-01', 'Compliant', 'State Inspector', 'None required', '2024-10-01', 'TX Commission on Env Quality', 'Active', 'Silt fence and inlet protection in place'],
    ['Riverside Hospital Wing', 'Hazmat', 'RCRA - Waste Management', 'Hazardous waste management for medical waste and construction debris', '2024-08-05', 'Compliant', 'Hazmat Inspector', 'None required', '2024-11-05', 'IL EPA', 'Active', 'Separate waste streams maintained'],
    ['Mountain View Condos', 'Noise', 'Local Noise Ordinance', 'Construction noise monitoring at property boundaries', '2024-07-20', 'Non-Compliant', 'City Inspector', 'Installed noise barriers, restricted hours to 7am-6pm', '2024-08-20', 'City of Denver', 'Corrective Action', 'Exceeded 85dB at east boundary'],
    ['Tech Campus Phase 2', 'Endangered Species', 'Endangered Species Act', 'Pre-construction survey for protected bird nesting sites', '2024-06-01', 'Compliant', 'Wildlife Biologist', 'Delayed clearing until nesting season complete', '2024-09-01', 'US Fish & Wildlife', 'Active', 'No active nests found in survey'],
    ['Highway 101 Overpass', 'Air Quality', 'CA Air Resources Board', 'Equipment emissions monitoring and idling restrictions', '2024-07-30', 'Compliant', 'CARB Inspector', 'None required', '2024-10-30', 'CARB', 'Active', 'All equipment Tier 4 compliant'],
    ['Sunset Elementary School', 'Lead/Asbestos', 'EPA - NESHAP', 'Asbestos survey and abatement for adjacent demolished structure', '2024-04-15', 'Compliant', 'Certified Abatement Inspector', 'Abatement completed per NESHAP requirements', '2024-07-15', 'EPA Region 9', 'Completed', 'Clearance air monitoring passed'],
    ['Marina Bay Resort', 'Coastal Zone', 'Coastal Zone Management Act', 'Coastal development permit compliance monitoring', '2024-09-01', 'Pending', 'Coastal Inspector', 'Awaiting initial inspection', '2024-12-01', 'FL DEP', 'Pending', 'Construction seaward of coastal setback line'],
    ['Solar Farm Installation', 'Desert Tortoise', 'Endangered Species Act', 'Desert tortoise survey and relocation plan for 500-acre site', '2024-07-10', 'Compliant', 'Wildlife Biologist', 'Relocated 3 tortoises per approved protocol', '2024-10-10', 'US Fish & Wildlife', 'Active', 'Exclusion fencing installed'],
    ['Metro Line Extension', 'Groundwater', 'Safe Drinking Water Act', 'Groundwater monitoring during tunnel dewatering operations', '2024-08-01', 'Compliant', 'Hydro Geologist', 'None required', '2024-11-01', 'MA DEP', 'Active', 'Monthly groundwater level monitoring'],
    ['Water Treatment Plant', 'Discharge', 'Clean Water Act - NPDES', 'Construction stormwater and dewatering discharge monitoring', '2024-09-15', 'Compliant', 'EPA Inspector', 'None required', '2024-12-15', 'TX Commission on Env Quality', 'Active', 'Discharge within permit limits'],
    ['Airport Terminal B', 'Noise', 'FAA Part 150 Noise Study', 'Construction noise assessment relative to airport noise contours', '2024-10-01', 'Compliant', 'Noise Consultant', 'Night work only per agreement', '2025-01-01', 'FAA', 'Active', 'Noise monitoring stations installed'],
  ];
  for (const e of envComp) {
    await pool.query(
      `INSERT INTO environmental_compliance (project_name,compliance_type,regulation,description,monitoring_date,result,inspector,corrective_action,deadline,agency,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, e
    );
  }

  // Seed bim_models (15)
  const bim = [
    ['Skyline Tower', 'Skyline-ARCH-Central', 'Architectural', '24.3', 145, 120, 'Architect Team', 'Revit 2024', 'LOD 400', '2.8 GB', '2024-08-01', 'Published', 'Central model with all floors'],
    ['Skyline Tower', 'Skyline-STR-Central', 'Structural', '18.1', 89, 85, 'Structural Eng', 'Revit 2024', 'LOD 400', '1.9 GB', '2024-08-01', 'Published', 'Steel and concrete structure'],
    ['Skyline Tower', 'Skyline-MEP-Central', 'MEP', '22.5', 234, 198, 'MEP Team', 'Revit 2024', 'LOD 350', '3.2 GB', '2024-07-30', 'In Progress', 'HVAC, plumbing, electrical combined'],
    ['Skyline Tower', 'Skyline-FACADE-Detail', 'Facade', '8.2', 56, 56, 'Facade Consultant', 'Rhino/Grasshopper', 'LOD 400', '1.1 GB', '2024-07-28', 'Published', 'Parametric curtain wall model'],
    ['Harbor Bridge Expansion', 'Harbor-STR-Bridge', 'Structural', '12.0', 34, 30, 'Bridge Eng', 'Tekla Structures', 'LOD 400', '850 MB', '2024-08-01', 'Published', 'Bridge steel and concrete'],
    ['Harbor Bridge Expansion', 'Harbor-CIVIL-Alignment', 'Civil', '6.3', 12, 12, 'Civil Eng', 'Civil 3D', 'LOD 300', '420 MB', '2024-07-25', 'Published', 'Road alignment and grading'],
    ['Green Valley Mall', 'Mall-ARCH-Central', 'Architectural', '15.0', 78, 65, 'Architect', 'Revit 2024', 'LOD 350', '1.5 GB', '2024-07-30', 'In Progress', 'Full mall architectural model'],
    ['Riverside Hospital Wing', 'Hospital-ARCH-Wing', 'Architectural', '20.1', 112, 90, 'Healthcare Architect', 'Revit 2024', 'LOD 400', '2.1 GB', '2024-08-01', 'In Progress', 'New wing with OR suites'],
    ['Riverside Hospital Wing', 'Hospital-MEP-MedGas', 'Medical Equipment', '10.4', 67, 45, 'MEP Eng', 'Revit MEP', 'LOD 400', '780 MB', '2024-07-28', 'In Progress', 'Medical gas and specialty systems'],
    ['Tech Campus Phase 2', 'Campus-ARCH-Master', 'Architectural', '5.0', 23, 10, 'Design Team', 'Revit 2024', 'LOD 200', '980 MB', '2024-07-15', 'Design Development', 'Master plan model 3 buildings'],
    ['Metro Line Extension', 'Metro-TUN-Alignment', 'Tunneling', '14.2', 45, 40, 'Tunnel Eng', 'Civil 3D/Navisworks', 'LOD 350', '1.8 GB', '2024-08-01', 'Published', 'Tunnel alignment and stations'],
    ['Metro Line Extension', 'Metro-STR-Stations', 'Structural', '8.7', 56, 35, 'Station Architect', 'Revit 2024', 'LOD 300', '1.2 GB', '2024-07-20', 'In Progress', 'Station structures and platforms'],
    ['Airport Terminal B', 'Airport-ARCH-TermB', 'Architectural', '3.0', 189, 45, 'AeroArch', 'Revit 2024', 'LOD 200', '2.5 GB', '2024-09-30', 'Design Development', 'Terminal B full design model'],
    ['Water Treatment Plant', 'Water-PROC-System', 'Process', '7.1', 28, 25, 'Process Eng', 'AutoCAD Plant 3D', 'LOD 350', '650 MB', '2024-08-15', 'In Progress', 'Treatment process piping model'],
    ['Solar Farm Installation', 'Solar-ELEC-Array', 'Electrical', '4.0', 15, 15, 'Electrical Eng', 'AutoCAD Electrical', 'LOD 300', '380 MB', '2024-08-20', 'Published', 'Panel array and electrical routing'],
  ];
  for (const b of bim) {
    await pool.query(
      `INSERT INTO bim_models (project_name,model_name,discipline,version,clash_count,resolved_count,author,software,lod_level,file_size,last_updated,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, b
    );
  }

  console.log('Seed data inserted successfully!');
  console.log('Login credentials: admin@construction.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
