import type { ActivityAction, TaskPriority, TaskStatus } from './types';
import { format, formatDistanceToNow, isPast, isWithinInterval, endOfWeek, startOfDay } from 'date-fns';

// ── Date helpers ───────────────────────────────────────────

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM d');
  } catch {
    return '';
  }
}

export function formatFullDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function fromNow(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  try {
    return isPast(new Date(dateStr));
  } catch {
    return false;
  }
}

export function isDueThisWeek(dateStr?: string): boolean {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    const now  = new Date();
    return isWithinInterval(date, {
      start: startOfDay(now),
      end:   endOfWeek(now, { weekStartsOn: 1 }),
    });
  } catch {
    return false;
  }
}

// ── Label helpers ──────────────────────────────────────────

export function statusLabel(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    TODO:        'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW:   'In Review',
    DONE:        'Done',
  };
  return map[status] ?? status;
}

export function priorityLabel(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    LOW:    'Low',
    MEDIUM: 'Medium',
    HIGH:   'High',
    URGENT: 'Urgent',
  };
  return map[priority] ?? priority;
}

// ── Activity text ──────────────────────────────────────────

export function activityText(
  action: ActivityAction,
  meta?: Record<string, unknown>,
): string {
  switch (action) {
    case 'task_created':
      return `created a task${meta?.title ? ` "${meta.title}"` : ''}`;
    case 'status_changed':
      return `moved task from ${statusLabel(meta?.from as TaskStatus)} to ${statusLabel(meta?.to as TaskStatus)}`;
    case 'priority_changed':
      return `changed priority to ${priorityLabel(meta?.to as TaskPriority)}`;
    case 'assignee_changed':
      return meta?.to ? `assigned task to ${meta.to}` : `removed assignee`;
    case 'comment_added':
      return `left a comment`;
    default:
      return action;
  }
}

// ── String helpers ─────────────────────────────────────────

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
