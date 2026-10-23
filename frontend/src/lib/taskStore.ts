import { getPgKeyValue, setPgKeyValue } from '@/lib/postgres';
import type { PackTask } from '@/lib/featurePack';

const keyFor = (email: string) => 'tasks:' + email.toLowerCase();

export async function getTasks(email: string): Promise<PackTask[]> {
  return (await getPgKeyValue<PackTask[]>('feature_states', keyFor(email))) ?? [];
}

export async function saveTasks(email: string, tasks: PackTask[]) {
  await setPgKeyValue('feature_states', keyFor(email), tasks);
}
