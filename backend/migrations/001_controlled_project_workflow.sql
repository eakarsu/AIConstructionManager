BEGIN;
CREATE TABLE IF NOT EXISTS cm_organizations (id BIGSERIAL PRIMARY KEY, tenant_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cm_memberships (organization_id BIGINT NOT NULL REFERENCES cm_organizations(id), user_id BIGINT NOT NULL, role TEXT NOT NULL CHECK(role IN ('worker','contractor','manager','inspector','admin')), PRIMARY KEY(organization_id,user_id));
CREATE TABLE IF NOT EXISTS cm_control_items (
 id BIGSERIAL PRIMARY KEY, organization_id BIGINT NOT NULL REFERENCES cm_organizations(id), project_id BIGINT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('rfi','submittal','change','daily_log','inspection','closeout')),
 number TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','approved','rejected','implemented','verified')),
 current_revision INTEGER NOT NULL DEFAULT 1, due_at TIMESTAMPTZ, created_by BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(project_id,kind,number)
);
CREATE TABLE IF NOT EXISTS cm_control_revisions (id BIGSERIAL PRIMARY KEY, control_item_id BIGINT NOT NULL REFERENCES cm_control_items(id), revision INTEGER NOT NULL, payload JSONB NOT NULL, content_hash TEXT NOT NULL, created_by BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(control_item_id,revision));
CREATE TABLE IF NOT EXISTS cm_approvals (id BIGSERIAL PRIMARY KEY, control_item_id BIGINT NOT NULL REFERENCES cm_control_items(id), from_status TEXT NOT NULL, to_status TEXT NOT NULL, actor_id BIGINT NOT NULL, actor_role TEXT NOT NULL, signature_digest TEXT, rationale TEXT, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS cm_cost_snapshots (id BIGSERIAL PRIMARY KEY, organization_id BIGINT NOT NULL, project_id BIGINT NOT NULL, as_of TIMESTAMPTZ NOT NULL, budget NUMERIC(16,2) NOT NULL, committed NUMERIC(16,2) NOT NULL, actual NUMERIC(16,2) NOT NULL, pending_changes NUMERIC(16,2) NOT NULL, remaining_estimate NUMERIC(16,2) NOT NULL, source_refs JSONB NOT NULL, created_by BIGINT NOT NULL, UNIQUE(project_id,as_of));
CREATE TABLE IF NOT EXISTS cm_audit_events (id BIGSERIAL PRIMARY KEY, organization_id BIGINT NOT NULL, project_id BIGINT, actor_id BIGINT, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id BIGINT, before_state JSONB, after_state JSONB, request_id TEXT, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS cm_connector_runs (id BIGSERIAL PRIMARY KEY, organization_id BIGINT NOT NULL, project_id BIGINT, connector TEXT NOT NULL, cursor_value TEXT, status TEXT NOT NULL CHECK(status IN ('running','succeeded','failed','blocked')), records_received INTEGER NOT NULL DEFAULT 0, error JSONB, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), finished_at TIMESTAMPTZ);
COMMIT;
