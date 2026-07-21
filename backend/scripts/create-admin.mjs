import crypto from 'node:crypto';
import pg from 'pg';

if (process.env.NODE_ENV !== 'test' && process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
  throw new Error('Refusing compliance identity provisioning without explicit acknowledgement');
}
const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');
const tenantId = String(process.env.TENANT_ID || process.env.GOVERNANCE_TENANT_ID || process.env.DEFAULT_TENANT_ID || '').trim();
const role = String(process.env.ADMIN_ROLE || 'admin');
if (!process.env.DATABASE_URL || !email || !email.includes('@') || password.length < 12 || !tenantId || !['admin', 'manager', 'analyst'].includes(role)) {
  throw new Error('DATABASE_URL, explicit ADMIN_EMAIL, strong ADMIN_PASSWORD, TENANT_ID, and a valid ADMIN_ROLE are required');
}
const salt = crypto.randomBytes(16);
const digest = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
const passwordHash = `scrypt$16384$8$1$${salt.toString('base64url')}$${digest.toString('base64url')}`;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const result = await pool.query(
    `INSERT INTO compliance_identities(id,tenant_id,email,password_hash,first_name,last_name,role,active)
     VALUES($1,$2,$3,$4,$5,$6,$7,TRUE)
     ON CONFLICT (tenant_id,email) DO UPDATE SET
       password_hash=EXCLUDED.password_hash,first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,role=EXCLUDED.role,active=TRUE,updated_at=NOW()
     RETURNING id`,
    [crypto.randomUUID(), tenantId, email, passwordHash, 'Runtime', 'Acceptance', role],
  );
  await pool.query('UPDATE compliance_sessions SET revoked_at=NOW() WHERE identity_id=$1 AND revoked_at IS NULL', [result.rows[0].id]);
} finally {
  await pool.end();
}
