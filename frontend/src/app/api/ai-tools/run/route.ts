import { NextRequest, NextResponse } from 'next/server';
import { aiTools, getAITool } from '@/lib/aiTools';
import { appendAuditEntry } from '@/lib/auditStore';
import { requireSession } from '@/lib/requestAuth';
import { ensurePostgres } from '@/lib/postgres';

async function callConfiguredAI(system: string, prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !baseUrl || !model) throw new Error('OpenRouter configuration is required');
  const response = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error('AI provider returned ' + response.status);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('OpenRouter returned empty content');
  return content;
}

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ tools: aiTools });
}

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null) as { toolId?: string; input?: string } | null;
  if (!body?.input?.trim()) return NextResponse.json({ error: 'input is required' }, { status: 400 });
  const tool = getAITool(body?.toolId || 'suite-assistant');
  const input = body.input.trim();
  const system = 'You are ' + tool.title + '. Stay inside this suite workflow. Return concise operational guidance with risks, next actions, and audit notes.';

  const response = await callConfiguredAI(system, input);
  const model = process.env.OPENROUTER_MODEL || '';
  const db = await ensurePostgres();
  const persisted = await db.query(
    `INSERT INTO compliance_ai_results(tenant_id,identity_email,feature,input,output,model)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
    [session.tenantId, session.email, tool.id, input, response, model],
  );

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
}
