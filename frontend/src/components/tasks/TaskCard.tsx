import { CalendarDays, MessageSquare } from 'lucide-react';
import type { PublicUser, Task } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, isOverdue } from '@/lib/format';

interface TaskCardProps {
  task:      Task;
  assignee?: PublicUser;
  onClick?:  () => void;
  dragging?: boolean;
}

export function TaskCard({ task, assignee, onClick, dragging }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        padding: '0.75rem',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        opacity: dragging ? 0.6 : 1,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit',
        display: 'block',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--muted-foreground)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', lineHeight: 1.4, marginBottom: '0.625rem' }}>
        {task.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <PriorityBadge priority={task.priority} />
        {assignee && <Avatar name={assignee.name} size="sm" />}
      </div>

      {(task.dueDate || task.commentCount > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.625rem', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
          {task.dueDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: isOverdue(task.dueDate) ? 'var(--destructive)' : undefined }}>
              <CalendarDays size={11} />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.commentCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <MessageSquare size={11} />
              {task.commentCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
