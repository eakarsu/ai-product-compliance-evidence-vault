'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const isProduction = process.env.NODE_ENV === 'production';
  const router = useRouter();
  const { ready, user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && user) {
      router.replace('/dashboard');
    }
  }, [ready, router, user]);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (!ok) {
      setError('The email, password, or tenant configuration was not accepted.');
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="pill">Agent Ops</div>
        <h1 style={{ marginBottom: 8 }}>AI Agent Ops login</h1>
        <div className="muted">
          One login for ai agent ops features, source tables, documents, notifications, audit, approvals, and AI operations.
        </div>

        {isProduction ? (
          <a className="button primary" href="/api/auth/oidc/start" style={{ display: 'inline-block', marginTop: 20 }}>Sign in with enterprise SSO</a>
        ) : <form onSubmit={onSubmit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button
            type="button"
            onClick={() => { setEmail(process.env.NEXT_PUBLIC_DEMO_EMAIL || ''); setPassword(process.env.NEXT_PUBLIC_DEMO_PASSWORD || ''); }}
            disabled={!process.env.NEXT_PUBLIC_DEMO_EMAIL || !process.env.NEXT_PUBLIC_DEMO_PASSWORD}
            aria-label="Auto Fill Demo Credentials"
            style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
          >
            Auto Fill Demo Credentials
          </button>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>}

        {error ? <div style={{ color: '#b91c1c', marginTop: 14 }}>{error}</div> : null}

        {!isProduction ? <div className="hint">Use an explicitly provisioned local identity. Credentials are never embedded in the client bundle.</div> : null}
      </div>
    </div>
  );
}
