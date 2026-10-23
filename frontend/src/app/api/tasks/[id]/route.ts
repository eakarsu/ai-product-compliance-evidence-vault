import { NextRequest, NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/auditStore';
import { applyTaskPatch, validateTaskInput } from '@/lib/featurePack';
import { requireSession } from '@/lib/requestAuth';
import { getTasks, saveTasks } from '@/lib/taskStore';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;
  const tasks = await getTasks(session.email);
  const taskId = (await params).id;
  const existing = tasks.find((task) => task.id === taskId);
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  const body = await request.json().catch(() => null);
  const { errors, value } = validateTaskInput(body, true);
  if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });
  const updated = applyTaskPatch(existing, value, new Date().toISOString());
  await saveTasks(session.email, tasks.map((task) => (task.id === updated.id ? updated : task)));
  await appendAuditEntry('Tasks', session.email + ' updated task ' + updated.title);
  return NextResponse.json({ task: updated });
}
