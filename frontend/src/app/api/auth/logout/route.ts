import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';
import { sessionDigest } from '@/lib/authSession';
import { ensurePostgres } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  const rawSession = request.cookies.get(AUTH_COOKIE)?.value;
  if (rawSession) {
    try { await (await ensurePostgres()).query('UPDATE compliance_sessions SET revoked_at=NOW() WHERE session_digest=$1 AND revoked_at IS NULL', [sessionDigest(rawSession)]); } catch {}
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
