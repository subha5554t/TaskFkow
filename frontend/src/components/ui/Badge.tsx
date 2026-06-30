import type { TaskPriority, TaskStatus } from '@/lib/types';
import { priorityLabel, statusLabel } from '@/lib/format';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'priority' | 'status';
  style?:   React.CSSProperties;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.5,
      ...style,
    }}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const colors: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
    LOW:    { bg: 'var(--secondary)',         text: 'var(--muted-foreground)', dot: 'var(--priority-low)' },
    MEDIUM: { bg: 'rgb(59 130 246 / 0.12)',   text: 'var(--priority-medium)',  dot: 'var(--priority-medium)' },
    HIGH:   { bg: 'rgb(245 158 11 / 0.12)',   text: 'var(--priority-high)',    dot: 'var(--priority-high)' },
    URGENT: { bg: 'rgb(239 68 68 / 0.12)',    text: 'var(--priority-urgent)',  dot: 'var(--priority-urgent)' },
  };
  const c = colors[priority];
  return (
    <Badge style={{ backgroundColor: c.bg, color: c.text }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0 }} />
      {priorityLabel(priority)}
    </Badge>
  );
}

export function StatusBadge({ status, _variant }: { status: TaskStatus; _variant?: 'outline' | 'solid' }) {
  const colors: Record<TaskStatus, { bg: string; text: string }> = {
    TODO:        { bg: 'var(--secondary)',         text: 'var(--muted-foreground)' },
    IN_PROGRESS: { bg: 'rgb(59 130 246 / 0.12)',   text: 'var(--status-in-progress)' },
    IN_REVIEW:   { bg: 'rgb(245 158 11 / 0.12)',   text: 'var(--status-in-review)' },
    DONE:        { bg: 'rgb(22 163 74 / 0.12)',    text: 'var(--status-done)' },
  };
  const c = colors[status];
  return (
    <Badge style={{ backgroundColor: c.bg, color: c.text }}>
      {statusLabel(status)}
    </Badge>
  );
}
