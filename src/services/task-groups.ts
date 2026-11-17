import type { Task } from '@/types/task';

export type GroupKey = 'overdue' | 'today' | 'upcoming' | 'done';

export const GROUP_ORDER: GroupKey[] = ['overdue', 'today', 'upcoming', 'done'];

export const GROUP_LABELS: Record<GroupKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  done: 'Done',
};

/** Formats a date as a local YYYY-MM-DD string. */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Adds days to a YYYY-MM-DD string, handling month and year rollover. */
export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return toDateString(new Date(year, month - 1, day + days));
}

export function isOverdue(task: Task, today: string): boolean {
  return task.status !== 'done' && task.dueDate !== null && task.dueDate < today;
}

export function groupOf(task: Task, today: string): GroupKey {
  if (task.status === 'done') return 'done';
  if (task.dueDate === null) return 'upcoming';
  if (task.dueDate < today) return 'overdue';
  if (task.dueDate === today) return 'today';
  return 'upcoming';
}

function compareByDueDate(a: Task, b: Task): number {
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

/** Groups tasks into Overdue, Today, Upcoming and Done, each sorted for display. */
export function groupTasks(tasks: Task[], today: string): Record<GroupKey, Task[]> {
  const groups: Record<GroupKey, Task[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    done: [],
  };
  for (const task of tasks) {
    groups[groupOf(task, today)].push(task);
  }
  groups.overdue.sort(compareByDueDate);
  groups.today.sort(compareByDueDate);
  groups.upcoming.sort(compareByDueDate);
  groups.done.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return groups;
}

/** Short human label for a due date: Today, Tomorrow, Yesterday, or Mar 3. */
export function formatDueDate(dueDate: string | null, today: string): string | null {
  if (dueDate === null) return null;
  if (dueDate === today) return 'Today';
  if (dueDate === addDays(today, 1)) return 'Tomorrow';
  if (dueDate === addDays(today, -1)) return 'Yesterday';

  const [year, month, day] = dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const currentYear = Number(today.slice(0, 4));
  return year === currentYear ? monthDay : `${monthDay}, ${year}`;
}
