import UnifiedShell from '@/components/unified/UnifiedShell';
import TasksWorkspace from '@/components/unified/TasksWorkspace';

export default function TasksPage() {
  return (
    <UnifiedShell eyebrow="Operations" title="Tasks" subtitle="Authenticated follow-up tasks for this workspace. Create, search, filter, and update your own tasks.">
      <TasksWorkspace />
    </UnifiedShell>
  );
}
