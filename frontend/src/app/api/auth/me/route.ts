import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';
import { decodeSession, sessionDigest } from '@/lib/authSession';
import { ensurePostgres } from '@/lib/postgres';

export async function GET(request: NextRequest) {
  const rawSession = request.cookies.get(AUTH_COOKIE)?.value;
  const user = decodeSession(rawSession);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  try {
    const db = await ensurePostgres();
    const result = await db.query(`SELECT s.session_digest FROM compliance_sessions s LEFT JOIN compliance_identities i ON i.id=s.identity_id WHERE s.session_digest=$1 AND s.tenant_id=$2 AND lower(s.identity_email)=lower($3) AND s.revoked_at IS NULL AND s.expires_at>NOW() AND (s.identity_id IS NULL OR (i.tenant_id=$2 AND i.active=TRUE))`, [sessionDigest(rawSession || ''), user.tenantId, user.email]);
    if (!result.rows[0]) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 503 });
  }
}
