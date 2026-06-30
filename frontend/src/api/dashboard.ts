// Dashboard API — aggregates stats from mock store

import { getDb, sessionStore, delay } from '@/lib/store';
import { ApiError } from '@/lib/apiError';
import type { Activity, Task } from '@/lib/types';
import { isDueThisWeek, isOverdue } from '@/lib/format';

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
}

export async function getSummary(): Promise<DashboardData> {
  const userId = sessionStore.getUserId();
  if (!userId) throw new ApiError(401, 'Not authenticated');

  const db = getDb();
  await delay(null);

  // Only tasks from projects this user is a member of
  const myProjectIds = new Set(
    Object.values(db.projects)
      .filter(p => p.ownerId === userId || p.memberIds.includes(userId))
      .map(p => p.id)
  );

  const myTasks = Object.values(db.tasks).filter(t => myProjectIds.has(t.projectId));

  const now      = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats: DashboardStats = {
    activeTasks:        myTasks.filter(t => t.status !== 'DONE').length,
    dueThisWeek:        myTasks.filter(t => t.dueDate && isDueThisWeek(t.dueDate) && t.status !== 'DONE').length,
    overdue:            myTasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== 'DONE').length,
    completedThisMonth: myTasks.filter(t => t.status === 'DONE' && t.updatedAt >= thisMonthStart.toISOString()).length,
  };

  // Status distribution
  const statusCounts: Record<string, number> = {};
  myTasks.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
  });
  const statusDistribution: StatusDist[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(s => ({
    status: s,
    count:  statusCounts[s] ?? 0,
  }));

  // Upcoming deadlines (next 5 tasks with due dates, not done, sorted by date)
  const upcomingDeadlines = myTasks
    .filter(t => t.dueDate && t.status !== 'DONE')
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 5);

  // Recent activity (last 10)
  const recentActivity = Object.values(db.activities)
    .filter(a => myProjectIds.has(db.tasks[a.taskId]?.projectId ?? ''))
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 10);

  return { stats, statusDistribution, upcomingDeadlines, recentActivity };
}
