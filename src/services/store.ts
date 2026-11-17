import { LayoutAnimation } from 'react-native';
import { create } from 'zustand';
import * as db from '@/db/database';
import * as notifications from '@/services/notifications';
import type { Settings, ThemePreference } from '@/types/settings';
import type { Task, TaskDraft } from '@/types/task';

interface AppState {
  loaded: boolean;
  tasks: Task[];
  settings: Settings;
  load: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (id: string, draft: TaskDraft) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTaskDone: (id: string, done: boolean) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  /** Enables or disables reminders. Returns false when permission was denied. */
  setReminders: (enabled: boolean) => Promise<boolean>;
  clearTasks: () => Promise<void>;
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function animate(): void {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

export const useStore = create<AppState>()((set, get) => ({
  loaded: false,
  tasks: [],
  settings: { theme: 'system', reminders: false },

  async load() {
    if (get().loaded) return;
    const [settings, tasks] = await Promise.all([db.loadSettings(), db.loadTasks()]);
    let effective = settings;
    if (settings.reminders && !(await notifications.hasPermissionAsync())) {
      await db.saveSetting('reminders', false);
      effective = { ...settings, reminders: false };
    }
    set({ settings: effective, tasks, loaded: true });
  },

  async addTask(draft) {
    const task: Task = { id: newId(), ...draft, createdAt: new Date().toISOString() };
    await db.insertTask(task);
    set((state) => ({ tasks: [...state.tasks, task] }));
    await notifications.updateReminder(task, get().settings.reminders);
  },

  async updateTask(id, draft) {
    const existing = get().tasks.find((task) => task.id === id);
    if (!existing) return;
    const task: Task = { ...existing, ...draft };
    await db.updateTask(id, draft);
    animate();
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? task : item)) }));
    await notifications.updateReminder(task, get().settings.reminders);
  },

  async deleteTask(id) {
    await db.deleteTask(id);
    await notifications.cancelReminder(id);
    animate();
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  async setTaskDone(id, done) {
    const existing = get().tasks.find((task) => task.id === id);
    if (!existing) return;
    const status = done ? 'done' : 'todo';
    const task: Task = { ...existing, status };
    await db.updateTask(id, { ...existing, status });
    animate();
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? task : item)) }));
    await notifications.updateReminder(task, get().settings.reminders);
  },

  async setTheme(theme) {
    await db.saveSetting('theme', theme);
    set((state) => ({ settings: { ...state.settings, theme } }));
  },

  async setReminders(enabled) {
    if (enabled) {
      const granted = await notifications.requestPermissionAsync();
      if (!granted) return false;
      await db.saveSetting('reminders', true);
      set((state) => ({ settings: { ...state.settings, reminders: true } }));
      await notifications.rescheduleAll(get().tasks);
      return true;
    }
    await db.saveSetting('reminders', false);
    set((state) => ({ settings: { ...state.settings, reminders: false } }));
    await notifications.cancelAllReminders();
    return true;
  },

  async clearTasks() {
    await db.clearTasks();
    await notifications.cancelAllReminders();
    animate();
    set({ tasks: [] });
  },
}));
