import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ensurePostgres } from '@/lib/postgres';
import { requireSession } from '@/lib/requestAuth';

const grants: Record<string, string[]> = { analyst: ['draft:evidence_review'], manager: ['evidence_review:approval_pending', 'evidence_review:changes_requested'], admin: ['approval_pending:approved', 'approved:released'] };
const transitions: Record<string, string[]> = { draft: ['evidence_review', 'withdrawn'], evidence_review: ['approval_pending', 'changes_requested'], changes_requested: ['evidence_review'], approval_pending: ['approved', 'changes_requested', 'rejected'], approved: ['released', 'superseded'], released: ['superseded', 'withdrawn'] };
const risks = new Set(['low', 'medium', 'high', 'critical']);
function canonical(value: unknown): string { if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`; if (value && typeof value === 'object') { const map = value as Record<string, unknown>; return `{${Object.keys(map).sort().map(key => `${JSON.stringify(key)}:${canonical(map[key])}`).join(',')}}`; } return JSON.stringify(value); }
function digest(value: unknown) { return crypto.createHash('sha256').update(canonical(value)).digest('hex'); }

export async function GET(request: NextRequest) {
  const user = requireSession(request); if (user instanceof NextResponse) return user;
  if (!['manager', 'admin'].includes(user.role)) return NextResponse.json({ error: 'Audit export requires manager or administrator role' }, { status: 403 });
  const tenant = user.tenantId;
  const db = await ensurePostgres();
  const result = await db.query('SELECT d.id,d.policy_version_id,d.from_status,d.to_status,d.actor_id,d.actor_role,d.rationale,d.evidence_snapshot,d.occurred_at FROM compliance_decisions d WHERE d.tenant_id=$1 ORDER BY d.occurred_at DESC,d.id DESC LIMIT 1000', [tenant]);
  return NextResponse.json({ tenantId: tenant, exportedAt: new Date().toISOString(), records: result.rows }, { headers: { 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="compliance-audit.json"' } });
}

export async function POST(request: NextRequest) {
  const user = requireSession(request); if (user instanceof NextResponse) return user;
  if (user.role !== 'analyst') return NextResponse.json({ error: 'Only analysts can ingest, evaluate, or author compliance records' }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, any> | null;
  const tenant = user.tenantId;
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const db = await ensurePostgres();

  if (body.action === 'ingest_source') {
    const required = ['sourceId', 'sourceUri', 'publisher', 'jurisdiction', 'effectiveAt', 'retrievedAt', 'sourceVersion', 'content'];
    if (required.some(key => !body[key]) || !String(body.sourceUri).startsWith('https://') || !Number.isFinite(Date.parse(body.effectiveAt)) || !Number.isFinite(Date.parse(body.retrievedAt))) return NextResponse.json({ error: 'Authoritative versioned HTTPS source, valid dates, jurisdiction and content are required' }, { status: 400 });
    const id = crypto.randomUUID(); const contentDigest = digest(body.content);
    const provenance = { sourceId: body.sourceId, sourceUri: body.sourceUri, publisher: body.publisher, jurisdiction: body.jurisdiction, effectiveAt: body.effectiveAt, retrievedAt: body.retrievedAt, sourceVersion: body.sourceVersion };
    const inserted = await db.query('INSERT INTO compliance_sources(id,tenant_id,source_id,source_uri,publisher,jurisdiction,effective_at,retrieved_at,source_version,content_digest,source_provenance) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(tenant_id,source_id,source_version,content_digest) DO NOTHING RETURNING *', [id, tenant, body.sourceId, body.sourceUri, body.publisher, body.jurisdiction, body.effectiveAt, body.retrievedAt, body.sourceVersion, contentDigest, JSON.stringify(provenance)]);
    if (inserted.rowCount) return NextResponse.json(inserted.rows[0], { status: 201 });
    const replay = await db.query('SELECT * FROM compliance_sources WHERE tenant_id=$1 AND source_id=$2 AND source_version=$3 AND content_digest=$4', [tenant, body.sourceId, body.sourceVersion, contentDigest]);
    return NextResponse.json(replay.rows[0]);
  }

  if (body.action === 'evaluate') {
    const citations = Array.isArray(body.citations) ? body.citations : []; const obligations = Array.isArray(body.obligations) ? body.obligations : [];
    const failures: string[] = [];
    if (!citations.length || citations.some((item: any) => !item.sourceUri || !item.locator)) failures.push('citations');
    if (!obligations.length || obligations.some((item: any) => !item.ownerId || !item.deadline || !Number.isFinite(Date.parse(item.deadline)) || !risks.has(item.riskRating))) failures.push('obligations');
    if (!body.policyVersionId || !body.scenarioId) failures.push('scenario');
    if (failures.includes('scenario')) return NextResponse.json({ error: 'Policy version and scenario are required', failures }, { status: 400 });
    const policy = await db.query('SELECT id FROM policy_versions WHERE id=$1 AND tenant_id=$2', [body.policyVersionId, tenant]); if (!policy.rowCount) return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    const input = { citations, obligations }; const inputDigest = digest(input); const result = { passed: failures.length === 0, failures, citations, obligations };
    const inserted = await db.query('INSERT INTO compliance_evaluations(id,tenant_id,policy_version_id,scenario_id,input_digest,result,passed) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(policy_version_id,scenario_id,input_digest) DO NOTHING RETURNING *', [crypto.randomUUID(), tenant, body.policyVersionId, body.scenarioId, inputDigest, JSON.stringify(result), result.passed]);
    if (inserted.rowCount) return NextResponse.json(inserted.rows[0], { status: 201 });
    const replay = await db.query('SELECT * FROM compliance_evaluations WHERE policy_version_id=$1 AND scenario_id=$2 AND input_digest=$3', [body.policyVersionId, body.scenarioId, inputDigest]); return NextResponse.json(replay.rows[0]);
  }

  if (!body.policyKey || !body.title || !body.ownerId || !Array.isArray(body.evidenceSourceIds) || !body.evidenceSourceIds.length) return NextResponse.json({ error: 'Policy key, title, accountable owner, and evidence links required' }, { status: 400 });
  const id = crypto.randomUUID(); const client = await db.connect();
  try {
    await client.query('BEGIN');
    const sources = await client.query('SELECT id FROM compliance_sources WHERE tenant_id=$1 AND id=ANY($2::uuid[])', [tenant, body.evidenceSourceIds]);
    if (sources.rowCount !== body.evidenceSourceIds.length) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Evidence sources must exist in the same tenant' }, { status: 409 }); }
    const created = await client.query('INSERT INTO policy_versions(id,tenant_id,policy_key,version,status,owner_id,title,body_digest,retain_until) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [id, tenant, body.policyKey, body.version || 1, 'draft', body.ownerId, body.title, digest(body.body || ''), body.retainUntil || null]);
    for (const sourceId of body.evidenceSourceIds as string[]) await client.query('INSERT INTO evidence_links(policy_version_id,source_id,citation) VALUES($1,$2,$3)', [id, sourceId, 'initial evidence']);
    await client.query('COMMIT'); return NextResponse.json(created.rows[0], { status: 201 });
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}

export async function PATCH(request: NextRequest) {
  const user = requireSession(request); if (user instanceof NextResponse) return user;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.id || !body.rationale || String(body.rationale).length < 8) return NextResponse.json({ error: 'ID and meaningful rationale required' }, { status: 400 });
  const tenant = user.tenantId; const db = await ensurePostgres(); const client = await db.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT * FROM policy_versions WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [body.id, tenant]);
    if (!found.rowCount) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Policy not found' }, { status: 404 }); }
    const policy = found.rows[0];
    if (body.action === 'set_records_control') {
      if (user.role !== 'admin' || typeof body.legalHold !== 'boolean') { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Administrator and legal-hold state required' }, { status: 403 }); }
      if (body.retainUntil && !Number.isFinite(Date.parse(String(body.retainUntil)))) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Valid retention date required' }, { status: 400 }); }
      const updated = await client.query('UPDATE policy_versions SET legal_hold=$1,retain_until=$2,updated_at=NOW() WHERE id=$3 AND tenant_id=$4 RETURNING *', [body.legalHold, body.retainUntil || null, policy.id, tenant]);
      await client.query('INSERT INTO compliance_decisions(tenant_id,policy_version_id,from_status,to_status,actor_id,actor_role,rationale,evidence_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [tenant, policy.id, policy.status, policy.status, user.email, user.role, body.rationale, JSON.stringify({ event: 'records_control_changed', legalHold: body.legalHold, retainUntil: body.retainUntil || null })]);
      await client.query('COMMIT'); return NextResponse.json(updated.rows[0]);
    }
    if (!body.toStatus) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Target status required' }, { status: 400 }); }
    const evidence = await client.query('SELECT * FROM evidence_links WHERE policy_version_id=$1 ORDER BY source_id,citation', [policy.id]); const edge = `${policy.status}:${body.toStatus}`;
    if (!transitions[policy.status]?.includes(String(body.toStatus)) || !grants[user.role]?.includes(edge)) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Forbidden transition' }, { status: 403 }); }
    if (['approved', 'released'].includes(String(body.toStatus)) && (user.email === policy.owner_id || user.email === policy.reviewer_id)) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Segregation of duties violation' }, { status: 409 }); }
    if (['approved', 'released'].includes(String(body.toStatus))) { const evaluation = await client.query('SELECT passed FROM compliance_evaluations WHERE policy_version_id=$1 AND tenant_id=$2 ORDER BY evaluated_at DESC LIMIT 1', [policy.id, tenant]); if (!evaluation.rows[0]?.passed) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'A passing scenario evaluation is required' }, { status: 409 }); } }
    const updated = await client.query("UPDATE policy_versions SET status=$1,reviewer_id=CASE WHEN $1='approval_pending' THEN $2 ELSE reviewer_id END,approver_id=CASE WHEN $1 IN('approved','released') THEN $2 ELSE approver_id END,updated_at=NOW() WHERE id=$3 AND tenant_id=$4 RETURNING *", [body.toStatus, user.email, policy.id, tenant]);
    await client.query('INSERT INTO compliance_decisions(tenant_id,policy_version_id,from_status,to_status,actor_id,actor_role,rationale,evidence_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [tenant, policy.id, policy.status, body.toStatus, user.email, user.role, body.rationale, JSON.stringify(evidence.rows)]);
    await client.query('COMMIT'); return NextResponse.json(updated.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
