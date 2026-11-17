import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '@/services/theme';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const palette = usePalette();
  return (
    <View style={[styles.track, { backgroundColor: palette.segmentTrack, borderColor: palette.separator }]}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: palette.separator },
              selected && { backgroundColor: palette.segmentSelected },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                fontWeight: selected ? '600' : '400',
                color: selected ? palette.segmentSelectedText : palette.secondaryText,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
