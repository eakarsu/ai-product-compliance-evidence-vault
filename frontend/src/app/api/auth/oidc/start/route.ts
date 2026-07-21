import { NextRequest, NextResponse } from 'next/server';
import { discover, newOidcTransaction, OIDC_COOKIES, oidcRedirectUri } from '@/lib/oidc';

export async function GET(request: NextRequest) {
  try {
    const document = await discover();
    const clientId = process.env.OIDC_CLIENT_ID;
    if (!clientId) return NextResponse.json({ error: 'OIDC is not configured' }, { status: 503 });
    const transaction = newOidcTransaction();
    const target = new URL(document.authorization_endpoint);
    target.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: oidcRedirectUri(request),
      response_type: 'code',
      scope: process.env.OIDC_SCOPES || 'openid email profile groups',
      state: transaction.state,
      nonce: transaction.nonce,
      code_challenge: transaction.challenge,
      code_challenge_method: 'S256',
    }).toString();
    const response = NextResponse.redirect(target);
    const options = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/api/auth/oidc', maxAge: 600 };
    response.cookies.set(OIDC_COOKIES.state, transaction.state, options);
    response.cookies.set(OIDC_COOKIES.nonce, transaction.nonce, options);
    response.cookies.set(OIDC_COOKIES.verifier, transaction.verifier, options);
    return response;
  } catch {
    return NextResponse.json({ error: 'OIDC is unavailable' }, { status: 503 });
  }
}
