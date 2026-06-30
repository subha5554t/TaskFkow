import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Send } from 'lucide-react';
import type { PublicUser, Task } from '@/lib/types';
import { TASK_STATUSES, STATUS_LABELS, TASK_PRIORITIES, PRIORITY_LABELS } from '@/lib/types';
import type { TaskInput } from '@/lib/validators';
import { tasksApi } from '@/api';
import { getDb } from '@/lib/store';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

import { Avatar } from '@/components/ui/Avatar';
import { TaskFormModal } from './TaskFormModal';
import { fromNow } from '@/lib/format';

interface TaskDetailDrawerProps {
  task:      Task;
  projectId: string;
  members:   PublicUser[];
  onClose:   () => void;
  onUpdate:  (task: Task) => void;
}

export function TaskDetailDrawer({ task, projectId, members, onClose, onUpdate }: TaskDetailDrawerProps) {
  const queryClient  = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [comment,   setComment]   = useState('');

  const db = getDb();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task.id],
    queryFn:  () => tasksApi.listComments(task.id),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activity', task.id],
    queryFn:  () => tasksApi.listActivity(task.id),
  });

  const updateMutation = useMutation({
    mutationFn: (input: Partial<TaskInput>) => tasksApi.updateTask(task.id, input),
    onSuccess: updated => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity', task.id] });
      onUpdate(updated);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => tasksApi.addComment(task.id, { text: comment }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onUpdate({ ...task, commentCount: task.commentCount + 1 });
    },
  });


  return (
    <>
      <Drawer isOpen onClose={onClose} title={task.title}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil size={13} /> Edit
            </Button>
            <Button
              variant="outline" size="sm"
              style={{ color: 'var(--destructive)', borderColor: 'var(--destructive)' }}
              onClick={() => { if (confirm('Delete this task?')) deleteMutation.mutate(); }}
              isLoading={deleteMutation.isPending}
            >
              <Trash2 size={13} /> Delete
            </Button>
          </div>

          {/* Title & description */}
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
              {task.title}
            </h2>
            {task.description && (
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                {task.description}
              </p>
            )}
          </div>

          {/* Fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <FieldRow label="Status">
              <Select
                value={task.status}
                onChange={e => updateMutation.mutate({ status: e.target.value as Task['status'] })}
                style={{ height: '2rem', fontSize: '0.8125rem' }}
              >
                {TASK_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </Select>
            </FieldRow>

            <FieldRow label="Priority">
              <Select
                value={task.priority}
                onChange={e => updateMutation.mutate({ priority: e.target.value as Task['priority'] })}
                style={{ height: '2rem', fontSize: '0.8125rem' }}
              >
                {TASK_PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </Select>
            </FieldRow>

            <FieldRow label="Assignee">
              <Select
                value={task.assigneeId ?? ''}
                onChange={e => updateMutation.mutate({ assigneeId: e.target.value || undefined })}
                style={{ height: '2rem', fontSize: '0.8125rem' }}
              >
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </FieldRow>

            <FieldRow label="Due date">
              <input
                type="date"
                defaultValue={task.dueDate?.slice(0, 10) ?? ''}
                onChange={e => updateMutation.mutate({ dueDate: e.target.value })}
                style={{
                  height: '2rem', fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)', color: 'var(--foreground)',
                  padding: '0 0.5rem', width: '100%', fontFamily: 'inherit',
                }}
              />
            </FieldRow>
          </div>

          {/* Activity & comments */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.875rem' }}>
              Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1rem' }}>
              {/* Interleave comments and activities, sorted by date */}
              {[
                ...comments.map(c => ({ ...c, _type: 'comment' as const })),
                ...activities.map(a => ({ ...a, _type: 'activity' as const })),
              ]
                .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)
                .map(item => {
                  const user = db.users[item.userId];
                  if (item._type === 'comment') {
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                        {user && <Avatar name={user.name} size="sm" />}
                        <div style={{
                          flex: 1, borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', backgroundColor: 'var(--secondary)',
                          padding: '0.625rem 0.75rem',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.name ?? 'Unknown'}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{fromNow(item.createdAt)}</span>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.5 }}>{item.text}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      {user && <Avatar name={user.name} size="sm" />}
                      <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', flex: 1 }}>
                        <strong style={{ color: 'var(--foreground)', fontWeight: 500 }}>{user?.name ?? 'Unknown'}</strong>
                        {' '}{item.action.replace(/_/g, ' ')}
                        <span style={{ marginLeft: '0.375rem', fontSize: '0.6875rem', opacity: 0.7 }}>· {fromNow(item.createdAt)}</span>
                      </p>
                    </div>
                  );
                })
              }
            </div>

            {/* Comment input */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                style={{
                  flex: 1, resize: 'none', fontFamily: 'inherit',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)', color: 'var(--foreground)',
                  padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none',
                }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && comment.trim()) commentMutation.mutate(); }}
              />
              <Button
                size="sm"
                onClick={() => commentMutation.mutate()}
                isLoading={commentMutation.isPending}
                disabled={!comment.trim()}
              >
                <Send size={13} />
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {isEditing && (
        <TaskFormModal
          isOpen
          onClose={() => setIsEditing(false)}
          onSubmit={async input => {
            const updated = await tasksApi.updateTask(task.id, input);
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            onUpdate(updated);
            setIsEditing(false);
          }}
          isLoading={updateMutation.isPending}
          members={members}
          defaultStatus={task.status}
          task={task}
        />
      )}
    </>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{label}</p>
      {children}
    </div>
  );
}
