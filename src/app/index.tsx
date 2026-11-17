import { useLayoutEffect, useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TaskRow } from '@/components/task-row';
import { GROUP_LABELS, GROUP_ORDER, groupTasks, toDateString } from '@/services/task-groups';
import { usePalette } from '@/services/theme';
import { useStore } from '@/services/store';
import type { Task } from '@/types/task';

interface TaskSection {
  key: string;
  title: string;
  data: Task[];
}

export default function HomeScreen() {
  const palette = usePalette();
  const router = useRouter();
  const navigation = useNavigation();
  const loaded = useStore((state) => state.loaded);
  const tasks = useStore((state) => state.tasks);
  const setTaskDone = useStore((state) => state.setTaskDone);

  const today = toDateString(new Date());
  const groups = useMemo(() => groupTasks(tasks, today), [tasks, today]);
  const sections = useMemo<TaskSection[]>(
    () =>
      GROUP_ORDER.filter((key) => groups[key].length > 0).map((key) => ({
        key,
        title: GROUP_LABELS[key],
        data: groups[key],
      })),
    [groups],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={styles.headerButton}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={palette.accent} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/task')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add task"
            style={styles.headerButton}
          >
            <MaterialCommunityIcons name="plus" size={26} color={palette.accent} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, router, palette]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(task) => task.id}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.content}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.secondaryText }]}>
            {section.title}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TaskRow
          task={item}
          today={today}
          onToggleDone={() => setTaskDone(item.id, item.status !== 'done')}
          onOpen={() => router.push({ pathname: '/task', params: { id: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={[styles.rowDivider, { backgroundColor: palette.separator }]} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={{ fontSize: 16, color: palette.secondaryText }}>No tasks</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
