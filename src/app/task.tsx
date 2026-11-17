import { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ListRow } from '@/components/list-row';
import { Segmented } from '@/components/segmented';
import { formatDueDate, toDateString } from '@/services/task-groups';
import { useStore } from '@/services/store';
import { usePalette, useThemeMode } from '@/services/theme';
import type { Task, TaskDraft, TaskPriority, TaskStatus } from '@/types/task';

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
] as const;

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
] as const;

function toDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function TaskScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const loaded = useStore((state) => state.loaded);
  const existing = useStore((state) =>
    id ? state.tasks.find((task) => task.id === id) : undefined,
  );

  if (!loaded || (id !== undefined && existing === undefined)) return null;
  return <TaskForm key={id ?? 'new'} existing={existing ?? null} />;
}

function TaskForm({ existing }: { existing: Task | null }) {
  const palette = usePalette();
  const mode = useThemeMode();
  const router = useRouter();
  const navigation = useNavigation();
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [dueDate, setDueDate] = useState<string | null>(existing?.dueDate ?? null);
  const [priority, setPriority] = useState<TaskPriority>(existing?.priority ?? 'normal');
  const [status, setStatus] = useState<TaskStatus>(existing?.status ?? 'todo');
  const [pickerOpen, setPickerOpen] = useState(false);

  const canSave = title.trim().length > 0;
  const today = toDateString(new Date());

  const save = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const draft: TaskDraft = {
      title: trimmed,
      note: note.trim() || null,
      dueDate,
      priority,
      status,
    };
    if (existing) await updateTask(existing.id, draft);
    else await addTask(draft);
    router.back();
  }, [title, note, dueDate, priority, status, existing, addTask, updateTask, router]);

  const remove = useCallback(() => {
    if (!existing) return;
    Alert.alert('Delete task', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(existing.id);
          router.back();
        },
      },
    ]);
  }, [existing, deleteTask, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: existing ? 'Edit task' : 'New task',
      ...(Platform.OS === 'ios'
        ? {
            headerLeft: () => (
              <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
                <Text style={{ fontSize: 17, color: palette.accent }}>Cancel</Text>
              </Pressable>
            ),
          }
        : {}),
      headerRight: () => (
        <Pressable
          onPress={save}
          disabled={!canSave}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Save"
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: canSave ? palette.accent : palette.placeholder,
            }}
          >
            Save
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, router, existing, canSave, palette, save]);

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPickerOpen(false);
    if (event.type !== 'dismissed' && date) setDueDate(toDateString(date));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: palette.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={[styles.inputBlock, { marginTop: 16 }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={palette.placeholder}
            style={[styles.titleInput, { color: palette.text }]}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
            accessibilityLabel="Title"
          />
          <View style={[styles.inputDivider, { backgroundColor: palette.separator }]} />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note"
            placeholderTextColor={palette.placeholder}
            multiline
            style={[styles.noteInput, { color: palette.text }]}
            accessibilityLabel="Note"
          />
        </View>

        <View style={[styles.section, { borderTopColor: palette.separator, borderBottomColor: palette.separator }]}>
          <ListRow
            label="Due date"
            divider={false}
            onPress={() => setPickerOpen((open) => !open)}
            trailing={
              <View style={styles.dueTrailing}>
                <Text
                  style={{
                    fontSize: 16,
                    color: dueDate ? palette.text : palette.secondaryText,
                  }}
                >
                  {dueDate ? formatDueDate(dueDate, today) : 'None'}
                </Text>
                {dueDate ? (
                  <Pressable
                    onPress={() => {
                      setDueDate(null);
                      setPickerOpen(false);
                    }}
                    hitSlop={10}
                    accessibilityRole="button"
                  >
                    <Text style={{ fontSize: 16, color: palette.accent, marginLeft: 16 }}>
                      Clear
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            }
          />
          {pickerOpen ? (
            <View>
              <DateTimePicker
                value={dueDate ? toDate(dueDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                themeVariant={mode === 'dark' ? 'dark' : 'light'}
                onChange={onPickerChange}
              />
              {Platform.OS === 'ios' ? (
                <Pressable
                  onPress={() => setPickerOpen(false)}
                  style={styles.pickerDone}
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 17, color: palette.accent }}>Done</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: palette.secondaryText }]}>Priority</Text>
          <Segmented options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: palette.secondaryText }]}>Status</Text>
          <Segmented options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>

        {existing ? (
          <Pressable
            onPress={remove}
            style={styles.deleteRow}
            hitSlop={8}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={palette.danger} />
            <Text style={{ fontSize: 16, color: palette.danger, marginLeft: 8 }}>
              Delete task
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    paddingBottom: 48,
  },
  inputBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleInput: {
    fontSize: 17,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  noteInput: {
    fontSize: 16,
    minHeight: 96,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  section: {
    marginTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dueTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerDone: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  field: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    minHeight: 48,
    paddingHorizontal: 16,
  },
});
