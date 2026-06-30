import { CalendarDays, MessageSquare } from 'lucide-react';
import type { PublicUser, Task, TaskStatus } from '@/lib/types';
import { TASK_STATUSES, STATUS_LABELS } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { formatDate, isOverdue } from '@/lib/format';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListTodo } from 'lucide-react';

interface TaskListViewProps {
  tasks:      Task[];
  members:    PublicUser[];
  onOpenTask: (task: Task) => void;
  onMove:     (id: string, status: TaskStatus) => void;
}

export function TaskListView({ tasks, members, onOpenTask, onMove }: TaskListViewProps) {
  const memberMap = new Map(members.map(m => [m.id, m]));

  if (tasks.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <EmptyState icon={ListTodo} title="No tasks yet" description="Add a task from the toolbar to get started." />
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          {['Title', 'Status', 'Priority', 'Assignee', 'Due date', ''].map(h => (
            <th key={h} style={{
              padding: '0.625rem 1rem',
              textAlign: 'left', fontWeight: 600, fontSize: '0.75rem',
              color: 'var(--muted-foreground)', whiteSpace: 'nowrap',
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, i) => {
          const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : undefined;
          return (
            <tr
              key={task.id}
              style={{
                borderBottom: '1px solid var(--border)',
                backgroundColor: i % 2 === 0 ? 'var(--card)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--secondary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = i % 2 === 0 ? 'var(--card)' : 'transparent')}
            >
              {/* Title */}
              <td style={{ padding: '0.625rem 1rem', maxWidth: '24rem' }}>
                <button
                  onClick={() => onOpenTask(task)}
                  style={{
                    fontWeight: 500, color: 'var(--foreground)', background: 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem',
                    fontFamily: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '22rem',
                    display: 'block',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground)')}
                >
                  {task.title}
                </button>
                {task.commentCount > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                    <MessageSquare size={10} /> {task.commentCount}
                  </span>
                )}
              </td>

              {/* Status */}
              <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>
                <Select
                  value={task.status}
                  onChange={e => onMove(task.id, e.target.value as TaskStatus)}
                  style={{ width: 'auto', height: '1.875rem', fontSize: '0.8125rem' }}
                >
                  {TASK_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </Select>
              </td>

              {/* Priority */}
              <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>
                <PriorityBadge priority={task.priority} />
              </td>

              {/* Assignee */}
              <td style={{ padding: '0.625rem 1rem' }}>
                {assignee ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Avatar name={assignee.name} size="sm" />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{assignee.name}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>—</span>
                )}
              </td>

              {/* Due date */}
              <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>
                {task.dueDate ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem',
                    color: isOverdue(task.dueDate) ? 'var(--destructive)' : 'var(--muted-foreground)',
                  }}>
                    <CalendarDays size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>—</span>
                )}
              </td>

              {/* Open */}
              <td style={{ padding: '0.625rem 0.75rem' }}>
                <button
                  onClick={() => onOpenTask(task)}
                  style={{
                    fontSize: '0.75rem', color: 'var(--muted-foreground)',
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                >
                  Open →
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
