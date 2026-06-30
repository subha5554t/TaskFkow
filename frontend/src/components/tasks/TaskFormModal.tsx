import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PublicUser, Task } from '@/lib/types';
import { TASK_STATUSES, STATUS_LABELS, TASK_PRIORITIES, PRIORITY_LABELS, type TaskStatus } from '@/lib/types';
import { taskSchema, type TaskInput } from '@/lib/validators';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface TaskFormModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  onSubmit:      (data: TaskInput) => Promise<unknown>;
  isLoading:     boolean;
  members:       PublicUser[];
  defaultStatus: TaskStatus;
  task?:         Task;
}

export function TaskFormModal({
  isOpen, onClose, onSubmit, isLoading, members, defaultStatus, task,
}: TaskFormModalProps) {
  const isEdit = !!task;

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<TaskInput>({
      resolver: zodResolver(taskSchema),
      defaultValues: task
        ? {
            title:       task.title,
            description: task.description ?? '',
            status:      task.status,
            priority:    task.priority,
            dueDate:     task.dueDate?.slice(0, 10) ?? '',
            assigneeId:  task.assigneeId ?? '',
          }
        : {
            title:       '',
            description: '',
            status:      defaultStatus,
            priority:    'MEDIUM',
            dueDate:     '',
            assigneeId:  '',
          },
    });

  // Reset when defaultStatus changes (e.g. clicking + button in different columns)
  useEffect(() => {
    if (!isEdit && isOpen) {
      reset(v => ({ ...v, status: defaultStatus }));
    }
  }, [defaultStatus, isEdit, isOpen, reset]);

  const submit = handleSubmit(async data => {
    await onSubmit({ ...data, assigneeId: data.assigneeId || undefined });
    reset();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'New task'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-form" isLoading={isLoading}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Title" htmlFor="task-title" error={errors.title?.message} required>
          <Input id="task-title" {...register('title')} error={!!errors.title} placeholder="What needs to be done?" />
        </Field>

        <Field label="Description" htmlFor="task-desc" error={errors.description?.message}>
          <Textarea id="task-desc" {...register('description')} placeholder="Add more details…" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Status" htmlFor="task-status" error={errors.status?.message} required>
            <Select id="task-status" {...register('status')}>
              {TASK_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </Select>
          </Field>

          <Field label="Priority" htmlFor="task-priority" error={errors.priority?.message} required>
            <Select id="task-priority" {...register('priority')}>
              {TASK_PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </Select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Due date" htmlFor="task-due" error={errors.dueDate?.message}>
            <Input id="task-due" type="date" {...register('dueDate')} />
          </Field>

          <Field label="Assignee" htmlFor="task-assignee">
            <Select id="task-assignee" {...register('assigneeId')}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </Field>
        </div>
      </form>
    </Modal>
  );
}
