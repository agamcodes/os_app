import * as SQLite from 'expo-sqlite';
import type { Settings } from '@/types/settings';
import type { Task, TaskDraft } from '@/types/task';

const DB_NAME = 'tasks.db';

interface TaskRow {
  id: string;
  title: string;
  note: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  created_at: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= openDb();
  return dbPromise;
}

async function openDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      note TEXT,
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  return db;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    note: row.note,
    dueDate: row.due_date,
    priority: row.priority === 'high' ? 'high' : 'normal',
    status: row.status === 'in_progress' || row.status === 'done' ? row.status : 'todo',
    createdAt: row.created_at,
  };
}

export async function loadTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TaskRow>('SELECT * FROM tasks ORDER BY created_at DESC');
  return rows.map(toTask);
}

export async function insertTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO tasks (id, title, note, due_date, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [task.id, task.title, task.note, task.dueDate, task.priority, task.status, task.createdAt],
  );
}

export async function updateTask(id: string, draft: TaskDraft): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE tasks SET title = ?, note = ?, due_date = ?, priority = ?, status = ? WHERE id = ?',
    [draft.title, draft.note, draft.dueDate, draft.priority, draft.status, id],
  );
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function clearTasks(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks');
}

export async function loadSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );
  const entries = new Map(rows.map((row) => [row.key, row.value]));
  const theme = entries.get('theme');
  return {
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
    reminders: entries.get('reminders') === 'true',
  };
}

export async function saveSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K],
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, String(value)],
  );
}
