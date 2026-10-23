'use strict';const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const c=require('./compliance.cjs');const source={sourceId:'reg-1',sourceUri:'https://authority.example/reg-1',publisher:'Authority',jurisdiction:'US',effectiveAt:'2026-01-01',retrievedAt:'2026-02-01',version:'1',content:'requirement A'};
test('ingests authoritative source with versioned provenance',()=>{const x=c.ingest(source);assert.equal(x.contentDigest.length,64);assert.equal(x.provenanceDigest.length,64)});
test('rejects unproven or insecure sources',()=>{assert.throws(()=>c.ingest({...source,sourceUri:'http://example.test'}),/HTTPS/);assert.throws(()=>c.ingest({...source,jurisdiction:''}),/jurisdiction/)});
test('detects content/version changes and no-op replays',()=>{const old=c.ingest(source);assert.equal(c.detectChange(old,source).kind,'unchanged');assert.equal(c.detectChange(old,{...source,version:'2',content:'requirement B'}).kind,'changed')});
test('enforces policy lifecycle and least privilege',()=>{const p={status:'draft',ownerId:'a',reviewerId:null,evidenceLinks:['e1']};assert.equal(c.transition(p,'evidence_review',{id:'a',role:'author'}),true);assert.throws(()=>c.transition(p,'approved',{id:'x',role:'admin'}),/invalid/);assert.throws(()=>c.authorize('viewer','approve'),/forbidden/)});
test('enforces segregation of duties at approval',()=>{const p={status:'approval_pending',ownerId:'a',reviewerId:'r',evidenceLinks:['e1']};assert.throws(()=>c.transition(p,'approved',{id:'a',role:'approver'}),/segregation/);assert.equal(c.transition(p,'approved',{id:'p2',role:'approver'}),true)});
test('checks citations, obligations, deadlines and risk before release',()=>{const good={scenarioId:'s1',citations:[{id:'c1',sourceUri:'https://authority',sourceVersion:'1',contentDigest:'abc'}],obligations:[{id:'o1',ownerId:'u1',deadlineRequired:true,deadline:'2026-12-01',riskRating:'high'}]};assert.equal(c.evaluateScenario(good).releaseable,true);assert.equal(c.evaluateScenario({...good,citations:[]}).releaseable,false);assert.equal(c.evaluateScenario({...good,obligations:[{id:'o1',ownerId:'u1',deadlineRequired:true,riskRating:'unknown'}]}).passed,false)});
test('legal hold overrides expired retention',()=>{assert.equal(c.retention({legalHold:true,retainUntil:'2020-01-01'}).reason,'legal_hold');assert.equal(c.retention({legalHold:false,retainUntil:'2020-01-01'},new Date('2026-01-01')).action,'eligible_for_controlled_deletion')});
test('migration is additive with immutable decisions, versions and holds',()=>{const sql=fs.readFileSync(path.join(__dirname,'../frontend/migrations/001_compliance_vault.sql'),'utf8');for(const t of ['policy_versions','evidence_links','legal_hold','immutable_compliance_decision','source_provenance'])assert.match(sql,new RegExp(t));assert.doesNotMatch(sql,/DROP TABLE|TRUNCATE/i)});
test('launcher is explicit and non-destructive',()=>{const s=fs.readFileSync(path.join(__dirname,'../start.sh'),'utf8');assert.match(s,/check\|migrate\|start/);assert.doesNotMatch(s,/kill -9|npm install|seed|createdb/)});

// Feature pack wave 10C: record search/filter + export, tasks, domain AI fallback.
const fpFs = require('node:fs');
const fpPath = require('node:path');
const fpRoot = fpPath.resolve(__dirname, '..');
function fpLoad() {
  const ts = require(fpPath.join(fpRoot, 'frontend/node_modules/typescript'));
  const src = fpFs.readFileSync(fpPath.join(fpRoot, 'frontend/src/lib/featurePack.ts'), 'utf8');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', out)(mod, mod.exports, require);
  return mod.exports;
}
test('feature pack filters records by search text and status', () => {
  const fp = fpLoad();
  const rows = [
    { id: '1', name: 'Alpha review', status: 'Open', owner: 'Ann' },
    { id: '2', name: 'Beta check', status: 'Done', owner: 'Bob' },
  ];
  assert.equal(fp.filterEntityRows(rows, 'alpha', 'All').length, 1);
  assert.equal(fp.filterEntityRows(rows, '', 'Done')[0].id, '2');
  assert.equal(fp.filterEntityRows(rows, 'missing', 'All').length, 0);
});
test('feature pack exports records as escaped CSV', () => {
  const fp = fpLoad();
  const csv = fp.recordsToCsv([{ id: '1', name: 'A "quoted" review', status: 'Open', owner: 'Ann', amount: '$0', dueDate: '' }]);
  assert.match(csv, /^id,name,status,owner,amount,dueDate,priority/);
  assert.match(csv, /"A ""quoted"" review"/);
});
test('feature pack validates tasks and patches without changing identity', () => {
  const fp = fpLoad();
  assert.equal(fp.validateTaskInput({}).errors[0], 'title is required');
  assert.equal(fp.validateTaskInput({ title: ' x ', status: 'Nope' }).errors.length, 1);
  const task = { id: 't1', title: 'Old', detail: '', status: 'Open', priority: 'Low', owner: 'a@x.io', dueDate: '', entitySlug: '', createdBy: 'a@x.io', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
  const patched = fp.applyTaskPatch(task, { status: 'Done', id: 'hacked' }, '2026-02-01T00:00:00.000Z');
  assert.equal(patched.id, 't1');
  assert.equal(patched.status, 'Done');
  assert.equal(patched.updatedAt, '2026-02-01T00:00:00.000Z');
});
test('feature pack domain fallback preserves false zero and empty values', () => {
  const fp = fpLoad();
  const empty = fp.buildDomainFallback(fp.domainFeatures[0].id, 'Empty Records', [], '2026-06-15T00:00:00.000Z');
  assert.equal(empty.totalRecords, 0);
  assert.equal(empty.hasOverdue, false);
  assert.equal(empty.hasUrgent, false);
  assert.deepEqual(empty.atRiskRecords, []);
  assert.equal(empty.totalAmount, 0);
  const one = fp.buildDomainFallback(fp.domainFeatures[0].id, 'Set', [{ id: '1', name: 'Late item', status: 'Exception', owner: '', amount: '$10', dueDate: '2026-06-01', priority: 'Urgent' }], '2026-06-15T00:00:00.000Z');
  assert.equal(one.overdueRecords, 1);
  assert.equal(one.hasOverdue, true);
  assert.equal(one.unassignedRecords, 1);
});
test('feature pack routes require auth and label the deterministic fallback', () => {
  const read = (rel) => fpFs.readFileSync(fpPath.join(fpRoot, rel), 'utf8');
  assert.match(read('frontend/src/app/api/tasks/route.ts'), /requireSession/);
  assert.match(read('frontend/src/app/api/tasks/[id]/route.ts'), /requireSession/);
  assert.match(read('frontend/src/app/api/entities/[slug]/export/route.ts'), /text\/csv/);
  assert.match(read('frontend/src/app/api/entities/[slug]/export/route.ts'), /application\/json/);
  const domain = read('frontend/src/app/api/ai/domain/route.ts');
  assert.match(domain, /aiGenerated: false/);
  assert.match(domain, /deterministic-fallback/);
  assert.match(domain, /OPENROUTER_API_KEY/);
  assert.match(read('frontend/src/components/unified/EntityWorkspace.tsx'), /Export CSV/);
  assert.match(read('frontend/src/components/unified/EntityWorkspace.tsx'), /DomainAIPanel/);
});
