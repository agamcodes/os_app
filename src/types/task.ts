export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  note: string | null;
  /** Local calendar date as YYYY-MM-DD, or null when no due date is set. */
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt'>;
