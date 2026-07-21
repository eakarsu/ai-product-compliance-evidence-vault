import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { NextRequest } from 'next/server';
import type { SessionUser } from '@/lib/auth';

export const OIDC_COOKIES = {
  state: 'compliance_oidc_state',
  nonce: 'compliance_oidc_nonce',
  verifier: 'compliance_oidc_verifier',
} as const;

type Discovery = { authorization_endpoint: string; token_endpoint: string; jwks_uri: string; issuer: string };

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for OIDC`);
  return value;
}

export function oidcRedirectUri(request: NextRequest) {
  return process.env.OIDC_REDIRECT_URI || new URL('/api/auth/oidc/callback', request.url).toString();
}

export async function discover(): Promise<Discovery> {
  const issuer = env('OIDC_ISSUER').replace(/\/$/, '');
  const response = await fetch(`${issuer}/.well-known/openid-configuration`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`OIDC discovery failed (${response.status})`);
  const document = await response.json() as Partial<Discovery>;
  if (document.issuer !== issuer || !document.authorization_endpoint || !document.token_endpoint || !document.jwks_uri) throw new Error('OIDC discovery document is invalid');
  return document as Discovery;
}

export function newOidcTransaction() {
  const state = crypto.randomBytes(32).toString('base64url');
  const nonce = crypto.randomBytes(32).toString('base64url');
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { state, nonce, verifier, challenge };
}

export function secureEqual(left: string | undefined, right: string | null) {
  if (!left || !right) return false;
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function claimValues(payload: JWTPayload, name: string) {
  const value = payload[name];
  return Array.isArray(value) ? value.map(String) : value == null ? [] : [String(value)];
}

export function sessionFromClaims(payload: JWTPayload): SessionUser {
  const roleClaim = process.env.OIDC_ROLE_CLAIM || 'groups';
  const tenantClaim = env('OIDC_TENANT_CLAIM');
  const roleMap = JSON.parse(env('OIDC_ROLE_MAP_JSON')) as Record<string, SessionUser['role']>;
  const roles = claimValues(payload, roleClaim);
  const mappedRoles = [...new Set(Object.entries(roleMap).filter(([claim, role]) => roles.includes(claim) && ['admin', 'manager', 'analyst'].includes(role)).map(([, role]) => role))];
  const tenants = claimValues(payload, tenantClaim);
  const tenantId = tenants.length === 1 ? tenants[0] : undefined;
  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
  if (mappedRoles.length !== 1 || !tenantId || !email || payload.email_verified === false) throw new Error('OIDC identity is missing an unambiguous approved role, tenant, or verified email');
  const display = typeof payload.name === 'string' ? payload.name.trim().split(/\s+/) : [];
  return {
    email,
    firstName: typeof payload.given_name === 'string' ? payload.given_name : display[0] || 'SSO',
    lastName: typeof payload.family_name === 'string' ? payload.family_name : display.slice(1).join(' ') || 'User',
    role: mappedRoles[0],
    tenantId,
  };
}

export async function exchangeAndVerify(request: NextRequest, code: string, verifier: string, nonce: string) {
  const document = await discover();
  const clientId = env('OIDC_CLIENT_ID');
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: oidcRedirectUri(request), client_id: clientId, code_verifier: verifier });
  const headers: Record<string, string> = { 'content-type': 'application/x-www-form-urlencoded' };
  if (process.env.OIDC_CLIENT_SECRET) headers.authorization = `Basic ${Buffer.from(`${clientId}:${process.env.OIDC_CLIENT_SECRET}`).toString('base64')}`;
  const tokenResponse = await fetch(document.token_endpoint, { method: 'POST', headers, body, cache: 'no-store' });
  if (!tokenResponse.ok) throw new Error(`OIDC token exchange failed (${tokenResponse.status})`);
  const tokens = await tokenResponse.json() as { id_token?: string };
  if (!tokens.id_token) throw new Error('OIDC response omitted id_token');
  const { payload } = await jwtVerify(tokens.id_token, createRemoteJWKSet(new URL(document.jwks_uri)), { issuer: document.issuer, audience: clientId, clockTolerance: 5 });
  if (!secureEqual(typeof payload.nonce === 'string' ? payload.nonce : undefined, nonce)) throw new Error('OIDC nonce mismatch');
  return sessionFromClaims(payload);
}
