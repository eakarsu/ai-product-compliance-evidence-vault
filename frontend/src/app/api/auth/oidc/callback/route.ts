import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';
import { encodeSession, sessionDigest } from '@/lib/authSession';
import { exchangeAndVerify, OIDC_COOKIES, secureEqual } from '@/lib/oidc';
import { ensurePostgres } from '@/lib/postgres';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(OIDC_COOKIES.state)?.value;
  const nonce = request.cookies.get(OIDC_COOKIES.nonce)?.value;
  const verifier = request.cookies.get(OIDC_COOKIES.verifier)?.value;
  if (!code || !nonce || !verifier || !secureEqual(expectedState, state)) return NextResponse.json({ error: 'Invalid OIDC callback transaction' }, { status: 400 });
  try {
    const user = await exchangeAndVerify(request, code, verifier, nonce);
    const session = encodeSession(user);
    await (await ensurePostgres()).query('INSERT INTO compliance_sessions(session_digest,identity_id,identity_email,tenant_id,expires_at) VALUES($1,NULL,$2,$3,$4)', [sessionDigest(session), user.email, user.tenantId, new Date(Date.now() + 8 * 60 * 60 * 1000)]);
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set(AUTH_COOKIE, session, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
    for (const name of Object.values(OIDC_COOKIES)) response.cookies.set(name, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/auth/oidc', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: 'OIDC identity verification failed' }, { status: 401 });
  }
}
