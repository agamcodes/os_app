import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import type { Task } from '@/types/task';

const CHANNEL_ID = 'reminders';
const REMINDER_HOUR = 9;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function reminderId(taskId: string): string {
  return `reminder-${taskId}`;
}

function reminderDate(dueDate: string): Date {
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day, REMINDER_HOUR, 0, 0, 0);
}

/** When the task should remind the user, or null if it should not remind at all. */
function nextReminder(task: Task): Date | null {
  if (task.status === 'done' || task.dueDate === null) return null;
  const date = reminderDate(task.dueDate);
  return date.getTime() > Date.now() ? date : null;
}

async function ensureChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    importance: AndroidImportance.DEFAULT,
  });
}

async function scheduleReminder(task: Task, date: Date): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: reminderId(task.id),
    content: { title: task.title, body: 'Due today' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    },
  });
}

export async function hasPermissionAsync(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** Prompts for notification permission. Returns whether it was granted. */
export async function requestPermissionAsync(): Promise<boolean> {
  await ensureChannelAsync();
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

/** Cancels the scheduled reminder for a single task, if there is one. */
export async function cancelReminder(taskId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId(taskId));
}

/** Reconciles the scheduled reminder for one task with its current state. */
export async function updateReminder(task: Task, enabled: boolean): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId(task.id));
  const date = nextReminder(task);
  if (!enabled || date === null || !(await hasPermissionAsync())) return;
  await scheduleReminder(task, date);
}

/** Replaces every scheduled reminder with the ones implied by the task list. */
export async function rescheduleAll(tasks: Task[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await hasPermissionAsync())) return;
  for (const task of tasks) {
    const date = nextReminder(task);
    if (date !== null) await scheduleReminder(task, date);
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
