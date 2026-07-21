# Completeness Review: ai-product-compliance-evidence-vault

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 90 project files (66 source files), 2 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Prototype-demo**

This is a prototype/demo for governance/compliance. Generated gap/demo patterns are present: it contains 66 source files and visible routes/pages in `frontend/`, `backend/`, but those surfaces are not evidence of durable domain execution, verified integrations, or operational completion.

## Why it is not complete

- Generated gap/visualization routes describe missing capabilities or simulate recommendations; they do not implement the underlying domain operation.
- Generic LLM calls are used as product behavior without enough typed tools, grounded evidence, deterministic rules, or output evaluation.
- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Replace advisory-only AI output with versioned policies, evidence links, accountable owners, approvals, and immutable decisions.
2. Add authoritative regulatory/contract ingestion with source provenance, effective dates, jurisdiction, and change detection.
3. Implement SSO, least-privilege RBAC, segregation of duties, retention/legal holds, and exportable audit logs.
4. Build scenario-specific evaluations so citations, obligations, deadlines, and risk ratings are checked before release.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Credential/configuration exposure: environment files are present in the repository tree and must be checked against Git history and rotated if real.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.
- AI-provider availability, cost, privacy, prompt injection, and unvalidated output are launch risks until bounded and evaluated.

## Evidence inspected

- `README.md`
- `SOURCE_DATA_TABLES.md:127`
- `frontend/src/lib/sourceAIToolFields.ts:6`
- `frontend/src/app/layout.tsx`
- `backend/package.json`
- `start.sh`

## Recommended next action

Stop adding generated pages; prove one governance/compliance workflow against real services and persistent state, with tests and measurable acceptance criteria.

## Implementation progress — 2026-07-19

1. Implemented the governed core: PostgreSQL policy versions carry accountable owners, retention/hold metadata and body digests; evidence is linked to source versions; role-constrained lifecycle transitions capture immutable decision snapshots. The governed API persists creation and transitions transactionally, and manager/admin audit export is bounded, tenant-scoped and non-cacheable.
2. Implemented deterministic authoritative-source validation/change detection in `governance/compliance.cjs` and additive provenance tables with HTTPS URI, publisher, jurisdiction, effective/retrieval dates, version and content digest. Licensed feed/contract connectors and credentials remain external.
3. Implemented an OIDC authorization-code/PKCE SSO flow with discovery, state/nonce checks, issuer/audience validation and remote JWKS signature verification; only configured role and tenant claims can create signed, expiring sessions, and governed queries use the signed tenant identity. Least-privilege grants, segregation of duties, persisted legal-hold/retention controls, immutable records-control decisions and authorized audit export are enforced. IdP registration, approved group/tenant mapping values, MFA policy, final retention/legal-hold policy and recipient-specific export-redaction rules remain deployment/organizational gates.
4. Implemented deterministic scenario evaluation for citations, obligations, owners, deadlines and bounded risk ratings; approval/release invariants are covered by governance tests. Counsel-approved scenarios and representative evidence corpora remain external validation gates.
5. Added an idempotent additive migration, twelve governance/risk/identity tests, CI with PostgreSQL migration replay/typecheck/build/live authenticated smoke/high-severity dependency audit, a non-destructive explicit launcher and runbook. Fresh verification passed typecheck, all 12 tests, optimized production build, two migration applications on a clean PostgreSQL database, generic and governed API smoke, unauthorized authoring/export failure paths, production local-login quarantine, live append-only-trigger enforcement, and a PostgreSQL backup/restore count check. Dependency audits have no high/critical finding (two moderate transitive PostCSS advisories remain).

Readiness: the review's source-actionable governance controls are implemented and freshly verified, but the project is not production-ready until production IdP registration/configuration, authoritative-source licensing, legal interpretation, security assessment, approved retention/export procedures, deployment-environment recovery testing and representative-user acceptance gates in `RUNBOOK.md` are completed.

## Runtime verification (2026-07-20)

`start.sh start` was verified with disposable PostgreSQL on `127.0.0.1:55624`, API on `127.0.0.1:6062`, and reserved UI port `6063`. Its only attempt, at `2026-07-20T20:16:46Z`, recorded `API_VERIFIED/startup_login_session_api`. Plaintext demo users and client-visible passwords were removed. Local acceptance now requires an acknowledgment-gated identity provisioned in `compliance_identities` with an externally supplied password and scrypt hash; login persists a digest-only `compliance_sessions` row, and `GET /api/auth/me` verifies the signed cookie against the unrevoked database session and active identity. Logout revokes the persisted session. Production local-password login remains disabled unless the disposable-runtime acknowledgment is injected by the test launcher; OIDC sessions are also persisted before use.

TypeScript checking, all 12 governance/OIDC tests, and the optimized Next.js build across 23 pages passed. A separate live PostgreSQL run provisioned analyst/manager/admin identities from a generated password and passed both generic and governed API smokes on port 6062, leaving three identities and six active persisted sessions before fixture teardown. The governed smoke covered source ingestion, evidence-linked policy authoring, RBAC denial, legal hold, deterministic evaluation, segregated approval, release, and audit export. Shell/JavaScript syntax and `git diff --check` passed, and all assigned ports were released.
