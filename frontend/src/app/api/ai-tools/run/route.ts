import { requestWorkbenchAI, persistWorkbenchResult, workbenchError } from '@/lib/WorkbenchAIRuntime';
import { NextRequest, NextResponse } from 'next/server';
import { aiTools, getAITool } from '@/lib/aiTools';
import { appendAuditEntry } from '@/lib/auditStore';
import { requireSession } from '@/lib/requestAuth';
import { ensurePostgres } from '@/lib/postgres';

async function callConfiguredAI(system: string, prompt: string, signal: AbortSignal) { return (await requestWorkbenchAI(system, prompt, signal)).content; }

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;

  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(50, Math.floor(requestedLimit))) : 12;

  try {
    const db = await ensurePostgres();
    const saved = await db.query<{
      id: string;
      feature: string;
      input: string;
      output: string;
      model: string;
      created_at: Date | string;
    }>(
      `SELECT id::text, feature, input, output, model, created_at
       FROM compliance_ai_results
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [session.tenantId, limit],
    );

    return NextResponse.json({
      tools: aiTools,
      results: saved.rows.map((row) => ({
        id: row.id,
        tool: getAITool(row.feature),
        input: row.input,
        response: row.output,
        provider: 'openrouter',
        model: row.model,
        createdAt: new Date(row.created_at).toISOString(),
        saved: true,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Saved AI results are unavailable.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;

  try {
  const body = await request.json().catch(() => null) as { toolId?: string; input?: string } | null;
  if (!body?.input?.trim()) return NextResponse.json({ error: 'input is required' }, { status: 400 });
  const tool = getAITool(body?.toolId || 'suite-assistant');
  const input = body.input.trim();
  const system = 'You are ' + tool.title + '. Stay inside this suite workflow. Return concise operational guidance with risks, next actions, and audit notes.';

  const response = await callConfiguredAI(system, input, request.signal);
  const model = process.env.OPENROUTER_MODEL || '';
  const db = await ensurePostgres();
  const persisted = await persistWorkbenchResult(request.signal, db, client => client.query(`INSERT INTO compliance_ai_results(tenant_id,identity_email,feature,input,output,model)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, [session.tenantId, session.email, tool.id, input, response, model]));

  request.signal.throwIfAborted();

  await appendAuditEntry('AI Tools', ((session.firstName + ' ' + session.lastName).trim() || session.email) + ' ran ' + tool.title);

  return NextResponse.json({
    tool,
    input,
    response,
    id: persisted.rows[0].id,
    provider: 'openrouter',
    model,
    createdAt: new Date().toISOString(),
  });
  } catch (error) { const failure = workbenchError(error, request.signal); return NextResponse.json({error: failure.error}, {status: failure.status}); }
}
