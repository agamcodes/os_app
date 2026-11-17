import {
  addDays,
  formatDueDate,
  groupOf,
  groupTasks,
  isOverdue,
  toDateString,
} from '@/services/task-groups';
import type { Task } from '@/types/task';

const TODAY = '2026-11-17';

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Pay rent',
    note: null,
    dueDate: null,
    priority: 'normal',
    status: 'todo',
    createdAt: '2026-11-10T09:00:00.000Z',
    ...overrides,
  };
}

describe('isOverdue', () => {
  it('is overdue when the due date is before today and the task is not done', () => {
    expect(isOverdue(task({ dueDate: '2026-11-16' }), TODAY)).toBe(true);
    expect(isOverdue(task({ dueDate: '2026-11-16', status: 'in_progress' }), TODAY)).toBe(true);
  });

  it('is not overdue for today, the future, missing dates, or done tasks', () => {
    expect(isOverdue(task({ dueDate: TODAY }), TODAY)).toBe(false);
    expect(isOverdue(task({ dueDate: '2026-11-20' }), TODAY)).toBe(false);
    expect(isOverdue(task({ dueDate: null }), TODAY)).toBe(false);
    expect(isOverdue(task({ dueDate: '2026-11-01', status: 'done' }), TODAY)).toBe(false);
  });
});

describe('groupOf', () => {
  it('sorts tasks into the four display groups', () => {
    expect(groupOf(task({ dueDate: '2026-11-15' }), TODAY)).toBe('overdue');
    expect(groupOf(task({ dueDate: TODAY }), TODAY)).toBe('today');
    expect(groupOf(task({ dueDate: '2026-12-01' }), TODAY)).toBe('upcoming');
    expect(groupOf(task({ dueDate: null }), TODAY)).toBe('upcoming');
    expect(groupOf(task({ dueDate: '2026-11-01', status: 'done' }), TODAY)).toBe('done');
  });
});

describe('groupTasks', () => {
  it('distributes every task exactly once', () => {
    const tasks = [
      task({ id: 'a', dueDate: '2026-11-15' }),
      task({ id: 'b', dueDate: TODAY }),
      task({ id: 'c', dueDate: '2026-12-01' }),
      task({ id: 'd', dueDate: null }),
      task({ id: 'e', dueDate: '2026-11-01', status: 'done' }),
    ];

    const groups = groupTasks(tasks, TODAY);

    expect(groups.overdue.map((item) => item.id)).toEqual(['a']);
    expect(groups.today.map((item) => item.id)).toEqual(['b']);
    expect(groups.upcoming.map((item) => item.id)).toEqual(['c', 'd']);
    expect(groups.done.map((item) => item.id)).toEqual(['e']);
  });

  it('sorts open tasks by due date, then priority, with undated tasks last', () => {
    const tasks = [
      task({ id: 'no-date', dueDate: null }),
      task({ id: 'later', dueDate: '2026-11-30' }),
      task({ id: 'soon-normal', dueDate: '2026-11-20', priority: 'normal' }),
      task({ id: 'soon-high', dueDate: '2026-11-20', priority: 'high' }),
      task({ id: 'earlier', dueDate: '2026-11-18' }),
    ];

    const groups = groupTasks(tasks, TODAY);

    expect(groups.upcoming.map((item) => item.id)).toEqual([
      'earlier',
      'soon-high',
      'soon-normal',
      'later',
      'no-date',
    ]);
  });

  it('sorts overdue tasks with the oldest due date first', () => {
    const tasks = [
      task({ id: 'recent', dueDate: '2026-11-16' }),
      task({ id: 'old', dueDate: '2026-11-02' }),
    ];

    expect(groupTasks(tasks, TODAY).overdue.map((item) => item.id)).toEqual(['old', 'recent']);
  });
});

describe('date helpers', () => {
  it('formats local dates with zero padding', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays(TODAY, 7)).toBe('2026-11-24');
  });

  it('labels near dates in plain language', () => {
    expect(formatDueDate(null, TODAY)).toBeNull();
    expect(formatDueDate(TODAY, TODAY)).toBe('Today');
    expect(formatDueDate(addDays(TODAY, 1), TODAY)).toBe('Tomorrow');
    expect(formatDueDate(addDays(TODAY, -1), TODAY)).toBe('Yesterday');
  });
});
