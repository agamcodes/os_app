import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '@/services/theme';

interface ListRowProps {
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
  /** Draws a hairline under the row. Defaults to true. */
  divider?: boolean;
}

export function ListRow({ label, onPress, trailing, danger = false, divider = true }: ListRowProps) {
  const palette = usePalette();
  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={onPress === undefined}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: palette.background },
          onPress !== undefined && pressed && { backgroundColor: palette.pressed },
        ]}
      >
        <Text style={[styles.label, { color: danger ? palette.danger : palette.text }]}>
          {label}
        </Text>
        {trailing !== undefined ? <View style={styles.trailing}>{trailing}</View> : null}
      </Pressable>
      {divider ? (
        <View style={[styles.divider, { backgroundColor: palette.separator }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 17,
    flexShrink: 1,
    marginRight: 12,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
