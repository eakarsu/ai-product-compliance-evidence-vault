'use client';

import { useEffect, useState } from 'react';
import { TASK_PRIORITIES, TASK_STATUSES, type PackTask } from '@/lib/featurePack';

const emptyForm = { title: '', detail: '', priority: 'Medium', dueDate: '', owner: '' };

export default function TasksWorkspace() {
  const [tasks, setTasks] = useState<PackTask[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch('/api/tasks', { cache: 'no-store' });
    if (!response.ok) { setError('Unable to load tasks.'); return; }
    const payload = (await response.json()) as { tasks: PackTask[] };
    setTasks(payload.tasks);
  }

  useEffect(() => { void load().catch(() => setError('Unable to load tasks.')); }, []);

  const visible = tasks.filter((task) => {
    const q = query.trim().toLowerCase();
    return (!q || [task.title, task.detail, task.owner, task.status].join(' ').toLowerCase().includes(q)) && (statusFilter === 'All' || task.status === statusFilter);
  });

  async function create() {
    if (!form.title.trim()) return;
    setBusy(true);
    const response = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false);
    if (!response.ok) { setError('Unable to create task.'); return; }
    setForm(emptyForm);
    setError('');
    await load();
  }

  async function update(task: PackTask, status: string) {
    const response = await fetch('/api/tasks/' + task.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!response.ok) { setError('Unable to update task.'); return; }
    const payload = (await response.json()) as { task: PackTask };
    setTasks((current) => current.map((item) => (item.id === payload.task.id ? payload.task : item)));
  }

  return (
    <div className="card">
      <h3>My Tasks</h3>
      <div className="toolbar-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter tasks by status">
          <option>All</option>
          {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      {error ? <div style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div> : null}
      <div className="record-form-grid" style={{ marginTop: 12 }}>
        <label className="record-form-field span-2"><span>Title</span><input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Task title" /></label>
        <label className="record-form-field"><span>Priority</span><select value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}>{TASK_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label className="record-form-field"><span>Owner</span><input value={form.owner} onChange={(e) => setForm((s) => ({ ...s, owner: e.target.value }))} placeholder="Owner (defaults to you)" /></label>
        <label className="record-form-field"><span>Due Date</span><input type="date" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))} /></label>
        <label className="record-form-field span-2"><span>Detail</span><input value={form.detail} onChange={(e) => setForm((s) => ({ ...s, detail: e.target.value }))} placeholder="What needs to happen?" /></label>
      </div>
      <div className="button-row" style={{ marginTop: 10 }}>
        <button className="button primary" type="button" disabled={busy || !form.title.trim()} onClick={create}>Create task</button>
      </div>
      <div className="table-wrap" style={{ marginTop: 14 }}>
        <table className="data-table">
          <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Owner</th><th>Due Date</th><th>Update</th></tr></thead>
          <tbody>
            {visible.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.title}</strong>{task.detail ? <div className="muted">{task.detail}</div> : null}</td>
                <td><span className="status-chip">{task.status}</span></td>
                <td>{task.priority}</td>
                <td>{task.owner}</td>
                <td>{task.dueDate || 'Not set'}</td>
                <td><select value={task.status} aria-label={'Update status for ' + task.title} onChange={(e) => update(task, e.target.value)}>{TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length ? <p className="muted">No tasks match the current search and filter.</p> : null}
    </div>
  );
}
