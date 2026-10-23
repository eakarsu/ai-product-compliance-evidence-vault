import { NextRequest, NextResponse } from 'next/server';
import { getEntitySet } from '@/lib/entityStore';
import { buildDomainFallback, domainFeatures } from '@/lib/featurePack';
import { requireSession } from '@/lib/requestAuth';

function parseProviderJson(content: string): Record<string, unknown> | null {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function callProvider(featureTitle: string, setTitle: string, rows: unknown, fallback: Record<string, unknown>): Promise<{ result: Record<string, unknown>; provider: string; model: string } | null> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const useOpenRouter = Boolean(openRouterKey);
  const apiKey = useOpenRouter ? openRouterKey : openAiKey;
  if (!apiKey) return null;
  const model = useOpenRouter ? process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini' : process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const url = useOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a domain analyst. Return only a JSON object with the same keys as the provided baseline. Preserve false, 0, and empty values exactly when they are accurate.' },
          { role: 'user', content: 'Feature: ' + featureTitle + '\nRecord set: ' + setTitle + '\nBaseline computed from the records: ' + JSON.stringify(fallback) + '\nRecords (up to 50): ' + JSON.stringify(rows) + '\nImprove recommendedActions and add a short summary field, keeping every count grounded in the records.' },
        ],
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = parseProviderJson(content);
    return parsed ? { result: parsed, provider: useOpenRouter ? 'openrouter' : 'openai', model } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ features: domainFeatures });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const body = (await request.json().catch(() => null)) as { feature?: string; slug?: string } | null;
  const feature = domainFeatures.find((item) => item.id === body?.feature) ?? domainFeatures[0];
  const slug = typeof body?.slug === 'string' ? body.slug : '';
  const set = slug ? await getEntitySet(slug) : null;
  if (slug && !set) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const rows = set?.rows ?? [];
  const fallback = buildDomainFallback(feature.id, set?.title || 'Workspace records', rows, new Date().toISOString());
  const configured = Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
  if (!configured) {
    return NextResponse.json({ aiGenerated: false, provider: 'deterministic-fallback', label: 'Deterministic fallback - no AI provider configured (OPENROUTER_API_KEY/OPENAI_API_KEY not set).', feature, result: fallback });
  }
  const ai = await callProvider(feature.title, set?.title || 'Workspace records', rows.slice(0, 50), fallback);
  if (!ai) {
    return NextResponse.json({ aiGenerated: false, provider: 'deterministic-fallback', label: 'Deterministic fallback - the configured AI provider did not return usable JSON.', feature, result: fallback });
  }
  return NextResponse.json({ aiGenerated: true, provider: ai.provider, model: ai.model, feature, result: ai.result });
}
