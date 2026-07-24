BEGIN;
CREATE TABLE IF NOT EXISTS compliance_ai_results (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  identity_email TEXT NOT NULL,
  feature TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS compliance_ai_results_tenant_feature_idx
  ON compliance_ai_results(tenant_id,feature,created_at DESC);
COMMIT;
