import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ListRow } from '@/components/list-row';
import { useStore } from '@/services/store';
import { usePalette } from '@/services/theme';
import type { ThemePreference } from '@/types/settings';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const palette = usePalette();
  const theme = useStore((state) => state.settings.theme);
  const reminders = useStore((state) => state.settings.reminders);
  const setTheme = useStore((state) => state.setTheme);
  const setReminders = useStore((state) => state.setReminders);
  const clearTasks = useStore((state) => state.clearTasks);

  const onToggleReminders = async (value: boolean) => {
    if (!value) {
      await setReminders(false);
      return;
    }
    const granted = await setReminders(true);
    if (!granted) {
      Alert.alert('Notifications are off', 'Turn on notifications to get reminders.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const onClear = () => {
    Alert.alert('Clear all tasks', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearTasks() },
    ]);
  };

  const blockStyle = [
    styles.block,
    { borderTopColor: palette.separator, borderBottomColor: palette.separator },
  ];
  const labelStyle = [styles.sectionLabel, { color: palette.secondaryText }];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={labelStyle}>Appearance</Text>
      <View style={blockStyle}>
        {THEME_OPTIONS.map((option, index) => (
          <ListRow
            key={option.value}
            label={option.label}
            divider={index < THEME_OPTIONS.length - 1}
            onPress={() => setTheme(option.value)}
            trailing={
              theme === option.value ? (
                <MaterialCommunityIcons name="check" size={20} color={palette.accent} />
              ) : undefined
            }
          />
        ))}
      </View>

      <Text style={labelStyle}>Reminders</Text>
      <View style={blockStyle}>
        <ListRow
          label="Reminders"
          divider={false}
          trailing={<Switch value={reminders} onValueChange={onToggleReminders} />}
        />
      </View>

      <Text style={labelStyle}>Data</Text>
      <View style={blockStyle}>
        <ListRow label="Clear all tasks" danger divider={false} onPress={onClear} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 6,
  },
  block: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
