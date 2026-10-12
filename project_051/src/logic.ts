export type Status = 'todo' | 'doing' | 'done';
export type Priority = 'alta' | 'media' | 'baixa';
export interface Task { id: string; title: string; notes: string; status: Status; priority: Priority; due: string; createdAt: number }
export const STATUSES: { id: Status; label: string }[] = [
  { id: 'todo', label: 'A fazer' }, { id: 'doing', label: 'Em andamento' }, { id: 'done', label: 'Concluído' },
];
export interface Filter { query: string; priority: Priority | 'todas' }

export function validateTitle(t: string): string | null {
  const v = t.trim();
  if (!v) return 'Informe um título para a tarefa.';
  if (v.length > 80) return 'O título deve ter até 80 caracteres.';
  return null;
}
export function createTask(p: { title: string; notes?: string; priority?: Priority; due?: string }, now = Date.now()): Task {
  return { id: `t${now}${Math.floor(Math.random() * 1e5)}`, title: p.title.trim(), notes: p.notes?.trim() ?? '', status: 'todo', priority: p.priority ?? 'media', due: p.due ?? '', createdAt: now };
}
export function moveTask(tasks: Task[], id: string, status: Status): Task[] {
  return tasks.map(t => (t.id === id ? { ...t, status } : t));
}
export function filterTasks(tasks: Task[], f: Filter): Task[] {
  const q = f.query.trim().toLowerCase();
  return tasks.filter(t => (f.priority === 'todas' || t.priority === f.priority) && (!q || (t.title + ' ' + t.notes).toLowerCase().includes(q)));
}
const rank: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => rank[a.priority] - rank[b.priority] || (a.due || '9999').localeCompare(b.due || '9999') || a.createdAt - b.createdAt);
}
export function progress(tasks: Task[]): number {
  return tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
}
export function isOverdue(t: Task, today: string): boolean {
  return !!t.due && t.status !== 'done' && t.due < today;
}
export function loadTasks(storage: Pick<Storage, 'getItem'>, key = 'taskflow.tasks'): Task[] {
  try {
    const raw = JSON.parse(storage.getItem(key) ?? 'null');
    if (!Array.isArray(raw)) return [];
    return raw.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && ['todo', 'doing', 'done'].includes(t.status));
  } catch { return []; }
}
