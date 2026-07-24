#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -a
source "$project_dir/.env"
set +a
export COMPLIANCE_LOCAL_LOGIN_ACKNOWLEDGEMENT=runtime-disposable-database

for required in DATABASE_URL AUTH_SECRET DEFAULT_TENANT_ID BACKEND_PORT FRONTEND_PORT; do
  [ -n "${!required:-}" ] || { echo "$required is required" >&2; exit 1; }
done
for assigned_port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  lsof -nP -iTCP:"$assigned_port" -sTCP:LISTEN >/dev/null 2>&1 && { echo "assigned port $assigned_port is occupied" >&2; exit 1; }
done

cd "$project_dir"
case "${MIGRATE_ON_START:-0}" in
  1|true) for migration in frontend/migrations/*.sql; do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"; done;;
esac
npm --prefix backend run create-admin
npm --prefix frontend run dev -- -H 127.0.0.1 -p "$BACKEND_PORT" & app_pid=$!
terminate(){ kill "${app_pid:-}" "${proxy_pid:-}" 2>/dev/null || true; wait "${app_pid:-}" "${proxy_pid:-}" 2>/dev/null || true; }
trap terminate INT TERM EXIT
for attempt in {1..480}; do
  curl --max-time 2 -sS "http://127.0.0.1:$BACKEND_PORT/api/auth/me" >/dev/null 2>&1 && break
  kill -0 "$app_pid" 2>/dev/null || { wait "$app_pid" || true; echo 'application exited before startup' >&2; exit 1; }
  sleep 0.25
done
curl --max-time 5 -sS "http://127.0.0.1:$BACKEND_PORT/api/auth/me" >/dev/null || { echo 'application did not become ready' >&2; exit 1; }
RUNTIME_PROXY_PORT="$FRONTEND_PORT" RUNTIME_PROXY_TARGET_PORT="$BACKEND_PORT" node "$project_dir/_runtime-proxy.mjs" & proxy_pid=$!
wait "$app_pid" "$proxy_pid"
