/**
 * AI endpoints for AIConstructionManager
 * Uses the existing openrouter.js wrapper.
 */

const express = require('express');
const router = express.Router();
const { aiQuery } = require('../openrouter');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const SYSTEM_PROMPT_BASE =
  'You are an expert construction estimator and project manager with deep knowledge of commercial construction costs, contract law, and project risk management. Format responses with clear markdown headers and actionable recommendations.';

// ─────────────────────────────────────────────────────────────────────────────
// Input validation helper
// ─────────────────────────────────────────────────────────────────────────────
function requireFields(fields, body) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  return missing.length ? `Missing required fields: ${missing.join(', ')}` : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/schedule-analysis
// Takes {project_id, milestones[], resources[]} → critical path + delay risks
// ─────────────────────────────────────────────────────────────────────────────
router.post('/schedule-analysis', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['milestones'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { project_id, milestones, resources } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are a CPM scheduling expert. Analyze construction project schedules for critical path and risk.`;
  const userPrompt = `Analyze this construction project schedule:
Project ID: ${project_id || 'Not specified'}

Milestones:
${Array.isArray(milestones) ? JSON.stringify(milestones, null, 2) : milestones}

Resources:
${resources ? (Array.isArray(resources) ? JSON.stringify(resources, null, 2) : resources) : 'Not specified'}

Please provide:
1. Critical path identification (which tasks, if delayed, will delay the overall project)
2. Float analysis for non-critical tasks
3. Resource loading conflicts and bottlenecks
4. Top 5 delay risk factors with probability and impact assessment
5. Recommended schedule compression strategies (crashing, fast-tracking)
6. Milestone achievement probability (percentage)
7. Recommended buffer/contingency time allocations`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/safety-inspection
// Takes {site_conditions, recent_incidents[]} → OSHA compliance gaps
// ─────────────────────────────────────────────────────────────────────────────
router.post('/safety-inspection', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['site_conditions'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { site_conditions, recent_incidents, project_type, location } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are an OSHA-certified safety officer and construction safety expert. Provide detailed compliance and hazard analysis.`;
  const userPrompt = `Conduct a safety inspection analysis:

Site Conditions:
${typeof site_conditions === 'string' ? site_conditions : JSON.stringify(site_conditions, null, 2)}

Recent Incidents:
${recent_incidents ? (Array.isArray(recent_incidents) ? JSON.stringify(recent_incidents, null, 2) : recent_incidents) : 'None reported'}

Project Type: ${project_type || 'Not specified'}
Location: ${location || 'Not specified'}

Please provide:
1. OSHA compliance gap analysis (cite specific OSHA standards: 29 CFR 1926.xxx)
2. Critical hazard identification ranked by severity (Imminent Danger / Serious / Other-Than-Serious)
3. Required corrective actions for each identified hazard (immediate and long-term)
4. Personal Protective Equipment (PPE) requirements assessment
5. Required safety training recommendations
6. Safety program improvements
7. Documentation and recordkeeping requirements (OSHA 300 log, incident reporting)
8. Toolbox talk topics recommended for the next 30 days`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/cost-estimate
// Takes {scope_description, location, project_type} → itemized estimate
// ─────────────────────────────────────────────────────────────────────────────
router.post('/cost-estimate', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['scope_description'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { scope_description, location, project_type, square_footage, quality_level } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are a certified construction cost estimator with access to current RSMeans cost data.`;
  const userPrompt = `Generate an itemized construction cost estimate:

Scope Description: ${scope_description}
Location: ${location || 'National average'}
Project Type: ${project_type || 'Commercial construction'}
Square Footage: ${square_footage || 'Not specified'}
Quality Level: ${quality_level || 'Standard'}

Please provide:
1. Itemized cost breakdown by CSI division:
   - Division 03: Concrete
   - Division 04: Masonry
   - Division 05: Metals / Structural Steel
   - Division 06: Wood & Plastics
   - Division 07: Thermal & Moisture Protection
   - Division 08: Doors & Windows
   - Division 09: Finishes
   - Division 14-28: Specialties / Equipment / MEP Systems
2. General conditions and project overhead (8-15% of direct costs)
3. Contingency recommendation (percentage with justification)
4. General contractor profit and overhead (10-15%)
5. Location factor adjustment
6. Total project cost range (low / expected / high)
7. Cost per square foot (if applicable)
8. Key cost drivers and potential savings opportunities`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/change-order-analysis
// Takes {change_description, original_scope} → cost and schedule impact
// ─────────────────────────────────────────────────────────────────────────────
router.post('/change-order-analysis', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['change_description', 'original_scope'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { change_description, original_scope, contract_type, current_budget, current_schedule } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are an expert in construction change order evaluation and contract management.`;
  const userPrompt = `Analyze this change order:

Change Description: ${change_description}
Original Scope: ${original_scope}
Contract Type: ${contract_type || 'Lump sum (assumed)'}
Current Budget: ${current_budget ? '$' + current_budget : 'Not provided'}
Current Schedule: ${current_schedule || 'Not provided'}

Please provide:
1. Change order justification assessment (is this truly a change or within original scope?)
2. Cost impact analysis:
   - Direct costs (labor, materials, equipment)
   - Indirect costs (overhead, bond, insurance premium adjustments)
   - Estimated total cost impact range
3. Schedule impact analysis:
   - Calendar days of delay (if any)
   - Impact on critical path
   - Extended general conditions cost
4. Contractor entitlement assessment (Is the contractor entitled to additional compensation?)
5. Risk allocation analysis
6. Recommended negotiation strategy
7. Documentation requirements to support the claim
8. Suggested compromise position`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/daily-report-generator
// Takes {date, weather, work_performed, issues} → professional daily report
// ─────────────────────────────────────────────────────────────────────────────
router.post('/daily-report-generator', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['work_performed'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { date, weather, work_performed, issues, crew_count, materials_used, equipment_used, project_name, visitor_log } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You format professional construction daily reports that are suitable for owner submission and legal documentation.`;
  const userPrompt = `Generate a professional daily construction report:

Project: ${project_name || 'Construction Project'}
Date: ${date || new Date().toLocaleDateString()}
Weather: ${weather || 'Not recorded'}
Crew Count: ${crew_count || 'Not recorded'}
Visitor Log: ${visitor_log || 'None'}

Work Performed:
${work_performed}

Issues / Delays:
${issues || 'None reported'}

Materials Used:
${materials_used || 'Not recorded'}

Equipment Used:
${equipment_used || 'Not recorded'}

Please format as a professional daily construction report including:
1. Executive Summary (2-3 sentences)
2. Work Completed Today (organized by area/trade)
3. Work In Progress
4. Issues, Delays, and RFIs (if any)
5. Safety Observations
6. Schedule Status (on track / ahead / behind)
7. Tomorrow's Planned Work
8. Action Items Required`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/rfi-response
// Takes {rfi_question, project_specs_context} → technical response
// ─────────────────────────────────────────────────────────────────────────────
router.post('/rfi-response', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['rfi_question'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { rfi_question, project_specs_context, rfi_number, submitted_by, spec_section } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are drafting formal RFI responses that are technically precise, legally appropriate, and help maintain project progress.`;
  const userPrompt = `Draft a professional RFI response:

RFI Number: ${rfi_number || 'N/A'}
Submitted By: ${submitted_by || 'Contractor'}
Spec Section: ${spec_section || 'Not specified'}

Question / Request:
${rfi_question}

Project Specifications Context:
${project_specs_context || 'Not provided — respond based on standard construction practices'}

Please provide:
1. Direct technical answer to the question
2. Reference to applicable specifications, drawings, or standards
3. Any clarifications or additional information required
4. Impact assessment (does this change scope/cost/schedule?)
5. Recommended action (proceed as specified / revise drawings / issue addendum)
6. Formatted RFI response suitable for official documentation`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/weather-impact
// Takes {forecast_data, scheduled_activities[]} → work sequence adjustments
// ─────────────────────────────────────────────────────────────────────────────
router.post('/weather-impact', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['forecast_data'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { forecast_data, scheduled_activities, project_location, project_phase } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are a construction scheduling expert who specializes in weather impact analysis and work sequence optimization.`;
  const userPrompt = `Analyze weather impact on construction activities:

Forecast Data:
${typeof forecast_data === 'string' ? forecast_data : JSON.stringify(forecast_data, null, 2)}

Scheduled Activities:
${scheduled_activities ? (Array.isArray(scheduled_activities) ? JSON.stringify(scheduled_activities, null, 2) : scheduled_activities) : 'General construction activities'}

Project Location: ${project_location || 'Not specified'}
Project Phase: ${project_phase || 'Not specified'}

Please provide:
1. Weather-sensitive activity identification (which activities will be affected and why)
2. Work stoppage risk assessment (likelihood and duration)
3. Recommended activity resequencing to minimize weather delays:
   - Move indoor/weather-insensitive work to high-risk weather days
   - Accelerate weather-sensitive work before adverse conditions
4. Temperature-sensitive material/work considerations (concrete, roofing, painting, etc.)
5. Safety precautions for anticipated weather conditions
6. Schedule impact estimate (days lost)
7. Cost impact estimate (idle crews, equipment, extended conditions)
8. Recommended notifications to owner/subcontractors`;

  const result = await aiQuery(systemPrompt, userPrompt);
  res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: send 503 when no API key configured (apply4 backlog endpoints)
// ─────────────────────────────────────────────────────────────────────────────
function sendAiResult(res, result) {
  if (result && result.success === false && result.noKey) {
    return res.status(503).json({ error: result.result, noKey: true });
  }
  return res.json(result);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/summarize-meeting
// Takes {minutes_text, project_name?, meeting_type?, attendees?} → action items
// (apply4 backlog: meetingMinutes lacked /summarize-meetings)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/summarize-meeting', auth, aiRateLimiter, async (req, res) => {
  const err = requireFields(['minutes_text'], req.body);
  if (err) return res.status(422).json({ error: err });

  const { minutes_text, project_name, meeting_type, attendees, meeting_date } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You extract structured, machine-readable action items from raw construction meeting minutes. Return concise, accurate, and accountable summaries.`;
  const userPrompt = `Summarize these construction meeting minutes and extract structured action items:

Project: ${project_name || 'Not specified'}
Meeting Type: ${meeting_type || 'Not specified'}
Date: ${meeting_date || 'Not specified'}
Attendees: ${attendees || 'Not specified'}

Minutes:
${typeof minutes_text === 'string' ? minutes_text : JSON.stringify(minutes_text, null, 2)}

Please provide:
1. Executive Summary (3-5 sentences)
2. Key Decisions Made (bulleted)
3. Action Items table — for each: Description | Owner | Due Date | Priority (High/Med/Low)
4. Open Issues / Risks Raised
5. Schedule, Cost, or Scope Impacts
6. Required Follow-ups Before Next Meeting
7. Suggested Agenda Items for the Next Meeting`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/prioritize-punchlist
// Takes {items[], project_phase?, target_closeout_date?} → ranked criticality
// (apply4 backlog: punchList lacked /prioritize-punchlist)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/prioritize-punchlist', auth, aiRateLimiter, async (req, res) => {
  const e = requireFields(['items'], req.body);
  if (e) return res.status(422).json({ error: e });

  const { items, project_phase, target_closeout_date, project_name } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You are a construction closeout specialist. Score punch-list items by criticality and impact on substantial completion / final acceptance.`;
  const userPrompt = `Prioritize this construction punch list:

Project: ${project_name || 'Not specified'}
Phase: ${project_phase || 'Not specified'}
Target Closeout Date: ${target_closeout_date || 'Not specified'}

Items:
${Array.isArray(items) ? JSON.stringify(items, null, 2) : items}

Please provide:
1. Ranked list (highest → lowest criticality) — each item with: Item | Criticality (1-10) | Closeout Impact (Blocking / Significant / Cosmetic) | Suggested Sequence Group (A/B/C) | Reasoning
2. Items that are blocking substantial completion
3. Items that should be deferred to warranty / 1-year walkthrough (low impact)
4. Recommended sequencing groups (parallel vs serial work)
5. Estimated days to clear each criticality tier
6. Trades that need to be re-mobilised and any inspection re-triggers`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/analyze-progress-photo
// Takes {photo_description, project_phase?, expected_state?, location?}
// → progress assessment, anomalies, recommended follow-ups
// (apply4 backlog: progressPhotos lacked vision-style analysis;
//  text-only here since vision keys are not assumed available)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/analyze-progress-photo', auth, aiRateLimiter, async (req, res) => {
  const e = requireFields(['photo_description'], req.body);
  if (e) return res.status(422).json({ error: e });

  const { photo_description, project_phase, expected_state, location, weather, date_taken, project_name } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You analyse described construction progress photographs and infer percent complete, quality concerns, safety observations, and follow-up actions.`;
  const userPrompt = `Analyze this construction progress photo:

Project: ${project_name || 'Not specified'}
Project Phase: ${project_phase || 'Not specified'}
Date Taken: ${date_taken || 'Not specified'}
Location: ${location || 'Not specified'}
Weather: ${weather || 'Not specified'}
Expected State at this Date: ${expected_state || 'Not specified'}

Photo Description (in natural language):
${typeof photo_description === 'string' ? photo_description : JSON.stringify(photo_description, null, 2)}

Please provide:
1. Estimated percent complete for the visible work, with confidence level
2. Comparison to expected state — ahead / on schedule / behind, with reasoning
3. Quality observations (workmanship, finish, alignment) — flag anything sub-standard
4. Safety observations visible in the description (PPE, fall protection, housekeeping)
5. Apparent code-of-record concerns (referencing relevant CSI division / IBC / OSHA where possible)
6. Recommended follow-up actions ranked by priority
7. Suggested additional photos / angles to capture next visit
8. Suggested tags / categories for the project photo log`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/equipment-utilization  (apply4 backlog: equipment counterpart)
// Takes {fleet[], project_phase?, recent_idle_days?} → utilization & rotation
// ─────────────────────────────────────────────────────────────────────────────
router.post('/equipment-utilization', auth, aiRateLimiter, async (req, res) => {
  const e = requireFields(['fleet'], req.body);
  if (e) return res.status(422).json({ error: e });

  const { fleet, project_phase, recent_idle_days, project_name } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You analyse construction equipment fleets and recommend utilization, rotation, and maintenance plans.`;
  const userPrompt = `Analyze equipment utilization for this construction project:

Project: ${project_name || 'Not specified'}
Project Phase: ${project_phase || 'Not specified'}
Recent Idle Days (last 30): ${recent_idle_days || 'Not specified'}

Fleet:
${Array.isArray(fleet) ? JSON.stringify(fleet, null, 2) : fleet}

Please provide:
1. Per-asset utilization assessment (Underused / Optimal / Overused) with reasoning
2. Recommended rotation or release back to rental
3. Preventive maintenance triggers (hours/days based)
4. Operator-to-equipment ratio concerns
5. Cost-saving opportunities (rent vs own, swap class, share between projects)
6. Critical equipment risk: single points of failure on the schedule
7. Recommended next-30-day rebalancing plan`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/permits-risk  (apply4 backlog: permits counterpart)
// Takes {permit_list[], jurisdiction?, target_start_date?} → risk + sequencing
// ─────────────────────────────────────────────────────────────────────────────
router.post('/permits-risk', auth, aiRateLimiter, async (req, res) => {
  const e = requireFields(['permit_list'], req.body);
  if (e) return res.status(422).json({ error: e });

  const { permit_list, jurisdiction, target_start_date, project_name, project_type } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You assess permit/regulatory risk and sequencing for construction projects.`;
  const userPrompt = `Assess permit risk and recommended sequencing:

Project: ${project_name || 'Not specified'}
Project Type: ${project_type || 'Not specified'}
Jurisdiction: ${jurisdiction || 'Not specified'}
Target Construction Start: ${target_start_date || 'Not specified'}

Permits:
${Array.isArray(permit_list) ? JSON.stringify(permit_list, null, 2) : permit_list}

Please provide:
1. Risk score per permit (Low / Medium / High) with typical processing time
2. Hard prerequisites (which permits must be issued before others can be applied for)
3. Long-lead permits that should be filed FIRST
4. Recommended filing order with target dates relative to start date
5. Common rejection causes for each permit type and how to mitigate them
6. Inspections required during construction
7. Documents typically required (surveys, energy calcs, specialty engineer reports)`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/submittals-review  (apply4 backlog: submittals counterpart)
// Takes {submittal_text, spec_section?, manufacturer?} → review notes / actions
// ─────────────────────────────────────────────────────────────────────────────
router.post('/submittals-review', auth, aiRateLimiter, async (req, res) => {
  const e = requireFields(['submittal_text'], req.body);
  if (e) return res.status(422).json({ error: e });

  const { submittal_text, spec_section, manufacturer, submittal_number, project_name } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You review construction submittals for spec compliance, completeness, and required approvals.`;
  const userPrompt = `Review this construction submittal:

Project: ${project_name || 'Not specified'}
Submittal Number: ${submittal_number || 'Not specified'}
Spec Section: ${spec_section || 'Not specified'}
Manufacturer: ${manufacturer || 'Not specified'}

Submittal Content:
${typeof submittal_text === 'string' ? submittal_text : JSON.stringify(submittal_text, null, 2)}

Please provide:
1. Spec compliance assessment with cited deviations (if any)
2. Completeness check (missing data sheets, certifications, samples, calcs)
3. Recommended disposition: Approved / Approved-as-Noted / Revise & Resubmit / Rejected — with rationale
4. Comments to the submitter (numbered, actionable)
5. Coordination items for adjacent trades
6. Long-lead procurement risk (if approval delays push delivery past need-by)
7. Suggested resubmittal due date if applicable`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/warranty-claim  (apply4 backlog: warranties counterpart)
// Takes {issue_description, item, manufacturer?, install_date?} → claim draft
// ─────────────────────────────────────────────────────────────────────────────
router.post('/warranty-claim', auth, aiRateLimiter, async (req, res) => {
  const e = requireFields(['issue_description', 'item'], req.body);
  if (e) return res.status(422).json({ error: e });

  const { issue_description, item, manufacturer, install_date, warranty_type, project_name } = req.body;

  const systemPrompt = `${SYSTEM_PROMPT_BASE} You draft formal construction warranty claims that reference applicable warranty terms and required documentation.`;
  const userPrompt = `Draft a construction warranty claim:

Project: ${project_name || 'Not specified'}
Item: ${item}
Manufacturer: ${manufacturer || 'Not specified'}
Warranty Type: ${warranty_type || 'Not specified'}
Install Date: ${install_date || 'Not specified'}

Issue:
${issue_description}

Please provide:
1. Claim coverage assessment (typically covered? what to cite?)
2. Likely warranty terms that apply (manufacturer vs contractor 1-year, latent defects)
3. Required documentation checklist (photos, install records, inspection reports)
4. Formal claim letter draft addressed to the manufacturer / GC
5. Recommended next steps and escalation path
6. Statute-of-limitations or notice deadline considerations
7. Suggested interim mitigation actions to prevent further damage`;

  const result = await aiQuery(systemPrompt, userPrompt);
  return sendAiResult(res, result);
});

module.exports = router;
