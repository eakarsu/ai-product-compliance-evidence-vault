#!/bin/sh
set -eu
cd "$(dirname "$0")";mode="${1:-check}";required(){ eval "v=\${$1:-}";[ -n "$v" ]||{ echo "$1 is required" >&2;exit 1;};};config(){ required DATABASE_URL;required AUTH_SECRET;required DEFAULT_TENANT_ID;[ "${#AUTH_SECRET}" -ge 32 ]||{ echo 'AUTH_SECRET must be at least 32 characters' >&2;exit 1;};if [ "${NODE_ENV:-development}" = production ];then required OIDC_ISSUER;required OIDC_CLIENT_ID;required OIDC_TENANT_CLAIM;required OIDC_ROLE_MAP_JSON;fi;}
if [ "${NODE_ENV:-}" = test ]; then
  export AUTH_SECRET="${AUTH_SECRET:-${JWT_SECRET:-}}"
  export DEFAULT_TENANT_ID="${DEFAULT_TENANT_ID:-${TENANT_ID:-runtime-tenant}}"
  export COMPLIANCE_LOCAL_LOGIN_ACKNOWLEDGEMENT=runtime-disposable-database
fi
case "$mode" in check)(cd frontend&&npm run check);;migrate)config;[ "${ALLOW_SCHEMA_MIGRATION:-}" = 1 ]||{ echo 'Set ALLOW_SCHEMA_MIGRATION=1' >&2;exit 1;};psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f frontend/migrations/001_compliance_vault.sql;;start)config;(cd frontend&&npm run start -- -H 127.0.0.1 -p "${PORT:-5311}");;*)echo 'usage: ./start.sh check|migrate|start' >&2;exit 2;;esac
