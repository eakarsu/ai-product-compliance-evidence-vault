'use client';

import { useState } from 'react';
import JsonReport from '@/components/JsonReport';
import { domainFeatures } from '@/lib/featurePack';

type DomainResponse = {
  aiGenerated: boolean;
  provider: string;
  model?: string;
  label?: string;
  feature: { id: string; title: string };
  result: Record<string, unknown>;
};

export default function DomainAIPanel({ slug }: { slug: string }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<DomainResponse | null>(null);

  async function run(featureId: string) {
    setBusy(featureId);
    setError('');
    try {
      const response = await fetch('/api/ai/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: featureId, slug }),
      });
      const data = (await response.json().catch(() => null)) as DomainResponse | { error?: string } | null;
      if (!response.ok || !data || !('result' in data)) {
        setError((data && 'error' in data && data.error) || 'Domain analysis failed.');
        return;
      }
      setPayload(data as DomainResponse);
    } catch {
      setError('Domain analysis failed.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #e4ebf4', paddingTop: 14 }}>
      <h4 style={{ margin: '0 0 8px' }}>Domain AI analysis</h4>
      <p className="muted" style={{ marginTop: 0 }}>Grounded in the records above. Without a configured AI provider this runs a clearly labelled deterministic fallback.</p>
      <div className="button-row">
        {domainFeatures.map((feature) => (
          <button key={feature.id} className="button subtle" type="button" disabled={busy === feature.id} onClick={() => run(feature.id)}>
            {busy === feature.id ? 'Running...' : feature.title}
          </button>
        ))}
      </div>
      {error ? <div style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div> : null}
      {payload ? (
        <div style={{ marginTop: 12 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            {payload.aiGenerated ? 'AI generated via ' + payload.provider + (payload.model ? ' (' + payload.model + ')' : '') : payload.label || 'Deterministic fallback - not AI generated.'}
          </div>
          <JsonReport data={payload.result} title={payload.feature.title} />
        </div>
      ) : null}
    </div>
  );
}
