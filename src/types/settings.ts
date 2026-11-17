export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemePreference;
  /** Whether due-date reminders are enabled in the app. */
  reminders: boolean;
}
