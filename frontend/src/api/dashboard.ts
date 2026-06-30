
import api from './client';
import type { Activity, Task } from '@/lib/types';

export interface DashboardStats {
  activeTasks:        number;
  dueThisWeek:        number;
  overdue:            number;
  completedThisMonth: number;
}

export interface StatusDist {
  status: string;
  count:  number;
}

export interface DashboardData {
  stats:              DashboardStats;
  statusDistribution: StatusDist[];
  upcomingDeadlines:  Task[];
  recentActivity:     Activity[];
  completedLast7Days: { day: string; count: number }[];
}

export async function getSummary(): Promise<DashboardData> {
  const res = await api.get<{ success: boolean; data: any }>('/dashboard/summary');
  const raw = res.data.data;

  return {
    stats:              raw.stats,
    statusDistribution: raw.statusDistribution,
    completedLast7Days: (raw.completedLast7Days ?? []).map((d: any) => ({
      day:   d.day,
      count: Number(d.count),
    })),
    upcomingDeadlines: (raw.upcomingDeadlines ?? []).map((t: any) => ({
      id:          String(t.id),
      title:       t.title,
      dueDate:     t.dueDate,
      priority:    t.priority,
      status:      t.status,
      labels:      t.labels      ?? [],
      commentCount: t.commentCount ?? 0,
      projectId:   String(t.projectId ?? t.project?.id),
      createdById: String(t.createdById ?? ''),
      createdAt:   t.createdAt ?? '',
      updatedAt:   t.updatedAt ?? '',
    })),
    recentActivity: (raw.recentActivity ?? []).map((a: any) => ({
      id:        String(a.id),
      action:    a.action,
      meta:      a.meta ?? undefined,
      taskId:    String(a.taskId ?? a.task?.id),
      userId:    String(a.userId ?? a.user?.id),
      createdAt: a.createdAt,
    })),
  };
}
