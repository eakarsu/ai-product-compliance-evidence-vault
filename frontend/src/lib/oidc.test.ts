import test from 'node:test';
import assert from 'node:assert/strict';
import { secureEqual, sessionFromClaims } from './oidc';

function configure() {
  process.env.OIDC_TENANT_CLAIM = 'tenant_id';
  process.env.OIDC_ROLE_CLAIM = 'groups';
  process.env.OIDC_ROLE_MAP_JSON = JSON.stringify({ vault_admin: 'admin', vault_manager: 'manager', vault_analyst: 'analyst' });
}

test('maps only approved OIDC groups and tenant claims into a session', () => {
  configure();
  const session = sessionFromClaims({ email: 'ANALYST@example.test', email_verified: true, groups: ['vault_analyst'], tenant_id: 'tenant-a', given_name: 'Ada', family_name: 'Lovelace' });
  assert.deepEqual(session, { email: 'analyst@example.test', firstName: 'Ada', lastName: 'Lovelace', role: 'analyst', tenantId: 'tenant-a' });
});

test('rejects unmapped roles, missing tenants, and explicitly unverified email', () => {
  configure();
  assert.throws(() => sessionFromClaims({ email: 'a@example.test', groups: ['unknown'], tenant_id: 'tenant-a' }), /approved role/);
  assert.throws(() => sessionFromClaims({ email: 'a@example.test', groups: ['vault_admin'] }), /approved role/);
  assert.throws(() => sessionFromClaims({ email: 'a@example.test', groups: ['vault_admin'], tenant_id: ['tenant-a', 'tenant-b'] }), /approved role/);
  assert.throws(() => sessionFromClaims({ email: 'a@example.test', groups: ['vault_admin', 'vault_analyst'], tenant_id: 'tenant-a' }), /approved role/);
  assert.throws(() => sessionFromClaims({ email: 'a@example.test', email_verified: false, groups: ['vault_admin'], tenant_id: 'tenant-a' }), /approved role/);
});

test('OIDC state and nonce comparison is exact', () => {
  assert.equal(secureEqual('same', 'same'), true);
  assert.equal(secureEqual('same', 'different'), false);
  assert.equal(secureEqual(undefined, 'same'), false);
});
