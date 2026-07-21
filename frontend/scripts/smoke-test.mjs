const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:5207';
const entitySlug = 'evidence-vault';
const smokePassword = process.env.SMOKE_PASSWORD;
if (!smokePassword) throw new Error('SMOKE_PASSWORD is required');

async function login(email, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Login failed for ${email}`);
  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new Error(`No session cookie for ${email}`);
  return cookie.split(';')[0];
}

async function expectStatus(path, cookie, status) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { cookie },
  });
  if (response.status !== status) {
    throw new Error(`${path} returned ${response.status}, expected ${status}`);
  }
  return response;
}

async function expectJson(path, cookie, status = 200) {
  const response = await expectStatus(path, cookie, status);
  return response.json();
}

const adminCookie = await login(process.env.SMOKE_ADMIN_EMAIL || 'admin@product-evidence.local', smokePassword);
const managerCookie = await login(process.env.SMOKE_MANAGER_EMAIL || 'manager@product-evidence.local', smokePassword);
const analystCookie = await login(process.env.SMOKE_ANALYST_EMAIL || 'analyst@product-evidence.local', smokePassword);

await expectJson('/api/dashboard', adminCookie);
await expectJson(`/api/entities/${entitySlug}`, analystCookie);
await expectJson('/api/documents', analystCookie);
await expectJson('/api/source-tables', adminCookie);
await expectStatus('/api/documents/upload', analystCookie, 405);

const records = await expectJson(`/api/entities/${entitySlug}`, managerCookie);
const rowId = records.rows[0].id;

const approveResponse = await fetch(`${baseUrl}/api/entities/${entitySlug}/approve`, {
  method: 'POST',
  headers: {
    cookie: managerCookie,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ rowId, approved: true }),
});
if (!approveResponse.ok) {
  throw new Error(`Manager approval failed with ${approveResponse.status}`);
}

const forbiddenApprove = await fetch(`${baseUrl}/api/entities/${entitySlug}/approve`, {
  method: 'POST',
  headers: {
    cookie: analystCookie,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ rowId, approved: false }),
});
if (forbiddenApprove.status !== 403) {
  throw new Error(`Analyst approval returned ${forbiddenApprove.status}, expected 403`);
}

console.log('Compliance evidence vault smoke passed');
