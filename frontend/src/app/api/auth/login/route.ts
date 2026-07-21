import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, type SessionUser } from '@/lib/auth';
import { verifyPassword } from '@/lib/authCredentials';
import { encodeSession, sessionDigest } from '@/lib/authSession';
import { ensurePostgres } from '@/lib/postgres';

const attempts = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  recent.push(now); attempts.set(key, recent);
  return recent.length > 8;
}

export async function POST(request: NextRequest) {
  const runtimeAcknowledged = process.env.COMPLIANCE_LOCAL_LOGIN_ACKNOWLEDGEMENT === 'runtime-disposable-database';
  if (process.env.NODE_ENV === 'production' && !runtimeAcknowledged) return NextResponse.json({ error: 'Local password login is disabled; configure the approved OIDC callback' }, { status: 501 });
  const body = await request.json().catch(() => null);
  const tenantId = String(body?.tenantId || body?.tenant || body?.tenantSlug || process.env.DEFAULT_TENANT_ID || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!tenantId || !email || !password) return NextResponse.json({ error: 'Tenant, email, and password are required' }, { status: 400 });
  const limitKey = `${request.headers.get('x-forwarded-for') || 'local'}|${tenantId}|${email}`;
  if (limited(limitKey)) return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });
  try {
    const db = await ensurePostgres();
    const result = await db.query('SELECT id,tenant_id,email,password_hash,first_name,last_name,role FROM compliance_identities WHERE tenant_id=$1 AND lower(email)=$2 AND active=TRUE', [tenantId, email]);
    const identity = result.rows[0];
    if (!identity || !(await verifyPassword(password, identity.password_hash))) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const user: SessionUser = { email: identity.email, firstName: identity.first_name, lastName: identity.last_name, role: identity.role, tenantId: identity.tenant_id };
    const session = encodeSession(user);
    await db.query('INSERT INTO compliance_sessions(session_digest,identity_id,identity_email,tenant_id,expires_at) VALUES($1,$2,$3,$4,$5)', [sessionDigest(session), identity.id, identity.email, identity.tenant_id, new Date(Date.now() + 8 * 60 * 60 * 1000)]);
    attempts.delete(limitKey);
    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE, session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && !runtimeAcknowledged,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 });
  }
}
