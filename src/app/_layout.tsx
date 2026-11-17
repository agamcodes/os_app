import { useEffect } from 'react';
import { Platform, UIManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@/services/store';
import { getPalette, useThemeMode } from '@/services/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RootLayout() {
  const mode = useThemeMode();
  const palette = getPalette(mode);
  const load = useStore((state) => state.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.accent,
          headerTitleStyle: { color: palette.text },
          headerShadowVisible: false,
          headerTransparent: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Tasks' }} />
        <Stack.Screen name="task" options={{ presentation: 'modal', title: 'New task' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}
