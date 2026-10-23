import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/auditStore';
import { applyTaskPatch, filterTasks, validateTaskInput, type PackTask } from '@/lib/featurePack';
import { requireSession } from '@/lib/requestAuth';
import { getTasks, saveTasks } from '@/lib/taskStore';

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const tasks = await getTasks(session.email);
  const filtered = filterTasks(tasks, request.nextUrl.searchParams.get('q') || '', request.nextUrl.searchParams.get('status') || 'All');
  return NextResponse.json({ tasks: filtered, total: tasks.length });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const body = await request.json().catch(() => null);
  const { errors, value } = validateTaskInput(body);
  if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });
  const now = new Date().toISOString();
  const task: PackTask = {
    id: 'task-' + crypto.randomUUID(),
    title: value.title || '',
    detail: value.detail || '',
    status: value.status || 'Open',
    priority: value.priority || 'Medium',
    owner: value.owner || session.email,
    dueDate: value.dueDate || '',
    entitySlug: value.entitySlug || '',
    createdBy: session.email,
    createdAt: now,
    updatedAt: now,
  };
  const tasks = await getTasks(session.email);
  await saveTasks(session.email, [task, ...tasks]);
  await appendAuditEntry('Tasks', session.email + ' created task ' + task.title);
  return NextResponse.json({ task }, { status: 201 });
}
