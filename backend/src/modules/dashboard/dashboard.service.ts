import prisma from '../../config/db';

export async function getSummary(userId: number) {
  // Filter: only tasks in projects where the user is a member
  const memberFilter = {
    project: { members: { some: { userId } } },
  };

  const [
    statusCounts,
    overdueCount,
    dueThisWeekCount,
    completedThisMonthCount,
    activeTaskCount,
    completedLast7Days,
    upcomingDeadlines,
    recentActivity,
  ] = await Promise.all([
    prisma.task.groupBy({
      by:    ['status'],
      where: memberFilter,
      _count: { status: true },
    }),

    prisma.task.count({
      where: {
        ...memberFilter,
        dueDate: { lt: new Date() },
        status:  { not: 'DONE' },
      },
    }),

    prisma.task.count({
      where: {
        ...memberFilter,
        status:  { not: 'DONE' },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    prisma.task.count({
      where: {
        ...memberFilter,
        status:    'DONE',
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    prisma.task.count({
      where: { ...memberFilter, status: { not: 'DONE' } },
    }),

    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT
        date_trunc('day', t."updatedAt") AS day,
        count(*)::int                    AS count
      FROM   tasks t
      JOIN   project_members pm
        ON   pm."projectId" = t."projectId"
        AND  pm."userId"    = ${userId}
      WHERE  t.status       = 'DONE'
        AND  t."updatedAt"  > now() - interval '7 days'
      GROUP  BY day
      ORDER  BY day
    `,

    prisma.task.findMany({
      where: {
        ...memberFilter,
        status:  { not: 'DONE' },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: 'asc' },
      take:    5,
      select: {
        id:       true,
        title:    true,
        dueDate:  true,
        priority: true,
        status:   true,
        project:  { select: { id: true, name: true } },
      },
    }),

    prisma.activity.findMany({
      where:   { task: memberFilter },
      orderBy: { createdAt: 'desc' },
      take:    10,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    stats: {
      activeTasks:        activeTaskCount,
      dueThisWeek:        dueThisWeekCount,
      overdue:            overdueCount,
      completedThisMonth: completedThisMonthCount,
    },
    statusDistribution: statusCounts.map((s) => ({
      status: s.status,
      count:  s._count.status,
    })),
    completedLast7Days,
    upcomingDeadlines,
    recentActivity,
  };
}
