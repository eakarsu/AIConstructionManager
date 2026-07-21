# Controlled construction project operations

The authoritative path is `/api/project-controls`: RFIs, submittals, changes, daily logs, inspections and closeout share a revisioned state machine. Manager/inspector transitions record approval role, rationale and signature digest; cost snapshots retain source references and deterministic forecast calculations; audit and connector-run tables preserve history and failures. Generated gap routes/navigation are quarantined and model output cannot approve work.

Copy `.env.example`, bootstrap once, migrate explicitly, and use the non-mutating `start.sh`. The launcher neither installs nor seeds nor kills unrelated processes. Demo fixtures require an explicit confirmation and are refused in production.

BIM/document, scheduling, accounting, offline/mobile and contractor portal adapters are deployment work. They must use tenant/project scopes, revision/cursor idempotency, failure recording and reconciliation reports. Digital-signature policy, retention schedules and field/offline conflict testing require owner and professional approval.
