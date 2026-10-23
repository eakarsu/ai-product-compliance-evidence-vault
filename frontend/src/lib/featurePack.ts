// Pure feature-pack helpers: record search/filter, export, tasks, and
// deterministic domain analysis. No imports, so it stays unit-testable.
export type PackRow = { id: string; name: string; status: string; owner: string; amount?: string; dueDate?: string; priority?: string };
export type PackTask = { id: string; title: string; detail: string; status: string; priority: string; owner: string; dueDate: string; entitySlug: string; createdBy: string; createdAt: string; updatedAt: string };
export type DomainFeature = { id: string; kind: 'triage' | 'readiness' | 'escalation'; title: string; description: string };

export const domainFeatures: DomainFeature[] = [
  { id: 'evidence-gap-analysis', kind: 'triage', title: 'Evidence Gap Analysis', description: 'Ranks compliance records by overdue, exception, and urgent evidence signals.' },
  { id: 'audit-readiness', kind: 'readiness', title: 'Audit Readiness Summary', description: 'Summarizes completion, ownership, and due-soon audit workload.' },
  { id: 'control-escalation-brief', kind: 'escalation', title: 'Control Escalation Brief', description: 'Builds an escalation brief from the highest-risk control records.' },
];

export const TASK_STATUSES = ['Open', 'In progress', 'Done'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export function filterEntityRows(rows: PackRow[], query = '', status = 'All'): PackRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesQuery = !q || [row.name, row.owner, row.status, row.dueDate || ''].join(' ').toLowerCase().includes(q);
    const matchesStatus = !status || status === 'All' || row.status === status;
    return matchesQuery && matchesStatus;
  });
}

export function filterTasks(tasks: PackTask[], query = '', status = 'All'): PackTask[] {
  const q = query.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesQuery = !q || [task.title, task.detail, task.owner, task.status].join(' ').toLowerCase().includes(q);
    return matchesQuery && (!status || status === 'All' || task.status === status);
  });
}

function csvCell(value: unknown): string {
  return '"' + String(value ?? '').replaceAll('"', '""') + '"';
}

export function recordsToCsv(rows: PackRow[]): string {
  const header = ['id', 'name', 'status', 'owner', 'amount', 'dueDate', 'priority'];
  const lines = rows.map((row) => [row.id, row.name, row.status, row.owner, row.amount || '', row.dueDate || '', row.priority || ''].map(csvCell).join(','));
  return [header.join(','), ...lines].join('\n');
}

export function parseAmount(value?: string): number {
  const n = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function validateTaskInput(body: unknown, partial = false): { errors: string[]; value: Partial<PackTask> } {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const errors: string[] = [];
  const value: Partial<PackTask> = {};
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title) value.title = title;
  else if (!partial) errors.push('title is required');
  if (typeof input.detail === 'string') value.detail = input.detail.trim();
  if (typeof input.owner === 'string') value.owner = input.owner.trim();
  if (typeof input.dueDate === 'string') value.dueDate = input.dueDate.trim();
  if (typeof input.entitySlug === 'string') value.entitySlug = input.entitySlug.trim();
  if (input.status !== undefined) {
    if (typeof input.status === 'string' && TASK_STATUSES.includes(input.status)) value.status = input.status;
    else errors.push('status must be one of: ' + TASK_STATUSES.join(', '));
  }
  if (input.priority !== undefined) {
    if (typeof input.priority === 'string' && TASK_PRIORITIES.includes(input.priority)) value.priority = input.priority;
    else errors.push('priority must be one of: ' + TASK_PRIORITIES.join(', '));
  }
  return { errors, value };
}

export function applyTaskPatch(task: PackTask, patch: Partial<PackTask>, nowIso: string): PackTask {
  return { ...task, ...patch, id: task.id, createdBy: task.createdBy, createdAt: task.createdAt, updatedAt: nowIso };
}

export function buildDomainFallback(featureId: string, setTitle: string, rows: PackRow[], nowIso: string): Record<string, unknown> {
  const feature = domainFeatures.find((item) => item.id === featureId) ?? domainFeatures[0];
  const today = nowIso.slice(0, 10);
  const horizon = new Date(new Date(today + 'T00:00:00Z').getTime() + 14 * 86400000).toISOString().slice(0, 10);
  const isOpen = (row: PackRow) => row.status !== 'Completed' && row.status !== 'Done';
  const byStatus: Record<string, number> = {};
  const ownerCounts = new Map<string, number>();
  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1;
    const owner = row.owner || 'Unassigned';
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
  }
  const overdue = rows.filter((row) => isOpen(row) && row.dueDate && row.dueDate < today);
  const dueSoon = rows.filter((row) => isOpen(row) && row.dueDate && row.dueDate >= today && row.dueDate <= horizon);
  const urgent = rows.filter((row) => isOpen(row) && (row.priority === 'Urgent' || row.status === 'Urgent'));
  const exceptions = rows.filter((row) => row.status === 'Exception');
  const unassigned = rows.filter((row) => !row.owner || row.owner === 'Unassigned');
  const completed = rows.filter((row) => !isOpen(row)).length;
  const atRisk = [...rows].filter(isOpen).sort((a, b) => {
    const score = (row: PackRow) => (row.dueDate && row.dueDate < today ? 4 : 0) + (row.status === 'Exception' ? 3 : 0) + (row.priority === 'Urgent' || row.status === 'Urgent' ? 2 : 0) + (row.dueDate && row.dueDate <= horizon ? 1 : 0);
    return score(b) - score(a) || String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'));
  }).slice(0, 8).map((row) => ({ name: row.name, status: row.status, owner: row.owner || 'Unassigned', dueDate: row.dueDate || '', priority: row.priority || '', amount: row.amount || '' }));
  const recommendedActions: string[] = [];
  if (overdue.length) recommendedActions.push('Escalate ' + overdue.length + ' overdue record(s) to their owners today.');
  if (exceptions.length) recommendedActions.push('Review ' + exceptions.length + ' exception record(s) and assign a remediation owner.');
  if (unassigned.length) recommendedActions.push('Assign owners to ' + unassigned.length + ' unassigned record(s).');
  if (dueSoon.length) recommendedActions.push('Confirm delivery for ' + dueSoon.length + ' record(s) due within 14 days.');
  const result: Record<string, unknown> = {
    feature: feature.id,
    featureTitle: feature.title,
    focus: feature.kind,
    recordSet: setTitle,
    generatedAt: nowIso,
    totalRecords: rows.length,
    openRecords: rows.length - completed,
    completedRecords: completed,
    completionRatePercent: rows.length ? Math.round((completed / rows.length) * 100) : 0,
    urgentRecords: urgent.length,
    exceptionRecords: exceptions.length,
    overdueRecords: overdue.length,
    dueSoonRecords: dueSoon.length,
    unassignedRecords: unassigned.length,
    hasOverdue: overdue.length > 0,
    hasUrgent: urgent.length > 0,
    hasUnassigned: unassigned.length > 0,
    totalAmount: rows.reduce((sum, row) => sum + parseAmount(row.amount), 0),
    byStatus,
    byOwner: [...ownerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([owner, records]) => ({ owner, records })),
    atRiskRecords: atRisk,
    recommendedActions,
  };
  if (feature.kind === 'escalation') {
    result.escalationExposureAmount = atRisk.reduce((sum, row) => sum + parseAmount(row.amount), 0);
    result.escalationCount = atRisk.length;
  }
  if (feature.kind === 'readiness') {
    result.readyRecords = rows.filter((row) => row.status === 'Ready' || row.status === 'Completed').length;
  }
  return result;
}
