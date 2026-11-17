import { useColorScheme } from 'react-native';
import type { ThemePreference } from '@/types/settings';
import { useStore } from '@/services/store';

export interface Palette {
  mode: 'light' | 'dark';
  background: string;
  text: string;
  secondaryText: string;
  placeholder: string;
  separator: string;
  accent: string;
  danger: string;
  pressed: string;
  segmentTrack: string;
  segmentSelected: string;
  segmentSelectedText: string;
}

const light: Palette = {
  mode: 'light',
  background: '#FFFFFF',
  text: '#111111',
  secondaryText: '#6E6E73',
  placeholder: '#8E8E93',
  separator: '#E5E5EA',
  accent: '#007AFF',
  danger: '#D70015',
  pressed: '#F2F2F4',
  segmentTrack: '#EFEFF2',
  segmentSelected: '#FFFFFF',
  segmentSelectedText: '#111111',
};

const dark: Palette = {
  mode: 'dark',
  background: '#0A0A0A',
  text: '#F5F5F7',
  secondaryText: '#98989E',
  placeholder: '#8E8E93',
  separator: '#2C2C2E',
  accent: '#0A84FF',
  danger: '#FF453A',
  pressed: '#1C1C1E',
  segmentTrack: '#1C1C1E',
  segmentSelected: '#545458',
  segmentSelectedText: '#FFFFFF',
};

export function resolveMode(preference: ThemePreference, system: string | null): 'light' | 'dark' {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

export function getPalette(mode: 'light' | 'dark'): Palette {
  return mode === 'dark' ? dark : light;
}

export function useThemeMode(): 'light' | 'dark' {
  const system = useColorScheme();
  const preference = useStore((state) => state.settings.theme);
  return resolveMode(preference, system);
}

export function usePalette(): Palette {
  return getPalette(useThemeMode());
}
