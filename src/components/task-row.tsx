import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDueDate } from '@/services/task-groups';
import { usePalette } from '@/services/theme';
import type { Task } from '@/types/task';

type StatusIconName = 'circle-outline' | 'circle-half-full' | 'check-circle';

interface TaskRowProps {
  task: Task;
  today: string;
  onToggleDone: () => void;
  onOpen: () => void;
}

export function TaskRow({ task, today, onToggleDone, onOpen }: TaskRowProps) {
  const palette = usePalette();
  const done = task.status === 'done';
  const noteLine = task.note?.split('\n')[0]?.trim() || null;
  const secondary = formatDueDate(task.dueDate, today) ?? noteLine;

  const statusIcon: StatusIconName = done
    ? 'check-circle'
    : task.status === 'in_progress'
      ? 'circle-half-full'
      : 'circle-outline';
  const statusColor = task.status === 'todo' ? palette.secondaryText : palette.accent;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: palette.pressed }]}
    >
      <Pressable
        onPress={onToggleDone}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={done ? 'Mark as to do' : 'Mark as done'}
        style={styles.statusButton}
      >
        <MaterialCommunityIcons name={statusIcon} size={24} color={statusColor} />
      </Pressable>

      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[styles.title, done && styles.titleDone, { color: done ? palette.secondaryText : palette.text }]}
        >
          {task.title}
        </Text>
        {secondary !== null ? (
          <Text numberOfLines={1} style={[styles.secondary, { color: palette.secondaryText }]}>
            {secondary}
          </Text>
        ) : null}
      </View>

      {task.priority === 'high' ? (
        <Text style={[styles.priority, { color: palette.secondaryText }]}>High</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 8,
  },
  statusButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  secondary: {
    fontSize: 14,
    marginTop: 2,
  },
  priority: {
    fontSize: 13,
    marginLeft: 8,
  },
});
